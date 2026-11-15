import type { Priority } from '../generated/prisma/client.js';
import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';

/** Plain calculations for the dashboards, kept apart so they can be tested. */

/**
 * A calendar month in UK time, as [start, end). `offset` 0 is this month,
 * -1 the month before.
 */
export function ukMonth(now: Date, offset = 0): { start: Date; end: Date } {
  const clock = ukWallClock(now);
  const first = (monthsAhead: number) => {
    const index = clock.year * 12 + (clock.month - 1) + offset + monthsAhead;
    return fromUkWallClock({
      year: Math.floor(index / 12),
      month: (index % 12) + 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  };
  return { start: first(0), end: first(1) };
}

/** The average time from arriving to the first reply, in whole minutes. */
export function averageMinutes(
  rows: { createdAt: Date; firstResponseAt: Date | null }[],
): number | null {
  const times = rows
    .filter((row) => row.firstResponseAt)
    .map((row) => row.firstResponseAt!.getTime() - row.createdAt.getTime());
  if (!times.length) return null;
  const total = times.reduce((sum, time) => sum + Math.max(0, time), 0);
  return Math.round(total / times.length / 60_000);
}

const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Most urgent first: by priority, then the earliest due time. */
export function byUrgency<T extends { priority: Priority; dueAt: Date | null }>(
  a: T,
  b: T,
): number {
  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (byPriority) return byPriority;
  const due = (row: T) => row.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return due(a) - due(b);
}
