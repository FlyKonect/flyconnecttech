import type { Priority } from '../generated/prisma/client.js';
import { defaultSettings, type ResponseTargets } from '../settings/defaults.js';
import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';

/**
 * SLA due times (docs/01, "SLA").
 *
 * The due time comes from the response target of the request's priority
 * (the "responseTargets" setting): "30m" or "4h" (around the clock) or
 * "1bd" (business days: Monday to Friday, UK time).
 *
 * The clock pauses while a request is Waiting for Customer: when it starts
 * again, the due time moves later by the time spent waiting.
 */

export type Target = { minutes: number } | { businessDays: number };

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

/**
 * Adds business days in UK time, keeping the time of day.
 * Friday 15:00 + 1 = Monday 15:00. A start on a weekend counts from
 * Monday 00:00, so Saturday + 1 = Tuesday 00:00.
 */
export function addBusinessDays(from: Date, days: number): Date {
  const start = ukWallClock(from);
  let date = Date.UTC(start.year, start.month - 1, start.day);
  let weekday = start.weekday;
  let time = {
    hour: start.hour,
    minute: start.minute,
    second: start.second,
    millisecond: start.millisecond,
  };

  if (weekday === 6 || weekday === 0) {
    date += (weekday === 6 ? 2 : 1) * DAY;
    weekday = 1;
    time = { hour: 0, minute: 0, second: 0, millisecond: 0 };
  }

  let left = days;
  while (left > 0) {
    date += DAY;
    weekday = (weekday + 1) % 7;
    if (weekday !== 0 && weekday !== 6) left -= 1;
  }

  const day = new Date(date);
  return fromUkWallClock({
    year: day.getUTCFullYear(),
    month: day.getUTCMonth() + 1,
    day: day.getUTCDate(),
    ...time,
  });
}

/** When a request of this priority is due, counted from `from`. */
export function dueTime(
  from: Date,
  priority: Priority,
  targets: ResponseTargets,
): Date {
  const target =
    parseTarget(targets[priority] ?? '') ??
    parseTarget(defaultSettings.responseTargets[priority])!;
  if ('minutes' in target) {
    return new Date(from.getTime() + target.minutes * 60_000);
  }
  return addBusinessDays(from, target.businessDays);
}

/** The due time after a pause: later by the time spent waiting. */
export function resumedDueTime(dueAt: Date, pausedAt: Date, now: Date): Date {
  const paused = Math.max(0, now.getTime() - pausedAt.getTime());
  return new Date(dueAt.getTime() + paused);
}
