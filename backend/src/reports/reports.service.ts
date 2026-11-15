import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { averageMinutes, ukMonth } from '../requests/dashboard-math.js';
import { ukWallClock } from '../time/uk-time.js';
import {
  averageBetween,
  countChange,
  durationWords,
  firstResponseChange,
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

type Month = { start: Date; end: Date };

export type ReportCard = {
  label: string;
  value: string;
  /** The line under the number: the change against last month. */
  change: Change | null;
  /** Shown instead when there is no data yet. */
  note: string | null;
};

/**
 * Reports & Analytics (docs/01 §5, screen 31), worked out from the data.
 * UK months and weeks, like the dashboards. Super admins, admins and
 * managers (reports.view, checked by the controller).
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async report(now = new Date()) {
    const thisMonth = ukMonth(now);
    const lastMonth = ukMonth(now, -1);
    const lastMonthName = MONTHS[ukWallClock(lastMonth.start).month - 1];

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
    ] = await Promise.all([
      this.firstResponse(thisMonth),
      this.firstResponse(lastMonth),
      this.resolution(thisMonth),
      this.resolution(lastMonth),
      this.resolved(thisMonth),
      this.resolved(lastMonth),
      this.reopened(thisMonth),
      this.thisWeek(now),
      this.byProject(),
      this.developers(thisMonth),
    ]);

    const share = reopenedShare(reopened, resolvedThis);
    const cards: ReportCard[] = [
      {
        label: 'Avg. first response',
        value: firstThis === null ? '—' : durationWords(firstThis),
        change: firstResponseChange(firstThis, firstLast, lastMonthName),
        note: firstThis === null ? 'No replies this month yet' : null,
      },
      {
        label: 'Avg. resolution time',
        value: resolutionThis === null ? '—' : resolutionWords(resolutionThis),
        change: resolutionChange(resolutionThis, resolutionLast),
        note:
          resolutionThis === null ? 'Nothing resolved this month yet' : null,
      },
      {
        label: 'Resolved this month',
        value: String(resolvedThis),
        change: countChange(resolvedThis, resolvedLast),
        note: null,
      },
      {
        label: 'Reopened requests',
        value: String(reopened),
        // The design shows the share of this month's resolved requests.
        change: share ? { text: share, tone: 'better' } : null,
        note: share ? null : 'None resolved this month yet',
      },
    ];
    return { cards, week, projects, developers };
  }

  // ------------------------------------------------------------ helpers

  /** Average minutes to the first reply, for first replies in the month. */
  private async firstResponse(month: Month) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { firstResponseAt: { gte: month.start, lt: month.end } },
      select: { createdAt: true, firstResponseAt: true },
    });
    return averageMinutes(rows);
  }

  /** Average minutes from arriving to Resolved, for those resolved in the month. */
  private async resolution(month: Month) {
    const rows = await this.prisma.supportRequest.findMany({
      where: { resolvedAt: { gte: month.start, lt: month.end } },
      select: { createdAt: true, resolvedAt: true },
    });
    return averageBetween(
      rows.map((r) => ({ from: r.createdAt, to: r.resolvedAt })),
    );
  }

  private resolved(month: Month) {
    return this.prisma.supportRequest.count({
      where: { resolvedAt: { gte: month.start, lt: month.end } },
    });
  }

  /** Requests moved back to In Progress from Resolved or Closed. */
  private async reopened(month: Month) {
    const changes = await this.prisma.requestStatusChange.findMany({
      where: {
        from: { in: ['RESOLVED', 'CLOSED'] },
        to: 'IN_PROGRESS',
        createdAt: { gte: month.start, lt: month.end },
      },
      distinct: ['requestId'],
      select: { requestId: true },
    });
    return changes.length;
  }

  /** Requests sent each day of this UK week, Monday to Sunday. */
  private async thisWeek(now: Date) {
    const { days, end } = ukWeek(now);
    const rows = await this.prisma.supportRequest.findMany({
      where: { createdAt: { gte: days[0], lt: end } },
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

  /** The six projects with the most requests. */
  private async byProject() {
    const groups = await this.prisma.supportRequest.groupBy({
      by: ['projectId'],
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

  /** Each active developer this month: assigned, resolved, first response. */
  private async developers(month: Month) {
    const people = await this.prisma.user.findMany({
      where: { role: 'DEVELOPER', status: 'ACTIVE' },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, jobTitle: true },
    });
    return Promise.all(
      people.map(async (person) => {
        const [assigned, resolved, answered] = await Promise.all([
          this.prisma.supportRequest.count({
            where: {
              assigneeId: person.id,
              createdAt: { gte: month.start, lt: month.end },
            },
          }),
          this.prisma.supportRequest.count({
            where: {
              assigneeId: person.id,
              resolvedAt: { gte: month.start, lt: month.end },
            },
          }),
          this.prisma.supportRequest.findMany({
            where: {
              assigneeId: person.id,
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
}
