/**
 * UK wall-clock time (Europe/London), where the business works.
 * Used for business days in the SLA and, later, for demo slots.
 */

const UK = 'Europe/London';

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: UK,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  weekday: 'short',
  hourCycle: 'h23',
});

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export type WallClock = {
  year: number;
  /** 1 to 12. */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

/** What a clock in the UK showed at this moment. weekday: 0 is Sunday. */
export function ukWallClock(when: Date): WallClock & { weekday: number } {
  const parts = Object.fromEntries(
    format.formatToParts(when).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    millisecond: when.getUTCMilliseconds(),
    weekday: WEEKDAYS.indexOf(parts.weekday),
  };
}

/** How far UK time is ahead of UTC at this moment, in milliseconds. */
function ukOffset(time: number): number {
  const clock = ukWallClock(new Date(time));
  const asUtc = Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
    clock.second,
    clock.millisecond,
  );
  return asUtc - time;
}

/** The moment a UK clock shows this time. */
export function fromUkWallClock(clock: WallClock): Date {
  const guess = Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
    clock.second,
    clock.millisecond,
  );
  // Correct twice: the first guess can land on the other side of a clock
  // change (last Sunday of March and of October).
  const first = guess - ukOffset(guess);
  return new Date(guess - ukOffset(first));
}
