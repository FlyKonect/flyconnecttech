import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import type {
  Prisma,
  Priority,
  RequestStatus,
  RequestType,
} from '../generated/prisma/client.js';
import { allowedStatuses, can, requestScope } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import {
  FileStorageService,
  type UploadedFile,
} from '../uploads/file-storage.service.js';
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from './labels.js';
import { RequestEventsService } from './request-events.service.js';
import {
  ALL_STATUSES,
  changedMeanwhile,
  countOf,
  moveStatus,
  REQUEST_TX,
  requestNotFound,
  saveFiles,
  stateSelect,
  systemLine,
  type RequestState,
} from './request-writes.js';
import { dueTimes } from './sla.js';
import { TeamDashboardService } from './team-dashboard.service.js';
import { pageWindow, type Paging } from '../common/paging.js';

/** The newest rows the requests list shows at once. */

/** The ?status= values in the team's addresses (lib/team-nav.ts). */
export const STATUS_SLUGS: Record<string, RequestStatus> = {
  submitted: 'SUBMITTED',
  'under-review': 'UNDER_REVIEW',
  'in-progress': 'IN_PROGRESS',
  'waiting-for-customer': 'WAITING_FOR_CUSTOMER',
  resolved: 'RESOLVED',
  closed: 'CLOSED',
};

/** The design's "Request more info" message, the starting text of the dialog. */
export const REQUEST_INFO_TEXT =
  'Could you share a screenshot of the error and roughly when it happened? That will help us reproduce it.';

const rowSelect = {
  code: true,
  title: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  dueAt: true,
  resolveDueAt: true,
  firstResponseAt: true,
  slaPausedAt: true,
  resolvedAt: true,
  project: { select: { name: true } },
  customer: {
    select: { company: true, contactUser: { select: { name: true } } },
  },
  assignee: { select: { name: true } },
} satisfies Prisma.SupportRequestSelect;

export type ListFilters = {
  status?: RequestStatus;
  search?: string;
  projectId?: string;
  priority?: Priority;
  /** A developer's id, or "unassigned". */
  assignee?: string;
};

const finished = (status: RequestStatus) =>
  status === 'RESOLVED' || status === 'CLOSED';

/**
 * Support requests as the team sees and works on them (screens 21 to 25).
 *
 * Every read goes through requestScope(): developers only ever reach the
 * requests assigned to them, and anything else is "not found". What each
 * role may change comes from policies.ts (the controller's @Can and the
 * status limits here).
 */
@Injectable()
export class TeamRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: FileStorageService,
    private readonly settings: SettingsService,
    private readonly events: RequestEventsService,
    private readonly dashboard: TeamDashboardService,
    private readonly audit: AuditService,
  ) {}

  /** The requests list: tab counts, one page of matching rows (newest first), filter choices. */
  async list(actor: SignedIn, filters: ListFilters, paging: Paging) {
    const search = filters.search?.trim();
    const where: Prisma.SupportRequestWhereInput = {
      AND: [
        requestScope(actor),
        search
          ? {
              OR: [
                { code: { contains: search } },
                { title: { contains: search } },
                { customer: { company: { contains: search } } },
                { customer: { contactUser: { name: { contains: search } } } },
              ],
            }
          : {},
        filters.projectId ? { projectId: filters.projectId } : {},
        filters.priority ? { priority: filters.priority } : {},
        filters.assignee === 'unassigned'
          ? { assigneeId: null }
          : filters.assignee
            ? { assigneeId: filters.assignee }
            : {},
      ],
    };
    const shown: Prisma.SupportRequestWhereInput = filters.status
      ? { AND: [where, { status: filters.status }] }
      : where;

    const total = await this.prisma.supportRequest.count({ where: shown });
    const window = pageWindow(paging, total);
    const [groups, rows, projects, developers] = await Promise.all([
      this.prisma.supportRequest.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.supportRequest.findMany({
        where: shown,
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        skip: window.skip,
        take: window.take,
        select: rowSelect,
      }),
      this.projectChoices(actor),
      can(actor, 'requests.assign') ? this.dashboard.developers() : [],
    ]);

    return {
      tabs: {
        all: countOf(groups, ...ALL_STATUSES),
        new: countOf(groups, 'SUBMITTED'),
        underReview: countOf(groups, 'UNDER_REVIEW'),
        inProgress: countOf(groups, 'IN_PROGRESS'),
        waiting: countOf(groups, 'WAITING_FOR_CUSTOMER'),
        resolved: countOf(groups, 'RESOLVED'),
        closed: countOf(groups, 'CLOSED'),
      },
      rows: rows.map(({ customer, ...row }) => ({
        ...row,
        customer: {
          company: customer.company,
          name: customer.contactUser?.name ?? null,
        },
      })),
      total,
      page: window.page,
      pageSize: window.pageSize,
      projects,
      developers: developers.map(({ id, name }) => ({ id, name })),
    };
  }

  /** One request with everything the team sees, internal notes included. */
  async detail(actor: SignedIn, code: string) {
    const request = await this.prisma.supportRequest.findFirst({
      where: { code, ...requestScope(actor) },
      select: {
        code: true,
        title: true,
        description: true,
        url: true,
        type: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        dueAt: true,
        resolveDueAt: true,
        slaPausedAt: true,
        resolvedAt: true,
        firstResponseAt: true,
        projectId: true,
        project: { select: { code: true, name: true, type: true } },
        assignee: { select: { id: true, name: true, jobTitle: true } },
        customer: {
          select: {
            id: true,
            company: true,
            country: true,
            contactUser: {
              select: { name: true, email: true, phone: true, country: true },
            },
          },
        },
        messages: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            kind: true,
            body: true,
            createdAt: true,
            author: { select: { id: true, name: true, role: true } },
          },
        },
        attachments: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            messageId: true,
            fileName: true,
            contentType: true,
            size: true,
            createdAt: true,
            uploadedBy: { select: { name: true } },
          },
        },
        statusChanges: {
          orderBy: { createdAt: 'asc' },
          select: { to: true, createdAt: true },
        },
      },
    });
    if (!request) throw requestNotFound();

    const { messages, attachments, statusChanges, customer, ...rest } = request;
    const contact = customer.contactUser;
    return {
      ...rest,
      customer: {
        id: customer.id,
        company: customer.company,
        country: customer.country ?? contact?.country ?? null,
        name: contact?.name ?? null,
        email: contact?.email ?? null,
        phone: contact?.phone ?? null,
      },
      messages: messages.map((message) => ({
        id: message.id,
        kind: message.kind,
        body: message.body,
        createdAt: message.createdAt,
        author: message.author
          ? {
              name: message.author.name,
              customer: message.author.role === 'CUSTOMER',
              you: message.author.id === actor.id,
            }
          : null,
      })),
      files: attachments.map(({ uploadedBy, ...file }) => ({
        ...file,
        uploadedBy: uploadedBy.name,
      })),
      history: statusChanges.map((change) => ({
        status: change.to,
        at: change.createdAt,
      })),
      can: {
        assign: can(actor, 'requests.assign'),
        changePriority: can(actor, 'requests.changePriority'),
        close: can(actor, 'requests.close'),
        edit: can(actor, 'requests.edit'),
        statuses: allowedStatuses(actor),
      },
      // For Edit details: the customer's other projects.
      projectChoices: can(actor, 'requests.edit')
        ? await this.prisma.project.findMany({
            where: { customerId: customer.id },
            orderBy: { name: 'asc' },
            select: { id: true, code: true, name: true },
          })
        : [],
      requestInfoText: REQUEST_INFO_TEXT,
    };
  }

  /**
   * Correct a request (requests.edit): its title, type or project. The
   * project must belong to the same customer. A line in the conversation
   * says what changed, and the audit log keeps the old values.
   */
  async updateDetails(
    actor: SignedIn,
    code: string,
    input: { title?: string; type?: RequestType; projectId?: string },
  ) {
    const request = await this.findTeam(actor, code);
    const before = await this.prisma.supportRequest.findUniqueOrThrow({
      where: { id: request.id },
      select: {
        title: true,
        type: true,
        projectId: true,
        project: { select: { name: true } },
      },
    });
    let projectName: string | null = null;
    if (input.projectId && input.projectId !== before.projectId) {
      const project = await this.prisma.project.findFirst({
        where: { id: input.projectId, customerId: request.customerId },
        select: { name: true },
      });
      if (!project) {
        throw new BadRequestException({
          code: 'NOT_THEIR_PROJECT',
          message: "Choose one of this customer's projects.",
        });
      }
      projectName = project.name;
    }
    const data: { title?: string; type?: RequestType; projectId?: string } = {};
    const parts: string[] = [];
    if (input.title && input.title !== before.title) {
      data.title = input.title;
      parts.push('title');
    }
    if (input.type && input.type !== before.type) {
      data.type = input.type;
      parts.push(`type to ${TYPE_LABELS[input.type]}`);
    }
    if (projectName && input.projectId) {
      data.projectId = input.projectId;
      parts.push(`project to ${projectName}`);
    }
    if (!parts.length) return { ok: true };

    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await tx.supportRequest.update({
        where: { id: request.id },
        data: { ...data, updatedAt: now },
      });
      await systemLine(
        tx,
        request.id,
        `${actor.name} changed the ${parts.join(', the ')}`,
        now,
      );
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'request.updated',
          entityType: 'request',
          entityId: request.id,
          data: {
            code: request.code,
            from: {
              title: before.title,
              type: before.type,
              project: before.project.name,
            },
            to: data,
          },
        },
        tx,
      );
    }, REQUEST_TX);
    return { ok: true };
  }

  /**
   * "Reply to customer" or "Internal note", with up to 5 files. Files on
   * an internal note stay with the note: customers never see them.
   */
  async message(
    actor: SignedIn,
    code: string,
    input: { kind: 'reply' | 'note'; body: string },
    files: UploadedFile[] = [],
  ) {
    const request = await this.findTeam(actor, code);
    const reply = input.kind === 'reply';
    const body = input.body.trim();
    if (!body && !files.length) {
      throw new BadRequestException({
        code: 'EMPTY_MESSAGE',
        message: 'Write a message or attach a file.',
      });
    }
    const checked = await this.storage.check(files);
    const keys = await this.storage.keep(checked, request.id);
    try {
      await this.saveMessage(actor, request, reply, body, checked, keys);
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }
    if (reply) {
      await this.events.emailTeamReply(request, actor.name, body);
    }
    return { ok: true };
  }

  private async saveMessage(
    actor: SignedIn,
    request: RequestState,
    reply: boolean,
    body: string,
    checked: Awaited<ReturnType<FileStorageService['check']>>,
    keys: string[],
  ) {
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const message = await tx.requestMessage.create({
        data: {
          requestId: request.id,
          authorId: actor.id,
          kind: reply ? 'STAFF_REPLY' : 'INTERNAL_NOTE',
          body,
          createdAt: now,
        },
      });
      await saveFiles(tx, checked, keys, request.id, actor.id, message.id);
      // An internal note changes nothing the customer can see, not even
      // the request's "last updated" time.
      if (reply) {
        await this.markReplied(tx, request, now);
        await this.events.teamReplied(tx, request, actor.name);
      }
    }, REQUEST_TX);
  }

  /** A status chip. Developers only have three statuses (policies.ts). */
  async setStatus(actor: SignedIn, code: string, to: RequestStatus) {
    this.mayMoveTo(actor, to);
    const request = await this.findTeam(actor, code);
    if (request.status === to) return { status: to };
    const targets = await this.settings.slaRules();
    await this.prisma.$transaction(async (tx) => {
      const moved = await moveStatus(tx, request, to, {
        actorId: actor.id,
        line: `Status changed to ${STATUS_LABELS[to]} by ${actor.name}`,
        now: new Date(),
        targets,
      });
      if (!moved) throw changedMeanwhile();
      await this.events.statusChanged(tx, request, to);
    }, REQUEST_TX);
    await this.events.emailStatusChanged(request, to);
    return { status: to };
  }

  /** A priority chip. The due time follows the new priority. */
  async setPriority(actor: SignedIn, code: string, priority: Priority) {
    const request = await this.findTeam(actor, code);
    if (request.priority === priority) return { priority };
    const targets = await this.settings.slaRules();
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const changed = await tx.supportRequest.updateMany({
        where: { id: request.id, priority: request.priority },
        data: {
          priority,
          updatedAt: now,
          ...(finished(request.status)
            ? {}
            : dueTimes(request.createdAt, priority, targets)),
        },
      });
      if (changed.count !== 1) throw changedMeanwhile();
      await systemLine(
        tx,
        request.id,
        `Priority changed to ${PRIORITY_LABELS[priority]}`,
        now,
      );
    }, REQUEST_TX);
    return { priority };
  }

  /**
   * Assign, reassign or transfer to an active developer (screen 23).
   * A Submitted request moves to Under Review.
   */
  async assign(
    actor: SignedIn,
    code: string,
    input: { developerId: string; transfer: boolean },
  ) {
    const request = await this.findTeam(actor, code);
    const developer = await this.prisma.user.findFirst({
      where: { id: input.developerId, role: 'DEVELOPER', status: 'ACTIVE' },
      select: { id: true, name: true, email: true },
    });
    if (!developer) {
      throw new BadRequestException({
        code: 'NOT_A_DEVELOPER',
        message: 'Choose an active developer.',
      });
    }
    if (request.assigneeId === developer.id) return { ok: true };

    const previous = request.assigneeId
      ? await this.prisma.user.findUnique({
          where: { id: request.assigneeId },
          select: { name: true },
        })
      : null;
    const line =
      input.transfer && previous
        ? `Transferred from ${previous.name} to ${developer.name} by ${actor.name}`
        : `Assigned to ${developer.name} by ${actor.name}`;
    const targets = await this.settings.slaRules();

    const toReview = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const changed = await tx.supportRequest.updateMany({
        where: { id: request.id, assigneeId: request.assigneeId },
        data: { assigneeId: developer.id, updatedAt: now },
      });
      if (changed.count !== 1) throw changedMeanwhile();
      await systemLine(tx, request.id, line, now);
      const moved =
        request.status === 'SUBMITTED' &&
        (await moveStatus(tx, request, 'UNDER_REVIEW', {
          actorId: actor.id,
          line: null,
          now: new Date(now.getTime() + 1),
          targets,
        }));
      await this.events.assigned(tx, request, developer);
      if (moved) await this.events.statusChanged(tx, request, 'UNDER_REVIEW');
      return moved;
    }, REQUEST_TX);

    await this.events.emailAssigned(request, developer, actor.name);
    if (toReview) {
      await this.events.emailStatusChanged(request, 'UNDER_REVIEW');
    }
    return { ok: true };
  }

  /** "Request more info": a reply to the customer, then Waiting for Customer. */
  async requestInfo(actor: SignedIn, code: string, body: string) {
    this.mayMoveTo(actor, 'WAITING_FOR_CUSTOMER');
    const request = await this.findTeam(actor, code);
    const targets = await this.settings.slaRules();
    const waiting = request.status === 'WAITING_FOR_CUSTOMER';

    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      await this.staffReply(tx, request, actor.id, body, now);
      if (waiting) {
        await this.events.teamReplied(tx, request, actor.name);
        return;
      }
      const moved = await moveStatus(tx, request, 'WAITING_FOR_CUSTOMER', {
        actorId: actor.id,
        line: null,
        now: new Date(now.getTime() + 1),
        targets,
      });
      if (!moved) throw changedMeanwhile();
      await this.events.statusChanged(tx, request, 'WAITING_FOR_CUSTOMER');
    }, REQUEST_TX);

    // One email: the question goes inside the "needs more information" one.
    if (waiting) await this.events.emailTeamReply(request, actor.name, body);
    else {
      await this.events.emailStatusChanged(
        request,
        'WAITING_FOR_CUSTOMER',
        body,
      );
    }
    return { status: 'WAITING_FOR_CUSTOMER' as const };
  }

  /** The resolve dialog (screen 25). */
  async resolve(
    actor: SignedIn,
    code: string,
    input: { summary: string; email: boolean },
  ) {
    this.mayMoveTo(actor, 'RESOLVED');
    const request = await this.findTeam(actor, code);
    if (request.status === 'RESOLVED') {
      throw new ConflictException({
        code: 'ALREADY_RESOLVED',
        message: 'This request is already resolved.',
      });
    }
    const targets = await this.settings.slaRules();
    await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      if (input.summary) {
        await this.staffReply(tx, request, actor.id, input.summary, now);
      }
      const moved = await moveStatus(tx, request, 'RESOLVED', {
        actorId: actor.id,
        line: null,
        now: new Date(now.getTime() + 1),
        targets,
      });
      if (!moved) throw changedMeanwhile();
      await this.events.statusChanged(tx, request, 'RESOLVED');
    }, REQUEST_TX);
    if (input.email) {
      await this.events.emailStatusChanged(
        request,
        'RESOLVED',
        input.summary || undefined,
      );
    }
    return { status: 'RESOLVED' as const };
  }

  /** "Close request" (not for developers). */
  async close(actor: SignedIn, code: string) {
    const request = await this.findTeam(actor, code);
    if (request.status === 'CLOSED') throw changedMeanwhile();
    const targets = await this.settings.slaRules();
    await this.prisma.$transaction(async (tx) => {
      const moved = await moveStatus(tx, request, 'CLOSED', {
        actorId: actor.id,
        line: `${actor.name} closed this request`,
        now: new Date(),
        targets,
      });
      if (!moved) throw changedMeanwhile();
      await this.events.statusChanged(tx, request, 'CLOSED');
    }, REQUEST_TX);
    await this.events.emailStatusChanged(request, 'CLOSED');
    return { status: 'CLOSED' as const };
  }

  /** A file to download, from a request this person may see. */
  async file(actor: SignedIn, code: string, fileId: string) {
    const request = await this.findTeam(actor, code);
    const file = await this.prisma.attachment.findFirst({
      where: { id: fileId, requestId: request.id },
      select: {
        fileName: true,
        contentType: true,
        size: true,
        storageKey: true,
      },
    });
    if (!file) throw requestNotFound();
    return { ...file, stream: this.storage.read(file.storageKey) };
  }

  // ------------------------------------------------------------ helpers

  private async findTeam(actor: SignedIn, code: string): Promise<RequestState> {
    const request = await this.prisma.supportRequest.findFirst({
      where: { code, ...requestScope(actor) },
      select: stateSelect,
    });
    if (!request) throw requestNotFound();
    return request;
  }

  private mayMoveTo(actor: SignedIn, to: RequestStatus) {
    if (!allowedStatuses(actor).includes(to)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'You cannot move a request to this status.',
      });
    }
  }

  private async staffReply(
    tx: Prisma.TransactionClient,
    request: RequestState,
    authorId: string,
    body: string,
    now: Date,
  ) {
    await tx.requestMessage.create({
      data: {
        requestId: request.id,
        authorId,
        kind: 'STAFF_REPLY',
        body,
        createdAt: now,
      },
    });
    await this.markReplied(tx, request, now);
  }

  /** The request's "last updated", and its first-response time if first. */
  private async markReplied(
    tx: Prisma.TransactionClient,
    request: RequestState,
    now: Date,
  ) {
    await tx.supportRequest.update({
      where: { id: request.id },
      data: {
        updatedAt: now,
        ...(request.firstResponseAt ? {} : { firstResponseAt: now }),
      },
    });
  }

  /** The project filter's choices: every project, or a developer's own. */
  private async projectChoices(actor: SignedIn) {
    const projects = await this.prisma.project.findMany({
      where:
        actor.role === 'DEVELOPER'
          ? { requests: { some: { assigneeId: actor.id } } }
          : {},
      orderBy: { name: 'asc' },
      select: { id: true, name: true, customer: { select: { company: true } } },
    });
    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      company: project.customer.company,
    }));
  }
}
