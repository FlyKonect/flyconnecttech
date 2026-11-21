import { MAX_EXPORT_ROWS, ukStamp, type Cell } from '../common/csv.js';
import type { Table } from '../common/table-file.js';
import { pageWindow, type Paging } from '../common/paging.js';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SignedIn } from '../auth/signed-in.js';
import type { Prisma } from '../generated/prisma/client.js';
import { can } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { findConvertible } from './lead-convert.js';
import { LeadEventsService } from './lead-events.service.js';
import { firstNameOf, suggestedProjectName } from './lead-rules.js';
import {
  addActivity,
  claimOwner,
  KIND_LABEL,
  LEAD_TYPE,
  leadNotFound,
  leadTable,
  type LeadKind,
} from './lead-store.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;

/** The lists show the newest this many that match. */

/** The ?status= values of each list, and the status each stands for. */
export const LEAD_STATUS_SLUGS = {
  demo: {
    new: 'NEW',
    scheduled: 'SCHEDULED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  },
  quote: {
    new: 'NEW',
    reviewing: 'REVIEWING',
    'estimate-sent': 'ESTIMATE_SENT',
    won: 'WON',
    lost: 'LOST',
  },
  message: { new: 'NEW', replied: 'REPLIED', closed: 'CLOSED' },
} as const;

const ownerSelect = { select: { id: true, name: true } } as const;

/**
 * The team's side of website leads (docs/01 §6, screens 34 to 42): the
 * lists, a lead's page, its owner and its composer. Status actions are in
 * LeadActionsService. Super admins, admins and managers only (the
 * controller checks leads.manage).
 */
@Injectable()
export class TeamLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: LeadEventsService,
  ) {}

  // -------------------------------------------------------------- lists

  async list(
    kind: LeadKind,
    filters: { status?: string; q?: string },
    paging: Paging = { page: 1, pageSize: 25 },
  ) {
    const slugs: Record<string, string> = LEAD_STATUS_SLUGS[kind];
    const status = filters.status ? slugs[filters.status] : undefined;
    const q = filters.q?.trim().slice(0, 100);
    const search = (fields: string[]) =>
      q ? { OR: fields.map((field) => ({ [field]: { contains: q } })) } : {};

    if (kind === 'demo') {
      const where: Prisma.DemoRequestWhereInput = {
        ...search(['code', 'name', 'company', 'email']),
        ...(status ? { status: status as never } : {}),
      };
      const matching = await this.prisma.demoRequest.count({ where });
      const window = pageWindow(paging, matching);
      const [groups, rows] = await Promise.all([
        this.prisma.demoRequest.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.demoRequest.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
          skip: window.skip,
          take: window.take,
          select: {
            code: true,
            createdAt: true,
            name: true,
            company: true,
            topic: true,
            preferredStart: true,
            scheduledStart: true,
            status: true,
            customerId: true,
            owner: ownerSelect,
          },
        }),
      ]);
      return {
        ...this.counts(groups),
        matching,
        page: window.page,
        pageSize: window.pageSize,
        rows,
      };
    }

    if (kind === 'quote') {
      const where: Prisma.QuoteRequestWhereInput = {
        ...search(['code', 'name', 'company', 'email', 'requirements']),
        ...(status ? { status: status as never } : {}),
      };
      const matching = await this.prisma.quoteRequest.count({ where });
      const window = pageWindow(paging, matching);
      const [groups, rows] = await Promise.all([
        this.prisma.quoteRequest.groupBy({
          by: ['status'],
          _count: { _all: true },
        }),
        this.prisma.quoteRequest.findMany({
          where,
          orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
          skip: window.skip,
          take: window.take,
          select: {
            code: true,
            createdAt: true,
            name: true,
            company: true,
            projectType: true,
            budget: true,
            timeline: true,
            status: true,
            customerId: true,
            owner: ownerSelect,
          },
        }),
      ]);
      return {
        ...this.counts(groups),
        matching,
        page: window.page,
        pageSize: window.pageSize,
        rows,
      };
    }

    const where: Prisma.ContactMessageWhereInput = {
      ...search(['code', 'name', 'email', 'message']),
      ...(status ? { status: status as never } : {}),
    };
    const matching = await this.prisma.contactMessage.count({ where });
    const window = pageWindow(paging, matching);
    const [groups, rows] = await Promise.all([
      this.prisma.contactMessage.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.contactMessage.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        skip: window.skip,
        take: window.take,
        select: {
          code: true,
          createdAt: true,
          name: true,
          email: true,
          topic: true,
          message: true,
          status: true,
          customerId: true,
          owner: ownerSelect,
        },
      }),
    ]);
    return {
      ...this.counts(groups),
      matching,
      rows: rows.map((row) => ({
        ...row,
        // A preview is enough for the list.
        message:
          row.message.length > 160
            ? `${row.message.slice(0, 160)}…`
            : row.message,
      })),
    };
  }

  private counts(groups: { status: string; _count: { _all: number } }[]) {
    const tabs: Record<string, number> = {};
    let all = 0;
    for (const group of groups) {
      tabs[group.status] = group._count._all;
      all += group._count._all;
    }
    return { all, tabs };
  }

  // -------------------------------------------------------- one lead

  async detail(actor: SignedIn, kind: LeadKind, code: string) {
    const lead = await this.find(kind, code);
    const [activity, matched] = await Promise.all([
      this.prisma.leadActivity.findMany({
        where: { leadType: LEAD_TYPE[kind], leadId: lead.id },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          kind: true,
          body: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      this.customerFor(lead.customerId, lead.email),
    ]);
    return {
      kind,
      ...lead,
      activity,
      customer: matched,
      // Demos and quotes link to a customer only by being converted.
      converted: kind !== 'message' && !!lead.customerId,
      canConvert: can(actor, 'leads.convert'),
    };
  }

  /** The lead, with what its page shows. 404 for an unknown code. */
  private async find(kind: LeadKind, code: string) {
    if (kind === 'demo') {
      const demo = await this.prisma.demoRequest.findUnique({
        where: { code },
        include: { owner: ownerSelect, host: ownerSelect },
      });
      if (!demo) throw leadNotFound();
      return demo;
    }
    if (kind === 'quote') {
      const quote = await this.prisma.quoteRequest.findUnique({
        where: { code },
        include: {
          owner: ownerSelect,
          estimates: {
            orderBy: [{ sentAt: 'desc' }, { id: 'desc' }],
            select: {
              id: true,
              amountCents: true,
              currency: true,
              deliveryTime: true,
              validUntil: true,
              summary: true,
              sentAt: true,
              sentBy: { select: { name: true } },
            },
          },
        },
      });
      if (!quote) throw leadNotFound();
      return quote;
    }
    const message = await this.prisma.contactMessage.findUnique({
      where: { code },
      include: { owner: ownerSelect },
    });
    if (!message) throw leadNotFound();
    return message;
  }

  /** The customer this lead belongs to: linked, or the same email. */
  private async customerFor(customerId: string | null, email: string) {
    const select = {
      id: true,
      company: true,
      contactUser: { select: { name: true, phone: true } },
    } as const;
    const customer = customerId
      ? await this.prisma.customer.findUnique({
          where: { id: customerId },
          select,
        })
      : await this.prisma.customer.findFirst({
          where: { contactUser: { is: { email: email.toLowerCase() } } },
          select,
        });
    return customer
      ? {
          id: customer.id,
          company: customer.company,
          phone: customer.contactUser?.phone ?? null,
        }
      : null;
  }

  // ---------------------------------------------------- owner, composer

  /** Who can own a lead or host a demo. */
  async owners() {
    const team = await this.events.leadTeam();
    return team.map(({ id, name }) => ({ id, name }));
  }

  async setOwner(
    actor: SignedIn,
    kind: LeadKind,
    code: string,
    ownerId: string | null,
  ) {
    const lead = await this.find(kind, code);
    if ((lead.ownerId ?? null) === ownerId) return { ok: true };
    const owner = ownerId
      ? (await this.owners()).find((person) => person.id === ownerId)
      : null;
    if (ownerId && !owner) {
      throw new BadRequestException({
        code: 'NOT_AN_OWNER',
        message: 'Choose a super admin, admin or manager.',
      });
    }
    await this.prisma.$transaction(async (tx) => {
      await leadTable(tx, kind).updateMany({
        where: { id: lead.id },
        data: { ownerId },
      });
      await addActivity(tx, kind, lead.id, {
        kind: 'SYSTEM',
        authorId: actor.id,
        body: owner
          ? `Owner set to ${owner.name} by ${actor.name}`
          : `Owner removed by ${actor.name}`,
      });
    }, TX);
    return { ok: true, owner };
  }

  /**
   * The composer: "Email {first}" is sent first and saved only if it went;
   * an internal note is only saved. The first email reply to a new message
   * marks it Replied.
   */
  async addEntry(
    actor: SignedIn,
    kind: LeadKind,
    code: string,
    entry: { kind: 'email' | 'note'; body: string },
  ) {
    const lead = await this.find(kind, code);
    if (entry.kind === 'email') {
      const sent = await this.events.sendLeadEmail(
        kind,
        lead,
        entry.body,
        actor.name,
      );
      if (!sent) {
        throw new ServiceUnavailableException({
          code: 'EMAIL_NOT_SENT',
          message: 'The email could not be sent. Please try again.',
        });
      }
    }
    await this.prisma.$transaction(async (tx) => {
      await addActivity(tx, kind, lead.id, {
        kind: entry.kind === 'email' ? 'EMAIL' : 'NOTE',
        authorId: actor.id,
        body: entry.body,
      });
      await claimOwner(tx, kind, lead.id, actor.id);
      if (kind === 'message' && entry.kind === 'email') {
        const replied = await tx.contactMessage.updateMany({
          where: { id: lead.id, status: 'NEW' },
          data: { status: 'REPLIED' },
        });
        if (replied.count) {
          await addActivity(tx, kind, lead.id, {
            kind: 'SYSTEM',
            authorId: null,
            body: 'Status changed to Replied',
          });
        }
      }
    }, TX);
    return { ok: true, firstName: firstNameOf(lead.name), email: lead.email };
  }

  // ------------------------------------------------------------ convert

  /** What Add customer starts with when converting this lead (screen 42). */
  async convertPrefill(code: string) {
    const lead = await findConvertible(this.prisma, code);
    return {
      lead: {
        type: lead.type,
        code: lead.code,
        label: KIND_LABEL[lead.kind].toLowerCase(),
      },
      name: lead.name,
      email: lead.email,
      company: lead.company ?? '',
      phone: lead.phone ?? '',
      project: {
        name: suggestedProjectName(lead.company, lead.name, lead.projectType),
        type: lead.projectType,
      },
    };
  }

  /**
   * The Export (CSV or Excel) of one kind of lead: the list's own search
   * and status, every matching lead (with emails), newest first.
   */
  async exportTable(
    kind: LeadKind,
    filters: { status?: string; q?: string },
  ): Promise<Table> {
    const q = filters.q?.trim();
    const status = filters.status;
    const search = (fields: string[]) =>
      q ? { OR: fields.map((field) => ({ [field]: { contains: q } })) } : {};
    const order = [{ createdAt: 'desc' as const }, { code: 'desc' as const }];
    const owner = { select: { name: true } };

    if (kind === 'demo') {
      const rows = await this.prisma.demoRequest.findMany({
        where: {
          ...search(['code', 'name', 'company', 'email']),
          ...(status ? { status: status as never } : {}),
        },
        orderBy: order,
        take: MAX_EXPORT_ROWS,
        include: { owner },
      });
      return table(
        [
          'Code',
          'Received',
          'Status',
          'Name',
          'Email',
          'Company',
          'Topic',
          'Preferred time',
          'Booked time',
          'Owner',
        ],
        rows.map((row) => [
          row.code,
          ukStamp(row.createdAt),
          words(row.status),
          row.name,
          row.email,
          row.company,
          words(row.topic),
          ukStamp(row.preferredStart),
          ukStamp(row.scheduledStart),
          row.owner?.name ?? '',
        ]),
      );
    }
    if (kind === 'quote') {
      const rows = await this.prisma.quoteRequest.findMany({
        where: {
          ...search(['code', 'name', 'company', 'email', 'requirements']),
          ...(status ? { status: status as never } : {}),
        },
        orderBy: order,
        take: MAX_EXPORT_ROWS,
        include: { owner },
      });
      return table(
        [
          'Code',
          'Received',
          'Status',
          'Name',
          'Email',
          'Company',
          'Project type',
          'Budget',
          'Timeline',
          'Owner',
        ],
        rows.map((row) => [
          row.code,
          ukStamp(row.createdAt),
          words(row.status),
          row.name,
          row.email,
          row.company,
          words(row.projectType),
          words(row.budget),
          words(row.timeline),
          row.owner?.name ?? '',
        ]),
      );
    }
    const rows = await this.prisma.contactMessage.findMany({
      where: {
        ...search(['code', 'name', 'email', 'message']),
        ...(status ? { status: status as never } : {}),
      },
      orderBy: order,
      take: MAX_EXPORT_ROWS,
      include: { owner },
    });
    return table(
      [
        'Code',
        'Received',
        'Status',
        'Name',
        'Email',
        'Topic',
        'Message',
        'Owner',
      ],
      rows.map((row) => [
        row.code,
        ukStamp(row.createdAt),
        words(row.status),
        row.name,
        row.email,
        words(row.topic),
        row.message,
        row.owner?.name ?? '',
      ]),
    );
  }
}

/** The header and rows of a download. */
const table = (header: string[], rows: Cell[][]): Table => ({ header, rows });

/** "TRAVEL_BOOKING_PLATFORM" as "Travel booking platform", for a download. */
function words(value: string | null | undefined): string {
  if (!value) return '';
  const text = value.toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
