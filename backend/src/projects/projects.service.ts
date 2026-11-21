import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { markDeleted, withoutDeletedMark } from '../accounts/deleted-marks.js';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { nextCode } from '../codes/readable-codes.js';
import { pageWindow, type Paging } from '../common/paging.js';
import type {
  Prisma,
  ProjectItemStatus,
  ProjectStatus,
} from '../generated/prisma/client.js';
import { can } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import {
  FileStorageService,
  type UploadedFile,
} from '../uploads/file-storage.service.js';
import { ProjectEventsService } from './project-events.service.js';
import {
  calendarDay,
  MAX_ITEMS,
  progressOf,
  PROJECT_STATUSES,
  type NewProjectInput,
  type ProjectDetailsInput,
} from './project-rules.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;
const TEAM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER'] as const;

/** The list's tabs: a status, or the deleted projects. */
export type ProjectTab = ProjectStatus | 'deleted' | 'all';

export const notFound = () =>
  new NotFoundException({
    code: 'PROJECT_NOT_FOUND',
    message: 'This project does not exist.',
  });

/** What a project page shows, for the team and (without notes) the portal. */
const pageSelect = {
  id: true,
  code: true,
  name: true,
  type: true,
  status: true,
  description: true,
  startDate: true,
  targetDate: true,
  liveDate: true,
  supportUntil: true,
  liveUrl: true,
  testUrl: true,
  builtWith: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  customerId: true,
  lead: { select: { id: true, name: true, jobTitle: true } },
  items: {
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      title: true,
      detail: true,
      status: true,
      doneAt: true,
    },
  },
  updates: {
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    select: {
      id: true,
      body: true,
      createdAt: true,
      editedAt: true,
      author: { select: { name: true } },
      files: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, fileName: true, contentType: true, size: true },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

type PageRow = Prisma.ProjectGetPayload<{ select: typeof pageSelect }>;

/** The parts of a project page both the team and the customer see. */
export function sharedPage(project: PageRow) {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    type: project.type,
    status: project.status,
    description: project.description,
    startDate: calendarDay(project.startDate),
    targetDate: calendarDay(project.targetDate),
    liveDate: calendarDay(project.liveDate),
    supportUntil: calendarDay(project.supportUntil),
    liveUrl: project.liveUrl,
    testUrl: project.testUrl,
    builtWith: project.builtWith,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    lead: project.lead,
    progress: progressOf(project.items),
    items: project.items,
    updates: project.updates.map((update) => ({
      id: update.id,
      body: update.body,
      createdAt: update.createdAt,
      editedAt: update.editedAt,
      authorName: update.author.name,
      files: update.files,
    })),
  };
}

export { pageSelect };

/**
 * Projects (the Projects menu and each project's page): details, "What's
 * included" (items), progress and updates. Super admins and admins change
 * them (customers.manage); managers look (customers.view); deleting and
 * restoring is projects.delete. The controller checks these.
 */
@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: FileStorageService,
    private readonly events: ProjectEventsService,
  ) {}

  // ------------------------------------------------------------ the list

  async list(
    actor: SignedIn,
    options: { q?: string; tab: ProjectTab; customerId?: string },
    paging: Paging,
  ) {
    const search = options.q?.trim();
    const base: Prisma.ProjectWhereInput = {
      customer: { deletedAt: null },
      ...(options.customerId ? { customerId: options.customerId } : {}),
    };
    const where: Prisma.ProjectWhereInput = {
      ...base,
      ...(options.tab === 'deleted'
        ? { deletedAt: { not: null } }
        : { deletedAt: null }),
      ...(options.tab !== 'deleted' && options.tab !== 'all'
        ? { status: options.tab }
        : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { name: { contains: search } },
              { customer: { company: { contains: search } } },
              {
                customer: {
                  contactUser: { is: { name: { contains: search } } },
                },
              },
            ],
          }
        : {}),
    };

    const total = await this.prisma.project.count({ where });
    const window = pageWindow(paging, total);
    const [byStatus, deleted, rows] = await Promise.all([
      this.prisma.project.groupBy({
        by: ['status'],
        where: { ...base, deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.project.count({
        where: { ...base, deletedAt: { not: null } },
      }),
      this.prisma.project.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        skip: window.skip,
        take: window.take,
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          status: true,
          targetDate: true,
          deletedAt: true,
          customer: { select: { id: true, company: true } },
          lead: { select: { name: true } },
          items: { select: { status: true } },
        },
      }),
    ]);
    const open = await this.prisma.supportRequest.groupBy({
      by: ['projectId'],
      where: {
        projectId: { in: rows.map((row) => row.id) },
        status: { in: [...OPEN_STATUSES] },
      },
      _count: { _all: true },
    });

    const counts = Object.fromEntries(
      PROJECT_STATUSES.map((status) => [
        status,
        byStatus.find((row) => row.status === status)?._count._all ?? 0,
      ]),
    ) as Record<ProjectStatus, number>;
    return {
      summary: {
        all: Object.values(counts).reduce((sum, n) => sum + n, 0),
        ...counts,
        deleted,
      },
      can: {
        manage: can(actor, 'customers.manage'),
        delete: can(actor, 'projects.delete'),
      },
      total,
      page: window.page,
      pageSize: window.pageSize,
      rows: rows.map(({ items, targetDate, ...row }) => ({
        ...row,
        targetDate: calendarDay(targetDate),
        lead: row.lead?.name ?? null,
        progress: progressOf(items),
        openRequests:
          open.find((count) => count.projectId === row.id)?._count._all ?? 0,
      })),
    };
  }

  /** Add project: the customers to choose from and the possible leads. */
  async choices() {
    const [customers, leads] = await Promise.all([
      this.prisma.customer.findMany({
        where: { deletedAt: null, contactUser: { isNot: null } },
        orderBy: { company: 'asc' },
        select: { id: true, company: true },
      }),
      this.leadChoices(),
    ]);
    return { customers, leads };
  }

  // ------------------------------------------------------------ one project

  async detail(actor: SignedIn, code: string) {
    const project = await this.prisma.project.findFirst({
      where: { code, customer: { deletedAt: null } },
      select: {
        ...pageSelect,
        teamNotes: true,
        deletedBy: { select: { name: true } },
        customer: {
          select: {
            id: true,
            company: true,
            contactUser: { select: { name: true, status: true } },
          },
        },
      },
    });
    if (!project) throw notFound();
    const manage = can(actor, 'customers.manage');
    const [open, total] = await Promise.all([
      this.prisma.supportRequest.count({
        where: { projectId: project.id, status: { in: [...OPEN_STATUSES] } },
      }),
      this.prisma.supportRequest.count({ where: { projectId: project.id } }),
    ]);
    return {
      ...sharedPage(project),
      teamNotes: project.teamNotes,
      deletedAt: project.deletedAt,
      deletedBy: project.deletedBy?.name ?? null,
      customer: {
        id: project.customer.id,
        company: project.customer.company,
        contactName: project.customer.contactUser?.name ?? null,
        contactStatus: project.customer.contactUser?.status ?? null,
      },
      requests: { open, total },
      can: {
        manage: manage && !project.deletedAt,
        delete: can(actor, 'projects.delete'),
      },
      leadChoices: manage ? await this.leadChoices() : [],
    };
  }

  /** Add project from the Projects menu (or a customer's page). */
  async create(actor: SignedIn, input: NewProjectInput) {
    await this.checkLead(input.leadId);
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: input.customerId, deletedAt: null },
        select: { id: true },
      });
      if (!customer) {
        throw new BadRequestException({
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Choose a customer.',
        });
      }
      const project = await tx.project.create({
        data: {
          code: await nextCode(tx, 'project'),
          name: input.name,
          type: input.type,
          customerId: customer.id,
          description: input.description,
          startDate: input.startDate,
          targetDate: input.targetDate,
          leadId: input.leadId,
          items: {
            create: input.items.map((title, position) => ({ title, position })),
          },
        },
        select: { id: true, code: true },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.added',
          entityType: 'project',
          entityId: project.id,
          data: { code: project.code, customerId: customer.id },
        },
        tx,
      );
      return { code: project.code };
    }, TX);
  }

  /** Edit details: every field, including name, type and lead. */
  async updateDetails(
    actor: SignedIn,
    code: string,
    input: ProjectDetailsInput,
  ) {
    await this.checkLead(input.leadId);
    return this.prisma.$transaction(async (tx) => {
      const before = await tx.project.findFirst({
        where: { code, deletedAt: null, customer: { deletedAt: null } },
      });
      if (!before) throw notFound();
      const changed = (
        Object.keys(input) as (keyof ProjectDetailsInput)[]
      ).filter((key) => !same(before[key], input[key]));
      if (!changed.length) return { code };
      await tx.project.update({ where: { id: before.id }, data: input });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.updated',
          entityType: 'project',
          entityId: before.id,
          data: {
            code,
            changed,
            from: { name: before.name, type: before.type },
            to: { name: input.name, type: input.type },
          },
        },
        tx,
      );
      return { code };
    }, TX);
  }

  async setStatus(actor: SignedIn, code: string, status: ProjectStatus) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.findActive(code, tx);
      if (project.status === status) return { code, status };
      await tx.project.update({ where: { id: project.id }, data: { status } });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.statusChanged',
          entityType: 'project',
          entityId: project.id,
          data: { code, from: project.status, to: status },
        },
        tx,
      );
      return { code, status };
    }, TX);
  }

  // ------------------------------------------------------------ items

  /** Adds items at the end of the list, several lines at once. */
  async addItems(code: string, titles: string[]) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.findActive(code, tx);
      const [count, last] = await Promise.all([
        tx.projectItem.count({ where: { projectId: project.id } }),
        tx.projectItem.findFirst({
          where: { projectId: project.id },
          orderBy: { position: 'desc' },
          select: { position: true },
        }),
      ]);
      if (count + titles.length > MAX_ITEMS) {
        throw new BadRequestException({
          code: 'TOO_MANY_ITEMS',
          message: `A project can list up to ${MAX_ITEMS} items. It has ${count}.`,
        });
      }
      const start = (last?.position ?? -1) + 1;
      await tx.projectItem.createMany({
        data: titles.map((title, index) => ({
          projectId: project.id,
          title,
          position: start + index,
        })),
      });
      return { added: titles.length };
    }, TX);
  }

  async updateItem(
    code: string,
    itemId: string,
    input: {
      title?: string;
      detail?: string | null;
      status?: ProjectItemStatus;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const item = await this.findItem(code, itemId, tx);
      const status = input.status ?? item.status;
      await tx.projectItem.update({
        where: { id: item.id },
        data: {
          ...(input.title !== undefined
            ? { title: input.title, detail: input.detail ?? null }
            : {}),
          status,
          // Done keeps its first date; leaving Done clears it.
          doneAt: status === 'DONE' ? (item.doneAt ?? new Date()) : null,
        },
      });
      return { id: item.id, status };
    }, TX);
  }

  /** Swaps the item with the one above or below it. */
  async moveItem(code: string, itemId: string, direction: 'up' | 'down') {
    return this.prisma.$transaction(async (tx) => {
      const item = await this.findItem(code, itemId, tx);
      const items = await tx.projectItem.findMany({
        where: { projectId: item.projectId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      });
      const from = items.findIndex((row) => row.id === item.id);
      const to = direction === 'up' ? from - 1 : from + 1;
      if (to < 0 || to >= items.length) return { moved: false };
      [items[from], items[to]] = [items[to], items[from]];
      // Numbered again from 0, so old gaps and equal numbers disappear.
      for (const [position, row] of items.entries()) {
        await tx.projectItem.update({
          where: { id: row.id },
          data: { position },
        });
      }
      return { moved: true };
    }, TX);
  }

  async removeItem(code: string, itemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await this.findItem(code, itemId, tx);
      await tx.projectItem.delete({ where: { id: item.id } });
      return { removed: true };
    }, TX);
  }

  // ------------------------------------------------------------ updates

  /** Posts an update with up to 5 files; the customer hears about it. */
  async postUpdate(
    actor: SignedIn,
    code: string,
    body: string,
    files: UploadedFile[],
  ) {
    const project = await this.findActive(code);
    if (!body && !files.length) {
      throw new BadRequestException({
        code: 'EMPTY_UPDATE',
        message: 'Write the update or attach a file.',
      });
    }
    const checked = await this.storage.check(files);
    const keys = await this.storage.keepIn(checked, `projects/${project.id}`);
    let updateId: string;
    try {
      updateId = await this.prisma.$transaction(async (tx) => {
        const update = await tx.projectUpdate.create({
          data: { projectId: project.id, body, authorId: actor.id },
          select: { id: true },
        });
        if (checked.length) {
          await tx.projectFile.createMany({
            data: checked.map((file, index) => ({
              projectId: project.id,
              updateId: update.id,
              fileName: file.fileName,
              contentType: file.contentType,
              size: file.size,
              storageKey: keys[index],
              uploadedById: actor.id,
            })),
          });
        }
        await this.events.updatePosted(tx, project);
        return update.id;
      }, TX);
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }

    const items = await this.prisma.projectItem.findMany({
      where: { projectId: project.id },
      select: { status: true },
    });
    const emailSent = await this.events.emailUpdate(
      project,
      { authorName: actor.name, body, files: checked.length },
      progressOf(items),
    );
    return { id: updateId, emailSent };
  }

  /** Corrects an update's text. No new email. */
  async editUpdate(code: string, updateId: string, body: string) {
    return this.prisma.$transaction(async (tx) => {
      const update = await this.findUpdate(code, updateId, tx);
      if (!body && !update._count.files) {
        throw new BadRequestException({
          code: 'EMPTY_UPDATE',
          message: 'Write the update, or remove it.',
        });
      }
      await tx.projectUpdate.update({
        where: { id: update.id },
        data: { body, editedAt: new Date() },
      });
      return { id: update.id };
    }, TX);
  }

  /** Removes an update and its files (the files go from the disk too). */
  async removeUpdate(actor: SignedIn, code: string, updateId: string) {
    const keys = await this.prisma.$transaction(async (tx) => {
      const update = await this.findUpdate(code, updateId, tx);
      const files = await tx.projectFile.findMany({
        where: { updateId: update.id },
        select: { storageKey: true },
      });
      await tx.projectUpdate.delete({ where: { id: update.id } });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.updateRemoved',
          entityType: 'project',
          entityId: update.projectId,
          data: { code, files: files.length },
        },
        tx,
      );
      return files.map((file) => file.storageKey);
    }, TX);
    await this.storage.remove(keys);
    return { removed: true };
  }

  /** A file on an update, for the team (deleted projects too). */
  async file(code: string, fileId: string) {
    const file = await this.prisma.projectFile.findFirst({
      where: { id: fileId, project: { code, customer: { deletedAt: null } } },
      select: {
        fileName: true,
        contentType: true,
        size: true,
        storageKey: true,
      },
    });
    if (!file) throw notFound();
    return { ...file, stream: this.storage.read(file.storageKey) };
  }

  // ------------------------------------------------------------ delete

  /**
   * Delete project. Refused while it has open requests. With no requests
   * and no updates it goes for good; otherwise it is hidden and kept as
   * history, its name marked "(deleted)", and Restore brings it back.
   */
  async remove(actor: SignedIn, code: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await this.findActive(code, tx);
      const [open, requests, updates] = await Promise.all([
        tx.supportRequest.count({
          where: { projectId: project.id, status: { in: [...OPEN_STATUSES] } },
        }),
        tx.supportRequest.count({ where: { projectId: project.id } }),
        tx.projectUpdate.count({ where: { projectId: project.id } }),
      ]);
      if (open) {
        throw new ConflictException({
          code: 'HAS_OPEN_REQUESTS',
          open,
          message: `Move or close its ${open} open request${open > 1 ? 's' : ''} first.`,
        });
      }
      const forGood = !requests && !updates;
      if (forGood) {
        await tx.project.delete({ where: { id: project.id } });
      } else {
        await tx.project.update({
          where: { id: project.id },
          data: {
            deletedAt: new Date(),
            deletedById: actor.id,
            name: markDeleted(project.name, 160),
          },
        });
      }
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.deleted',
          entityType: 'project',
          entityId: project.id,
          data: { code, name: project.name, forGood },
        },
        tx,
      );
      return { forGood };
    }, TX);
  }

  async restore(actor: SignedIn, code: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.findFirst({
        where: {
          code,
          deletedAt: { not: null },
          customer: { deletedAt: null },
        },
        select: { id: true, name: true },
      });
      if (!project) throw notFound();
      const name = withoutDeletedMark(project.name);
      await tx.project.update({
        where: { id: project.id },
        data: { deletedAt: null, deletedById: null, name },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'project.restored',
          entityType: 'project',
          entityId: project.id,
          data: { code, name },
        },
        tx,
      );
      return { code };
    }, TX);
  }

  // ------------------------------------------------------------ helpers

  /** Active team members who can lead a project. */
  private leadChoices() {
    return this.prisma.user.findMany({
      where: { role: { in: [...TEAM_ROLES] }, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, jobTitle: true },
    });
  }

  private async checkLead(leadId: string | null) {
    if (!leadId) return;
    const lead = await this.prisma.user.findFirst({
      where: { id: leadId, role: { in: [...TEAM_ROLES] }, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!lead) {
      throw new BadRequestException({
        code: 'NOT_A_TEAM_MEMBER',
        message: 'Choose an active team member as the lead.',
      });
    }
  }

  /** A project that is not deleted, of a customer that is not deleted. */
  private async findActive(
    code: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const project = await tx.project.findFirst({
      where: { code, deletedAt: null, customer: { deletedAt: null } },
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        customerId: true,
      },
    });
    if (!project) throw notFound();
    return project;
  }

  private async findItem(
    code: string,
    itemId: string,
    tx: Prisma.TransactionClient,
  ) {
    const project = await this.findActive(code, tx);
    const item = await tx.projectItem.findFirst({
      where: { id: itemId, projectId: project.id },
    });
    if (!item) throw notFound();
    return item;
  }

  private async findUpdate(
    code: string,
    updateId: string,
    tx: Prisma.TransactionClient,
  ) {
    const project = await this.findActive(code, tx);
    const update = await tx.projectUpdate.findFirst({
      where: { id: updateId, projectId: project.id },
      select: {
        id: true,
        projectId: true,
        _count: { select: { files: true } },
      },
    });
    if (!update) throw notFound();
    return update;
  }
}

/** For "what changed": dates compare by their day, everything else as is. */
function same(before: unknown, after: unknown): boolean {
  if (before instanceof Date || after instanceof Date) {
    return (
      (before instanceof Date ? before.getTime() : before) ===
      (after instanceof Date ? after.getTime() : after)
    );
  }
  return (before ?? null) === (after ?? null);
}
