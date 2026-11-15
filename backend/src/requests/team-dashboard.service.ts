import { Injectable } from '@nestjs/common';
import type { SignedIn } from '../auth/signed-in.js';
import type {
  Prisma,
  RequestStatus,
  Role,
} from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { can, requestScope, TEAM_ROLES } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { averageMinutes, byUrgency, ukMonth } from './dashboard-math.js';
import { ALL_STATUSES, countOf } from './request-writes.js';

/** Not finished yet. */
export const OPEN_STATUSES: RequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
];

/** Open and not waiting for the customer: the SLA clock is running. */
const CLOCK_RUNNING: RequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
];

/** A request in a dashboard list. */
export const dashboardRowSelect = {
  code: true,
  title: true,
  status: true,
  priority: true,
  createdAt: true,
  dueAt: true,
  slaPausedAt: true,
  resolvedAt: true,
  project: { select: { name: true } },
  customer: { select: { company: true } },
} satisfies Prisma.SupportRequestSelect;

const LIST_SIZE = 5;
const HOUR = 60 * 60 * 1000;

/**
 * The team panel's numbers: the sidebar counts and each role's dashboard
 * (docs/01, section 5 "Dashboards"). Developers only ever count their own
 * requests (requestScope).
 */
@Injectable()
export class TeamDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** The numbers beside the sidebar's menu items. */
  async summary(actor: SignedIn) {
    const [counts, unreadNotifications, leads] = await Promise.all([
      this.statusCounts(actor),
      this.notifications.unreadCount(actor.id),
      can(actor, 'leads.manage') ? this.newLeads() : null,
    ]);
    return { requests: counts, unreadNotifications, leads };
  }

  /** New demo requests, quote requests and messages: the sidebar badges. */
  private async newLeads() {
    const [demos, quotes, messages] = await Promise.all([
      this.prisma.demoRequest.count({ where: { status: 'NEW' } }),
      this.prisma.quoteRequest.count({ where: { status: 'NEW' } }),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
    ]);
    return { demos, quotes, messages };
  }

  /** The dashboard's Website leads card. */
  private async leadsCard(now: Date) {
    const [newLeads, estimatesAwaiting, demosBooked, nextDemo] =
      await Promise.all([
        this.newLeads(),
        this.prisma.quoteRequest.count({ where: { status: 'ESTIMATE_SENT' } }),
        this.prisma.demoRequest.count({ where: { status: 'SCHEDULED' } }),
        this.prisma.demoRequest.findFirst({
          where: { status: 'SCHEDULED', scheduledStart: { gte: now } },
          orderBy: { scheduledStart: 'asc' },
          select: { scheduledStart: true },
        }),
      ]);
    return {
      ...newLeads,
      estimatesAwaiting,
      demosBooked,
      nextDemo: nextDemo?.scheduledStart ?? null,
    };
  }

  /** Active developers, with their job title and open requests. */
  async developers() {
    const developers = await this.prisma.user.findMany({
      where: { role: 'DEVELOPER', status: 'ACTIVE' },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, jobTitle: true },
    });
    const loads = await this.prisma.supportRequest.groupBy({
      by: ['assigneeId'],
      where: {
        assigneeId: { in: developers.map((d) => d.id) },
        status: { in: OPEN_STATUSES },
      },
      _count: { _all: true },
    });
    return developers.map((developer) => ({
      ...developer,
      open:
        loads.find((load) => load.assigneeId === developer.id)?._count._all ??
        0,
    }));
  }

  /** The dashboard for this person's role. */
  async dashboard(actor: SignedIn, now = new Date()) {
    const [counts, alerts] = await Promise.all([
      this.statusCounts(actor),
      this.notifications.list(actor.id, LIST_SIZE),
    ]);
    const open = counts.all - counts.resolved - counts.closed;

    if (actor.role === 'DEVELOPER') {
      const mine = await this.prisma.supportRequest.findMany({
        where: { assigneeId: actor.id, status: { in: OPEN_STATUSES } },
        select: dashboardRowSelect,
      });
      const queue = [...mine].sort(byUrgency).slice(0, LIST_SIZE);
      const dueSoon = mine
        .filter((row) => row.dueAt && row.status !== 'WAITING_FOR_CUSTOMER')
        .sort((a, b) => a.dueAt!.getTime() - b.dueAt!.getTime())
        .slice(0, LIST_SIZE);
      return { role: actor.role, counts, open, queue, dueSoon, alerts };
    }

    const thisMonth = ukMonth(now);
    const lastMonth = ukMonth(now, -1);
    const [
      unassigned,
      atRisk,
      firstThis,
      firstLast,
      resolvedThisMonth,
      resolvedLastMonth,
      newRequests,
      unassignedRows,
      workload,
      customers,
      team,
      leads,
    ] = await Promise.all([
      this.prisma.supportRequest.count({
        where: { status: { in: OPEN_STATUSES }, assigneeId: null },
      }),
      this.prisma.supportRequest.count({
        where: {
          status: { in: CLOCK_RUNNING },
          dueAt: { lt: new Date(now.getTime() + HOUR) },
        },
      }),
      this.firstResponses(thisMonth),
      this.firstResponses(lastMonth),
      this.resolvedIn(thisMonth),
      this.resolvedIn(lastMonth),
      this.prisma.supportRequest.findMany({
        where: { status: 'SUBMITTED' },
        orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
        take: LIST_SIZE,
        select: dashboardRowSelect,
      }),
      this.prisma.supportRequest.findMany({
        where: { status: { in: OPEN_STATUSES }, assigneeId: null },
        select: dashboardRowSelect,
      }),
      this.developers(),
      can(actor, 'customers.view') ? this.customerCounts() : null,
      can(actor, 'users.view') ? this.teamCounts() : null,
      can(actor, 'leads.manage') ? this.leadsCard(now) : null,
    ]);

    return {
      role: actor.role,
      counts,
      open,
      unassigned,
      atRisk,
      firstResponse: { thisMonth: firstThis, lastMonth: firstLast },
      resolvedThisMonth,
      resolvedLastMonth,
      newRequests,
      unassignedRequests: unassignedRows.sort(byUrgency).slice(0, LIST_SIZE),
      workload,
      customers,
      team,
      leads,
      alerts,
    };
  }

  // ------------------------------------------------------------ helpers

  private async statusCounts(actor: SignedIn) {
    const groups = await this.prisma.supportRequest.groupBy({
      by: ['status'],
      where: requestScope(actor),
      _count: { _all: true },
    });
    return {
      all: countOf(groups, ...ALL_STATUSES),
      new: countOf(groups, 'SUBMITTED'),
      underReview: countOf(groups, 'UNDER_REVIEW'),
      inProgress: countOf(groups, 'IN_PROGRESS'),
      waiting: countOf(groups, 'WAITING_FOR_CUSTOMER'),
      resolved: countOf(groups, 'RESOLVED'),
      closed: countOf(groups, 'CLOSED'),
    };
  }

  /** Average minutes to the first reply, for first replies in this month. */
  private async firstResponses(month: { start: Date; end: Date }) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { firstResponseAt: { gte: month.start, lt: month.end } },
      select: { createdAt: true, firstResponseAt: true },
    });
    return averageMinutes(rows);
  }

  private resolvedIn(month: { start: Date; end: Date }) {
    return this.prisma.supportRequest.count({
      where: { resolvedAt: { gte: month.start, lt: month.end } },
    });
  }

  private async customerCounts() {
    const [total, invited] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.user.count({
        where: { role: 'CUSTOMER', status: 'INVITED' },
      }),
    ]);
    return { total, invited };
  }

  /** Active and invited team members, per role. */
  private async teamCounts() {
    const groups = await this.prisma.user.groupBy({
      by: ['role', 'status'],
      where: {
        role: { in: [...TEAM_ROLES] },
        status: { in: ['ACTIVE', 'INVITED'] },
      },
      _count: { _all: true },
    });
    const of = (role: Role, status: 'ACTIVE' | 'INVITED') =>
      groups.find((g) => g.role === role && g.status === status)?._count._all ??
      0;
    const byRole = Object.fromEntries(
      TEAM_ROLES.map((role) => [
        role,
        { active: of(role, 'ACTIVE'), invited: of(role, 'INVITED') },
      ]),
    );
    return {
      active: TEAM_ROLES.reduce((sum, role) => sum + of(role, 'ACTIVE'), 0),
      invited: TEAM_ROLES.reduce((sum, role) => sum + of(role, 'INVITED'), 0),
      byRole,
    };
  }
}
