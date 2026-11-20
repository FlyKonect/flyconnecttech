import type { Priority } from '../generated/prisma/client.js';
import { defaultSettings, type ResponseTargets } from '../settings/defaults.js';
import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';

/**
 * SLA due times (docs/01, "SLA"; two clocks since Phase 2 of the audit).
 *
 * - Reply clock (`dueAt`): from the response target of the priority (the
 *   "responseTargets" setting). It stops at the first team reply.
 * - Fix clock (`resolveDueAt`): from the resolution target (the
 *   "resolutionTargets" setting). Met when resolved before it.
 *
 * Targets are "30m" or "4h" (around the clock) or "1bd" (business days:
 * Monday to Friday in UK time, not counting the bank holidays in the
 * "slaCalendar" setting). Both clocks pause while a request is Waiting for
 * Customer: when they start again, the due times move later by the wait.
 */

export type Target = { minutes: number } | { businessDays: number };

/** What the SLA maths needs from the settings. */
export type SlaRules = {
  response: ResponseTargets;
  resolution: ResponseTargets;
  /** Bank holidays, "YYYY-MM-DD" in UK time: not business days. */
  holidays: readonly string[];
};

const DAY = 24 * 60 * 60 * 1000;

/** "45m", "4h" or "2bd". Anything else is not a target. */
export function parseTarget(text: string): Target | null {
  const match = /^\s*(\d+)\s*(m|h|bd)\s*$/i.exec(text);
  if (!match) return null;
  const amount = Number(match[1]);
  if (amount <= 0) return null;
  const unit = match[2].toLowerCase();
  if (unit === 'bd') return { businessDays: amount };
  return { minutes: unit === 'h' ? amount * 60 : amount };
}

const isoDay = (utcMidnight: number) =>
  new Date(utcMidnight).toISOString().slice(0, 10);

/**
 * Adds business days in UK time, keeping the time of day.
 * Friday 15:00 + 1 = Monday 15:00. A start on a weekend or a bank holiday
 * counts from the next business day at 00:00, so Saturday + 1 = Tuesday
 * 00:00. Bank holidays are skipped like weekends.
 */
export function addBusinessDays(
  from: Date,
  days: number,
  holidays: readonly string[] = [],
): Date {
  const closed = new Set(holidays);
  const start = ukWallClock(from);
  let date = Date.UTC(start.year, start.month - 1, start.day);
  let weekday = start.weekday;
  let time = {
    hour: start.hour,
    minute: start.minute,
    second: start.second,
    millisecond: start.millisecond,
  };
  const working = () =>
    weekday !== 0 && weekday !== 6 && !closed.has(isoDay(date));

  if (!working()) {
    while (!working()) {
      date += DAY;
      weekday = (weekday + 1) % 7;
    }
    time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
  }

  let left = days;
  while (left > 0) {
    date += DAY;
    weekday = (weekday + 1) % 7;
    if (working()) left -= 1;
  }

  const day = new Date(date);
  return fromUkWallClock({
    year: day.getUTCFullYear(),
    month: day.getUTCMonth() + 1,
    day: day.getUTCDate(),
    ...time,
  });
}

function timeFrom(
  from: Date,
  text: string | undefined,
  fallback: string,
  holidays: readonly string[],
): Date {
  const target = parseTarget(text ?? '') ?? parseTarget(fallback)!;
  if ('minutes' in target) {
    return new Date(from.getTime() + target.minutes * 60_000);
  }
  return addBusinessDays(from, target.businessDays, holidays);
}

/** When the first reply is due for a request of this priority. */
export function dueTime(
  from: Date,
  priority: Priority,
  targets: ResponseTargets,
  holidays: readonly string[] = [],
): Date {
  return timeFrom(
    from,
    targets[priority],
    defaultSettings.responseTargets[priority],
    holidays,
  );
}

/** When the fix is due for a request of this priority. */
export function resolveDueTime(
  from: Date,
  priority: Priority,
  targets: ResponseTargets,
  holidays: readonly string[] = [],
): Date {
  return timeFrom(
    from,
    targets[priority],
    defaultSettings.resolutionTargets[priority],
    holidays,
  );
}

/** Both due times for a request, counted from `from`. */
export function dueTimes(from: Date, priority: Priority, rules: SlaRules) {
  return {
    dueAt: dueTime(from, priority, rules.response, rules.holidays),
    resolveDueAt: resolveDueTime(
      from,
      priority,
      rules.resolution,
      rules.holidays,
    ),
  };
}

/**
 * The due time that counts now: the reply clock until the first team reply,
 * then the fix clock (empty for requests made before it existed).
 */
export function activeDueAt(row: {
  dueAt: Date | null;
  resolveDueAt?: Date | null;
  firstResponseAt?: Date | null;
}): Date | null {
  return row.firstResponseAt ? (row.resolveDueAt ?? null) : row.dueAt;
}

/** The due time after a pause: later by the time spent waiting. */
export function resumedDueTime(dueAt: Date, pausedAt: Date, now: Date): Date {
  const paused = Math.max(0, now.getTime() - pausedAt.getTime());
  return new Date(dueAt.getTime() + paused);
}
