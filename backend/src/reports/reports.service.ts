import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { averageMinutes, ukMonth } from '../requests/dashboard-math.js';
import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';
import {
  averageBetween,
  countChange,
  durationWords,
  firstResponseChange,
  metShare,
  reopenedShare,
  resolutionChange,
  resolutionWords,
  ukWeek,
  WEEKDAYS,
  type Change,
} from './report-math.js';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY = 24 * 60 * 60 * 1000;
/** The longest range one report covers. */
const MAX_DAYS = 400;

type Month = { start: Date; end: Date };

export type ReportCard = {
  label: string;
  value: string;
  /** The line under the number: the change against the period before. */
  change: Change | null;
  /** Shown instead when there is no data yet. */
  note: string | null;
};

/** What the Reports page asks for: all optional (this month, everyone). */
export type ReportQuery = {
  /** UK dates, "YYYY-MM-DD", both included. */
  from?: string;
  to?: string;
  customerId?: string;
  developerId?: string;
};

const isDay = (text?: string) => !!text && /^\d{4}-\d{2}-\d{2}$/.test(text);

/** The start of a UK day ("2026-11-03" at 00:00 UK time). */
function ukDayStart(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return fromUkWallClock({
    year,
    month,
    day: date,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

/** "3 Nov 2026" for the period's words. */
function dayWords(date: Date): string {
  const clock = ukWallClock(date);
  return `${clock.day} ${MONTHS[clock.month - 1].slice(0, 3)} ${clock.year}`;
}

/**
 * Reports & Analytics (docs/01 §5, screen 31), worked out from the data.
 * UK months and weeks, like the dashboards. Super admins, admins and
 * managers (reports.view, checked by the controller).
 *
 * With no choices it is this month against last month, as designed. A date
 * range compares with the same number of days just before it; a customer
 * or a developer narrows every number to their requests.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async report(query: ReportQuery = {}, now = new Date()) {
    const custom = isDay(query.from) || isDay(query.to);
    let period: Month;
    let previous: Month;
    let againstName: string;
    let against: string;
    if (custom) {
      if (!isDay(query.from) || !isDay(query.to)) {
        throw badRange('Choose both a start and an end date.');
      }
      const start = ukDayStart(query.from!);
      const end = new Date(ukDayStart(query.to!).getTime() + DAY);
      if (end <= start) throw badRange('The end date is before the start.');
      if (end.getTime() - start.getTime() > MAX_DAYS * DAY) {
        throw badRange(`Choose up to ${MAX_DAYS} days.`);
      }
      period = { start, end };
      previous = {
        start: new Date(start.getTime() - (end.getTime() - start.getTime())),
        end: start,
      };
      againstName = 'the period before';
      against = 'the period before';
    } else {
      period = ukMonth(now);
      previous = ukMonth(now, -1);
      againstName = MONTHS[ukWallClock(previous.start).month - 1];
      against = 'last month';
    }

    // Every number below counts only these requests.
    const scope: Prisma.SupportRequestWhereInput = {
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.developerId ? { assigneeId: query.developerId } : {}),
    };

    const [
      firstThis,
      firstLast,
      resolutionThis,
      resolutionLast,
      resolvedThis,
      resolvedLast,
      reopened,
      week,
      projects,
      developers,
      sla,
      filters,
    ] = await Promise.all([
      this.firstResponse(period, scope),
      this.firstResponse(previous, scope),
      this.resolution(period, scope),
      this.resolution(previous, scope),
      this.resolved(period, scope),
      this.resolved(previous, scope),
      this.reopened(period, scope),
      this.thisWeek(now, scope),
      this.byProject(scope, custom ? period : null),
      this.developers(period, scope, query.developerId),
      this.sla(period, scope),
      this.filterChoices(),
    ]);

    const inWords = custom ? 'in this period' : 'this month';
    const share = reopenedShare(reopened, resolvedThis);
    const cards: ReportCard[] = [
      {
        label: 'Avg. first response',
        value: firstThis === null ? '—' : durationWords(firstThis),
        change: firstResponseChange(firstThis, firstLast, againstName),
        note: firstThis === null ? `No replies ${inWords} yet` : null,
      },
      {
        label: 'Avg. resolution time',
        value: resolutionThis === null ? '—' : resolutionWords(resolutionThis),
        change: resolutionChange(resolutionThis, resolutionLast, against),
        note:
          resolutionThis === null ? `Nothing resolved ${inWords} yet` : null,
      },
      {
        label: custom ? 'Resolved' : 'Resolved this month',
        value: String(resolvedThis),
        change: countChange(resolvedThis, resolvedLast, against),
        note: null,
      },
      {
        label: 'Reopened requests',
        value: String(reopened),
        // The design shows the share of this month's resolved requests.
        change: share ? { text: share, tone: 'better' } : null,
        note: share ? null : `None resolved ${inWords} yet`,
      },
    ];
    return {
      period: {
        from: period.start,
        to: new Date(period.end.getTime() - 1),
        words: custom
          ? `${dayWords(period.start)} to ${dayWords(new Date(period.end.getTime() - 1))}`
          : `${MONTHS[ukWallClock(period.start).month - 1]} ${ukWallClock(period.start).year}`,
        custom,
      },
      cards,
      sla,
      week,
      projects,
      projectsAllTime: !custom,
      developers,
      filters,
    };
  }

  // ------------------------------------------------------------ helpers

  /** Average minutes to the first reply, for first replies in the period. */
  private async firstResponse(
    month: Month,
    scope: Prisma.SupportRequestWhereInput,
  ) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { ...scope, firstResponseAt: { gte: month.start, lt: month.end } },
      select: { createdAt: true, firstResponseAt: true },
    });
    return averageMinutes(rows);
  }

  /** Average minutes from arriving to Resolved, for those resolved in the period. */
  private async resolution(
    month: Month,
    scope: Prisma.SupportRequestWhereInput,
  ) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { ...scope, resolvedAt: { gte: month.start, lt: month.end } },
      select: { createdAt: true, resolvedAt: true },
    });
    return averageBetween(
      rows.map((r) => ({ from: r.createdAt, to: r.resolvedAt })),
    );
  }

  private resolved(month: Month, scope: Prisma.SupportRequestWhereInput) {
    return this.prisma.supportRequest.count({
      where: { ...scope, resolvedAt: { gte: month.start, lt: month.end } },
    });
  }

  /** Requests moved back to In Progress from Resolved or Closed. */
  private async reopened(month: Month, scope: Prisma.SupportRequestWhereInput) {
    const changes = await this.prisma.requestStatusChange.findMany({
      where: {
        from: { in: ['RESOLVED', 'CLOSED'] },
        to: 'IN_PROGRESS',
        createdAt: { gte: month.start, lt: month.end },
        request: scope,
      },
      distinct: ['requestId'],
      select: { requestId: true },
    });
    return changes.length;
  }

  /**
   * SLA met (two clocks): first replies in the period that came before
   * their reply due time, and requests resolved in the period before their
   * fix due time. Requests made before the fix clock are not counted there.
   */
  private async sla(
    month: Month,
    scope: Prisma.SupportRequestWhereInput,
  ): Promise<ReportCard[]> {
    const [replies, fixes] = await Promise.all([
      this.prisma.supportRequest.findMany({
        where: {
          ...scope,
          firstResponseAt: { gte: month.start, lt: month.end },
          dueAt: { not: null },
        },
        select: { firstResponseAt: true, dueAt: true },
      }),
      this.prisma.supportRequest.findMany({
        where: {
          ...scope,
          resolvedAt: { gte: month.start, lt: month.end },
          resolveDueAt: { not: null },
        },
        select: { resolvedAt: true, resolveDueAt: true },
      }),
    ]);
    const replyMet = replies.filter((r) => r.firstResponseAt! <= r.dueAt!);
    const fixMet = fixes.filter((r) => r.resolvedAt! <= r.resolveDueAt!);
    const card = (
      label: string,
      met: number,
      counted: number,
      what: string,
    ): ReportCard => {
      const share = metShare(met, counted);
      return {
        label,
        value: share ?? '—',
        change: share
          ? { text: `${met} of ${counted} ${what}`, tone: 'same' }
          : null,
        note: share ? null : `No ${what} yet`,
      };
    };
    return [
      card('Reply SLA met', replyMet.length, replies.length, 'first replies'),
      card('Fix SLA met', fixMet.length, fixes.length, 'resolved requests'),
    ];
  }

  /** Requests sent each day of this UK week, Monday to Sunday. */
  private async thisWeek(now: Date, scope: Prisma.SupportRequestWhereInput) {
    const { days, end } = ukWeek(now);
    const rows = await this.prisma.supportRequest.findMany({
      where: { ...scope, createdAt: { gte: days[0], lt: end } },
      select: { createdAt: true },
    });
    return days.map((start, index) => {
      const next = days[index + 1] ?? end;
      return {
        day: WEEKDAYS[index],
        count: rows.filter((r) => r.createdAt >= start && r.createdAt < next)
          .length,
      };
    });
  }

  /** The six projects with the most requests: all time, or in the period. */
  private async byProject(
    scope: Prisma.SupportRequestWhereInput,
    period: Month | null,
  ) {
    const groups = await this.prisma.supportRequest.groupBy({
      by: ['projectId'],
      where: {
        ...scope,
        ...(period ? { createdAt: { gte: period.start, lt: period.end } } : {}),
      },
      _count: { _all: true },
      orderBy: { _count: { projectId: 'desc' } },
      take: 6,
    });
    const names = await this.prisma.project.findMany({
      where: { id: { in: groups.map((g) => g.projectId) } },
      select: { id: true, name: true },
    });
    return groups.map((group) => ({
      id: group.projectId,
      name: names.find((p) => p.id === group.projectId)?.name ?? 'A project',
      count: group._count._all,
    }));
  }

  /** Each active developer in the period: assigned, resolved, first response. */
  private async developers(
    month: Month,
    scope: Prisma.SupportRequestWhereInput,
    developerId?: string,
  ) {
    const people = await this.prisma.user.findMany({
      where: {
        role: 'DEVELOPER',
        status: 'ACTIVE',
        ...(developerId ? { id: developerId } : {}),
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, jobTitle: true },
    });
    return Promise.all(
      people.map(async (person) => {
        const mine = { ...scope, assigneeId: person.id };
        const [assigned, resolved, answered] = await Promise.all([
          this.prisma.supportRequest.count({
            where: { ...mine, createdAt: { gte: month.start, lt: month.end } },
          }),
          this.prisma.supportRequest.count({
            where: { ...mine, resolvedAt: { gte: month.start, lt: month.end } },
          }),
          this.prisma.supportRequest.findMany({
            where: {
              ...mine,
              firstResponseAt: { gte: month.start, lt: month.end },
            },
            select: { createdAt: true, firstResponseAt: true },
          }),
        ]);
        const average = averageMinutes(answered);
        return {
          ...person,
          assigned,
          resolved,
          firstResponse: average === null ? null : durationWords(average),
        };
      }),
    );
  }

  /** The Customer and Developer choices above the report. */
  private async filterChoices() {
    const [customers, developers] = await Promise.all([
      this.prisma.customer.findMany({
        where: { deletedAt: null },
        orderBy: { company: 'asc' },
        select: { id: true, company: true },
      }),
      this.prisma.user.findMany({
        where: { role: 'DEVELOPER', status: { not: 'DELETED' } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
    ]);
    return { customers, developers };
  }
}

function badRange(message: string) {
  return new BadRequestException({ code: 'BAD_RANGE', message });
}
