import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';

/**
 * Plain calculations and words for Reports & Analytics (screen 31), kept
 * apart so they can be tested. Months and weeks are UK ones.
 */

export type ChangeTone = 'better' | 'worse' | 'same';
export type Change = { text: string; tone: ChangeTone };

const DAY_MINUTES = 24 * 60;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** "52m", "1h 42m", "2d 3h". The same words as the dashboard. */
export function durationWords(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}m`;
  if (total < DAY_MINUTES) {
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  const days = Math.floor(total / DAY_MINUTES);
  const hours = Math.floor((total % DAY_MINUTES) / 60);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}

/** "1 day", "2.6 days" (one decimal, none when it is whole). */
export function dayWords(days: number): string {
  const rounded = Math.round(days * 10) / 10;
  return rounded === 1 ? '1 day' : `${rounded} days`;
}

/** Resolution time: "2.6 days", or under a day "18h" / "45m". */
export function resolutionWords(minutes: number): string {
  if (minutes < DAY_MINUTES) return durationWords(minutes);
  return dayWords(minutes / DAY_MINUTES);
}

/** "18% faster than October", "18% slower than October", "Same as October". */
export function firstResponseChange(
  thisMonth: number | null,
  lastMonth: number | null,
  lastMonthName: string,
): Change | null {
  if (thisMonth === null || lastMonth === null || lastMonth === 0) return null;
  const percent = Math.round(((lastMonth - thisMonth) / lastMonth) * 100);
  if (percent > 0) {
    return { text: `${percent}% faster than ${lastMonthName}`, tone: 'better' };
  }
  if (percent < 0) {
    return { text: `${-percent}% slower than ${lastMonthName}`, tone: 'worse' };
  }
  return { text: `Same as ${lastMonthName}`, tone: 'same' };
}

/** "0.4 days faster", "1 day slower", "Same as last month". */
export function resolutionChange(
  thisMonth: number | null,
  lastMonth: number | null,
): Change | null {
  if (thisMonth === null || lastMonth === null) return null;
  const days = Math.round(((lastMonth - thisMonth) / DAY_MINUTES) * 10) / 10;
  if (days > 0) return { text: `${dayWords(days)} faster`, tone: 'better' };
  if (days < 0) return { text: `${dayWords(-days)} slower`, tone: 'worse' };
  return { text: 'Same as last month', tone: 'same' };
}

/** "+6 vs last month", "−2 vs last month", "Same as last month". */
export function countChange(thisMonth: number, lastMonth: number): Change {
  const difference = thisMonth - lastMonth;
  if (difference > 0) {
    return { text: `+${difference} vs last month`, tone: 'better' };
  }
  if (difference < 0) {
    return { text: `−${-difference} vs last month`, tone: 'worse' };
  }
  return { text: 'Same as last month', tone: 'same' };
}

/** "5% of resolved", or nothing when nothing was resolved. */
export function reopenedShare(
  reopened: number,
  resolved: number,
): string | null {
  if (!resolved) return null;
  return `${Math.round((reopened / resolved) * 100)}% of resolved`;
}

/** The average of (to - from) in whole minutes, or null with no rows. */
export function averageBetween(
  rows: { from: Date; to: Date | null }[],
): number | null {
  const times = rows
    .filter((row) => row.to)
    .map((row) => Math.max(0, row.to!.getTime() - row.from.getTime()));
  if (!times.length) return null;
  return Math.round(
    times.reduce((sum, time) => sum + time, 0) / times.length / 60_000,
  );
}

/** This UK week: the start of Monday to Sunday, and the next Monday. */
export function ukWeek(now: Date): { days: Date[]; end: Date } {
  const clock = ukWallClock(now);
  // weekday: 0 is Sunday; Monday starts the week.
  const back = (clock.weekday + 6) % 7;
  const monday = Date.UTC(clock.year, clock.month - 1, clock.day - back, 12);
  const start = (offset: number) => {
    const day = new Date(monday + offset * 86_400_000);
    return fromUkWallClock({
      year: day.getUTCFullYear(),
      month: day.getUTCMonth() + 1,
      day: day.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  };
  return { days: [0, 1, 2, 3, 4, 5, 6].map(start), end: start(7) };
}
