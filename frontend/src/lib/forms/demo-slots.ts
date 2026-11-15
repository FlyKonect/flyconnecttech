/**
 * Demo times offered on the website (docs/01, "Book a demo"):
 * the next 10 weekdays, six 30-minute slots a day, in UK time.
 *
 * Everything is worked out in the Europe/London time zone, whatever time
 * zone the visitor's computer is set to, and stored as a UTC instant.
 */

export const DEMO_TIME_ZONE = "Europe/London";
export const DEMO_SLOT_TIMES = [
  "09:30",
  "11:00",
  "12:30",
  "14:00",
  "15:30",
  "17:00",
] as const;
const DAYS_SHOWN = 10;

export type DemoSlot = {
  /** "09:30", UK time. */
  time: string;
  /** The same moment as a UTC instant, ISO 8601. */
  start: string;
};

export type DemoDay = {
  /** "2026-11-16", the date in the UK. */
  date: string;
  weekdayShort: string; // "Mon"
  dayOfMonth: string; // "16"
  monthShort: string; // "Nov"
  long: string; // "Monday 16 November"
  slots: DemoSlot[];
};

/** The UK calendar date and time of an instant. */
function londonParts(instant: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DEMO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/**
 * The UTC instant of a UK wall-clock time. The UK is UTC+0 in winter and
 * UTC+1 in summer, so the offset is measured for that very day.
 */
export function londonTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const seen = londonParts(new Date(guess));
  const seenAsUtc = Date.UTC(
    seen.year,
    seen.month - 1,
    seen.day,
    seen.hour,
    seen.minute,
  );
  return new Date(guess - (seenAsUtc - guess));
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
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
];

/**
 * The next 10 weekdays after today (UK date), each with its six slots.
 * Today itself is never offered, as in the design.
 */
export function upcomingDemoDays(now: Date = new Date()): DemoDay[] {
  const today = londonParts(now);
  // Work on calendar dates at noon UTC so day steps never cross midnight.
  const cursor = new Date(Date.UTC(today.year, today.month - 1, today.day, 12));
  const days: DemoDay[] = [];

  while (days.length < DAYS_SHOWN) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = cursor.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;

    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const day = cursor.getUTCDate();

    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      weekdayShort: WEEKDAYS[weekday].slice(0, 3),
      dayOfMonth: String(day),
      monthShort: MONTHS[month - 1].slice(0, 3),
      long: `${WEEKDAYS[weekday]} ${day} ${MONTHS[month - 1]}`,
      slots: DEMO_SLOT_TIMES.map((time) => {
        const [hour, minute] = time.split(":").map(Number);
        return {
          time,
          start: londonTimeToUtc(year, month, day, hour, minute).toISOString(),
        };
      }),
    });
  }

  return days;
}

/** One UK day with its six slots, for any date ("2026-11-10"). */
export function demoDayOf(year: number, month: number, day: number): DemoDay {
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    weekdayShort: WEEKDAYS[weekday].slice(0, 3),
    dayOfMonth: String(day),
    monthShort: MONTHS[month - 1].slice(0, 3),
    long: `${WEEKDAYS[weekday]} ${day} ${MONTHS[month - 1]}`,
    slots: DEMO_SLOT_TIMES.map((time) => {
      const [hour, minute] = time.split(":").map(Number);
      return {
        time,
        start: londonTimeToUtc(year, month, day, hour, minute).toISOString(),
      };
    }),
  };
}

/** The UK day an instant falls on, with its slots. */
export function demoDayFor(instant: string | Date): DemoDay {
  const p = londonParts(new Date(instant));
  return demoDayOf(p.year, p.month, p.day);
}

/** "11:00", UK time. */
export function demoTime(instant: string | Date): string {
  const p = londonParts(new Date(instant));
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** "Tuesday 10 November, 11:00 UK time" */
export function demoWhenLong(instant: string | Date): string {
  return `${demoDayFor(instant).long}, ${demoTime(instant)} UK time`;
}

/** "Tue 10 Nov", UK date. */
export function demoDayShort(instant: string | Date): string {
  const day = demoDayFor(instant);
  return `${day.weekdayShort} ${day.dayOfMonth} ${day.monthShort}`;
}
