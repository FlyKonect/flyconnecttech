import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { SignedIn } from '../auth/signed-in.js';
import { nextCode } from '../codes/readable-codes.js';
import type {
  MessageKind,
  Prisma,
  Priority,
  RequestStatus,
  RequestType,
} from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { customerScope } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import {
  FileStorageService,
  type UploadedFile,
} from '../uploads/file-storage.service.js';
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
  type RequestState,
} from './request-writes.js';
import { dueTimes } from './sla.js';
import {
  CUSTOMER_ACTIONS,
  CUSTOMER_REPLIED_LINE,
  customerActionsFor,
  reopenTooLate,
  PORTAL_TABS,
  type CustomerAction,
  type PortalTab,
} from './status-rules.js';

/** The only messages a customer ever sees. Internal notes never. */
export const CUSTOMER_VISIBLE: MessageKind[] = [
  'CUSTOMER_REPLY',
  'STAFF_REPLY',
  'SYSTEM',
];

/** Files a customer may see: the request's own, or on a visible message. */
export const visibleFiles: Prisma.AttachmentWhereInput = {
  OR: [{ messageId: null }, { message: { kind: { in: CUSTOMER_VISIBLE } } }],
};

const rowSelect = {
  code: true,
  title: true,
  type: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  project: { select: { code: true, name: true } },
  assignee: { select: { name: true } },
} satisfies Prisma.SupportRequestSelect;

export type NewRequest = {
  projectId: string;
  type: RequestType;
  priority: Priority;
  title: string;
  description: string;
  url?: string;
};

/**
 * Support requests, as the customer sees and changes them (client portal).
 * Every read is limited to the signed-in customer's own records
 * (customerScope); anything else is "not found", never "forbidden", so
 * nobody can learn which codes exist.
 */
@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: FileStorageService,
    private readonly settings: SettingsService,
    private readonly events: RequestEventsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** The numbers on the sidebar and the Overview tiles. */
  async summary(actor: SignedIn) {
    const [groups, unreadNotifications] = await Promise.all([
      this.prisma.supportRequest.groupBy({
        by: ['status'],
        where: customerScope(actor),
        _count: { _all: true },
      }),
      this.notifications.unreadCount(actor.id),
    ]);
    return {
      requests: {
        total: countOf(groups, ...ALL_STATUSES),
        open: countOf(groups, 'SUBMITTED', 'UNDER_REVIEW'),
        inProgress: countOf(groups, 'IN_PROGRESS'),
        waiting: countOf(groups, 'WAITING_FOR_CUSTOMER'),
        resolved: countOf(groups, 'RESOLVED', 'CLOSED'),
      },
      unreadNotifications,
    };
  }

  /** My requests: one tab, an optional search, and every tab's count. */
  async list(
    actor: SignedIn,
    options: { tab: PortalTab; search?: string; limit?: number },
  ) {
    const search = options.search?.trim();
    const where: Prisma.SupportRequestWhereInput = {
      ...customerScope(actor),
      ...(search
        ? {
            OR: [
              { code: { contains: search } },
              { title: { contains: search } },
            ],
          }
        : {}),
    };
    const statuses = PORTAL_TABS[options.tab];
    const [groups, rows] = await Promise.all([
      this.prisma.supportRequest.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
      this.prisma.supportRequest.findMany({
        where: statuses
          ? { AND: [where, { status: { in: [...statuses] } }] }
          : where,
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        take: options.limit ?? 500,
        select: rowSelect,
      }),
    ]);
    const tabs = Object.fromEntries(
      (Object.keys(PORTAL_TABS) as PortalTab[]).map((tab) => {
        const inTab = PORTAL_TABS[tab] as readonly RequestStatus[] | null;
        return [tab, countOf(groups, ...(inTab ?? ALL_STATUSES))];
      }),
    ) as Record<PortalTab, number>;
    return { tabs, rows };
  }

  /** Sends a new request (screens 07 to 11). */
  async create(actor: SignedIn, input: NewRequest, files: UploadedFile[]) {
    const project = await this.prisma.project.findFirst({
      where: { id: input.projectId, deletedAt: null, ...customerScope(actor) },
      select: { id: true, name: true, customer: { select: { company: true } } },
    });
    if (!project) {
      throw new NotFoundException({
        code: 'PROJECT_NOT_FOUND',
        message: 'Choose one of your projects.',
      });
    }

    const checked = await this.storage.check(files);
    const id = randomUUID();
    const keys = await this.storage.keep(checked, id);
    const targets = await this.settings.slaRules();
    const company = project.customer.company;

    let request: RequestState;
    try {
      request = await this.prisma.$transaction(async (tx) => {
        const now = new Date();
        const created = await tx.supportRequest.create({
          data: {
            id,
            code: await nextCode(tx, 'request', now),
            title: input.title,
            description: input.description,
            url: input.url || null,
            type: input.type,
            priority: input.priority,
            status: 'SUBMITTED',
            projectId: project.id,
            customerId: customerScope(actor).customerId,
            ...dueTimes(now, input.priority, targets),
            createdAt: now,
          },
          select: stateSelect,
        });
        await tx.requestStatusChange.create({
          data: {
            requestId: id,
            from: null,
            to: 'SUBMITTED',
            byId: actor.id,
            createdAt: now,
          },
        });
        await saveFiles(tx, checked, keys, id, actor.id, null);
        await this.events.created(tx, created, company);
        return created;
      }, REQUEST_TX);
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }

    const details = {
      ...request,
      description: input.description,
      type: input.type,
      projectName: project.name,
      company,
      fileCount: checked.length,
    };
    await this.events.emailRequestReceived(details);
    if (request.priority === 'URGENT') await this.events.emailUrgent(details);
    return { code: request.code };
  }

  /** One request with its conversation (screen 13). Never internal notes. */
  async detail(actor: SignedIn, code: string) {
    const { reopenWithinDays } = await this.settings.get('requestRules');
    const request = await this.prisma.supportRequest.findFirst({
      where: { code, ...customerScope(actor) },
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
        closedAt: true,
        rating: true,
        ratingComment: true,
        project: { select: { code: true, name: true, type: true } },
        assignee: { select: { name: true } },
        messages: {
          where: { kind: { in: CUSTOMER_VISIBLE } },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          select: {
            id: true,
            kind: true,
            body: true,
            createdAt: true,
            author: { select: { id: true, name: true } },
          },
        },
        attachments: {
          where: visibleFiles,
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            messageId: true,
            fileName: true,
            contentType: true,
            size: true,
          },
        },
        statusChanges: {
          orderBy: { createdAt: 'asc' },
          select: { to: true, createdAt: true },
        },
      },
    });
    if (!request) throw requestNotFound();

    const { messages, attachments, statusChanges, ...rest } = request;
    return {
      ...rest,
      actions: customerActionsFor(request.status, {
        closedAt: request.closedAt,
        withinDays: reopenWithinDays,
      }),
      reopenWithinDays,
      files: attachments,
      messages: messages.map((message) => ({
        id: message.id,
        kind: message.kind,
        body: message.body,
        createdAt: message.createdAt,
        author: message.author
          ? { name: message.author.name, you: message.author.id === actor.id }
          : null,
      })),
      history: statusChanges.map((change) => ({
        status: change.to,
        at: change.createdAt,
      })),
    };
  }

  /**
   * The customer replies, with or without files. A reply while the team
   * waits for the customer moves the request back to In Progress.
   */
  async reply(
    actor: SignedIn,
    code: string,
    body: string,
    files: UploadedFile[],
  ) {
    const request = await this.findOwn(actor, code);
    const text = body.trim();
    if (!text && !files.length) {
      throw new BadRequestException({
        code: 'EMPTY_REPLY',
        message: 'Write a reply or attach a file.',
      });
    }

    const checked = await this.storage.check(files);
    const keys = await this.storage.keep(checked, request.id);
    const targets = await this.settings.slaRules();

    let current: RequestState;
    try {
      current = await this.prisma.$transaction(async (tx) => {
        const now = new Date();
        const message = await tx.requestMessage.create({
          data: {
            requestId: request.id,
            authorId: actor.id,
            kind: 'CUSTOMER_REPLY',
            body: text,
            createdAt: now,
          },
        });
        await saveFiles(tx, checked, keys, request.id, actor.id, message.id);

        const fresh = await tx.supportRequest.findUniqueOrThrow({
          where: { id: request.id },
          select: stateSelect,
        });
        const woken =
          fresh.status === 'WAITING_FOR_CUSTOMER' &&
          (await moveStatus(tx, fresh, 'IN_PROGRESS', {
            actorId: actor.id,
            line: CUSTOMER_REPLIED_LINE,
            now: new Date(now.getTime() + 1),
            targets,
          }));
        if (!woken) {
          await tx.supportRequest.update({
            where: { id: request.id },
            data: { updatedAt: now },
          });
        }
        await this.events.customerActivity(
          tx,
          fresh,
          `${actor.name} replied on ${fresh.code}`,
        );
        return fresh;
      }, REQUEST_TX);
    } catch (error) {
      await this.storage.remove(keys);
      throw error;
    }
    await this.events.emailCustomerReplied(current, actor.name, text);
    return { ok: true };
  }

  /** Close request, Confirm it's fixed, I still need help / Reopen request. */
  async act(
    actor: SignedIn,
    code: string,
    action: CustomerAction,
    rating?: { rating?: number; comment?: string },
  ) {
    const rule = CUSTOMER_ACTIONS[action];
    const request = await this.findOwn(actor, code);
    if (!rule.from.includes(request.status)) throw changedMeanwhile();
    if (action === 'reopen' && request.status === 'CLOSED') {
      const [{ closedAt }, { reopenWithinDays }] = await Promise.all([
        this.prisma.supportRequest.findUniqueOrThrow({
          where: { id: request.id },
          select: { closedAt: true },
        }),
        this.settings.get('requestRules'),
      ]);
      if (reopenTooLate({ closedAt, withinDays: reopenWithinDays })) {
        throw new ConflictException({
          code: 'REOPEN_TOO_LATE',
          message: `This request closed more than ${reopenWithinDays} days ago. Please send a new request.`,
        });
      }
    }
    const targets = await this.settings.slaRules();

    await this.prisma.$transaction(async (tx) => {
      const changed = await moveStatus(tx, request, rule.to, {
        actorId: actor.id,
        line: rule.line(actor.name),
        now: new Date(),
        targets,
      });
      if (!changed) throw changedMeanwhile();
      if (action === 'confirm' && rating?.rating) {
        await tx.supportRequest.update({
          where: { id: request.id },
          data: {
            rating: rating.rating,
            ratingComment: rating.comment || null,
            ratedAt: new Date(),
          },
        });
      }
      await this.events.customerActivity(
        tx,
        request,
        rule.teamText(actor.name, request.code),
      );
    }, REQUEST_TX);
    return { status: rule.to };
  }

  /** A file to download, if the customer may see it. */
  async file(actor: SignedIn, code: string, fileId: string) {
    const request = await this.findOwn(actor, code);
    const file = await this.prisma.attachment.findFirst({
      where: { id: fileId, requestId: request.id, ...visibleFiles },
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

  private async findOwn(actor: SignedIn, code: string) {
    const request = await this.prisma.supportRequest.findFirst({
      where: { code, ...customerScope(actor) },
      select: stateSelect,
    });
    if (!request) throw requestNotFound();
    return request;
  }
}
