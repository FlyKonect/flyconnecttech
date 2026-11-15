import { ukClock, ukDayShort } from '../time/uk-time.js';

/** "1 request", "3 requests". */
export function requestCount(count: number): string {
  return `${count} ${count === 1 ? 'request' : 'requests'}`;
}

/** How long a request has waited: "Waiting 5 hours", "Waiting 2 days". */
export function waitingFor(createdAt: Date, now: Date): string {
  const hours = Math.floor((now.getTime() - createdAt.getTime()) / 3_600_000);
  if (hours < 1) return 'Waiting under an hour';
  if (hours < 24) return `Waiting ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  const days = Math.floor(hours / 24);
  return `Waiting ${days} ${days === 1 ? 'day' : 'days'}`;
}

/** The SLA due time in UK time: "Due Tue 10 Nov, 14:00", or "Overdue". */
export function dueWords(dueAt: Date | null, now: Date): string | null {
  if (!dueAt) return null;
  if (dueAt <= now) return 'Overdue';
  return `Due ${ukDayShort(dueAt)}, ${ukClock(dueAt)}`;
}
