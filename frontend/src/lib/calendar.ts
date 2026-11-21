/**
 * Calendar days for the date picker (`components/ui/date-input.tsx`).
 *
 * A day is a "YYYY-MM-DD" string, the format the backend takes. The sums are
 * done in UTC, so no time zone or clock change ever moves a day. The weeks
 * start on Monday, as in the UK.
 */

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Monday first. */
export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Parts = { year: number; month: number; day: number };

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

function fromDate(date: Date): string {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** The day for a year, a month (0 to 11) and a day of the month; overflow rolls on. */
export function dayOf(year: number, month: number, day: number): string {
  const date = new Date(Date.UTC(2000, 0, 1));
  date.setUTCFullYear(year, month, day);
  return fromDate(date);
}

/** Year, month (0 to 11) and day of a real "YYYY-MM-DD" day, otherwise null. */
export function partsOf(value: string): Parts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const parts = {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
  return dayOf(parts.year, parts.month, parts.day) === value ? parts : null;
}

export function isDay(value: unknown): value is string {
  return typeof value === "string" && partsOf(value) !== null;
}

/** Today where the person is (their computer's date). */
export function today(now = new Date()): string {
  return dayOf(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(value: string, days: number): string {
  const { year, month, day } = partsOf(value)!;
  return dayOf(year, month, day + days);
}

/** Same day of the month, or its last day ("31 Jan" + 1 month = "28 Feb"). */
export function addMonths(value: string, months: number): string {
  const { year, month, day } = partsOf(value)!;
  const last = daysInMonth(year, month + months);
  return dayOf(year, month + months, Math.min(day, last));
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** 0 for Monday to 6 for Sunday. */
export function weekdayIndex(value: string): number {
  const { year, month, day } = partsOf(value)!;
  return (new Date(Date.UTC(year, month, day)).getUTCDay() + 6) % 7;
}

export function startOfWeek(value: string): string {
  return addDays(value, -weekdayIndex(value));
}

export function endOfWeek(value: string): string {
  return addDays(value, 6 - weekdayIndex(value));
}

/** Six weeks of days, Monday first, around the month (0 to 11). */
export function monthGrid(year: number, month: number): string[][] {
  const first = startOfWeek(dayOf(year, month, 1));
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)),
  );
}

/** Inside the earliest and latest days allowed (either may be missing). */
export function inRange(value: string, min?: string, max?: string): boolean {
  if (min && isDay(min) && value < min) return false;
  if (max && isDay(max) && value > max) return false;
  return true;
}

/** The nearest day inside the range. */
export function clampDay(value: string, min?: string, max?: string): string {
  if (min && isDay(min) && value < min) return min;
  if (max && isDay(max) && value > max) return max;
  return value;
}

/** "21/11/2026", as people type it in the UK. Not a day: "". */
export function typedDay(value: string): string {
  const parts = partsOf(value);
  if (!parts) return "";
  return `${pad(parts.day)}/${pad(parts.month + 1)}/${parts.year}`;
}

/** "Friday 21 November 2026", for screen readers. */
export function longDay(value: string): string {
  const parts = partsOf(value);
  if (!parts) return "";
  return `${WEEKDAYS[weekdayIndex(value)]} ${parts.day} ${MONTHS[parts.month]} ${parts.year}`;
}

/** "November 2026". */
export function monthTitle(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

const monthNumber = (word: string): number | null => {
  const index = MONTHS.findIndex((name) =>
    name.toLowerCase().startsWith(word.toLowerCase().slice(0, 3)),
  );
  return word.length >= 3 && index >= 0 ? index : null;
};

const yearOf = (text: string) =>
  text.length === 2 ? 2000 + Number(text) : Number(text);

/**
 * A typed date as a day, or null when it isn't one. Takes "21/11/2026"
 * (also with "-", "." or spaces, and "21/11/26"), "21112026", "2026-11-21"
 * and "21 Nov 2026" or "Fri 21 November 2026".
 */
export function parseTyped(text: string): string | null {
  const value = text.trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (!value) return null;

  const check = (year: number, month: number, day: number) => {
    if (year < 1000 || year > 9999) return null;
    const result = dayOf(year, month, day);
    const parts = partsOf(result);
    return parts && parts.month === month && parts.day === day ? result : null;
  };

  let match = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value);
  if (match) {
    return check(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  match = /^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4}|\d{2})$/.exec(value);
  if (match) {
    return check(yearOf(match[3]), Number(match[2]) - 1, Number(match[1]));
  }
  match = /^(\d{2})(\d{2})(\d{4})$/.exec(value);
  if (match) {
    return check(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  }
  match = /^(?:[a-z]+ )?(\d{1,2})(?:st|nd|rd|th)? ([a-z]+) (\d{4})$/i.exec(
    value,
  );
  if (match) {
    const month = monthNumber(match[2]);
    return month === null
      ? null
      : check(Number(match[3]), month, Number(match[1]));
  }
  return null;
}
