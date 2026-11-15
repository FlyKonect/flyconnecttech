/**
 * Dates and times as the design writes them, in the person's own time zone
 * (from their profile; Europe/London when unknown):
 *
 *   formatWhen         "Today, 08:50"  or  "8 Nov 2026"
 *   formatShortWhen    "Today, 08:50"  or  "8 Nov"         (other years: "8 Nov 2025")
 *   formatMessageTime  "Today, 08:50"  or  "2 Nov, 10:14"  (other years: "2 Nov 2025, 10:14")
 *   formatDate         "6 Nov 2026"
 *   formatLongDate     "Monday, 9 November"
 *   greeting           "Good morning" / "Good afternoon" / "Good evening"
 */

type When = Date | string;

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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

const formats = new Map<string, Intl.DateTimeFormat>();

function formatFor(timeZone: string): Intl.DateTimeFormat {
  let format = formats.get(timeZone);
  if (!format) {
    try {
      format = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "long",
        hourCycle: "h23",
      });
    } catch {
      // An unknown time zone: use the UK's.
      return formatFor("Europe/London");
    }
    formats.set(timeZone, format);
  }
  return format;
}

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: string;
  minute: string;
  weekday: string;
};

function parts(when: When, timeZone: string): Parts {
  const date = typeof when === "string" ? new Date(when) : when;
  const found = Object.fromEntries(
    formatFor(timeZone)
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(found.year),
    month: Number(found.month),
    day: Number(found.day),
    hour: found.hour,
    minute: found.minute,
    weekday: found.weekday,
  };
}

const sameDay = (a: Parts, b: Parts) =>
  a.year === b.year && a.month === b.month && a.day === b.day;
const clock = (p: Parts) => `${p.hour}:${p.minute}`;
const dayMonth = (p: Parts) => `${p.day} ${SHORT_MONTHS[p.month - 1]}`;

export function formatWhen(when: When, timeZone: string, now = new Date()) {
  const p = parts(when, timeZone);
  if (sameDay(p, parts(now, timeZone))) return `Today, ${clock(p)}`;
  return `${dayMonth(p)} ${p.year}`;
}

export function formatShortWhen(
  when: When,
  timeZone: string,
  now = new Date(),
) {
  const p = parts(when, timeZone);
  const today = parts(now, timeZone);
  if (sameDay(p, today)) return `Today, ${clock(p)}`;
  return p.year === today.year ? dayMonth(p) : `${dayMonth(p)} ${p.year}`;
}

export function formatMessageTime(
  when: When,
  timeZone: string,
  now = new Date(),
) {
  const p = parts(when, timeZone);
  const today = parts(now, timeZone);
  if (sameDay(p, today)) return `Today, ${clock(p)}`;
  const date = p.year === today.year ? dayMonth(p) : `${dayMonth(p)} ${p.year}`;
  return `${date}, ${clock(p)}`;
}

export function formatDate(when: When, timeZone: string) {
  const p = parts(when, timeZone);
  return `${dayMonth(p)} ${p.year}`;
}

export function formatLongDate(when: When, timeZone: string) {
  const p = parts(when, timeZone);
  return `${p.weekday}, ${p.day} ${MONTHS[p.month - 1]}`;
}

export function greeting(when: When, timeZone: string) {
  const hour = Number(parts(when, timeZone).hour);
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** How many calendar days from `from` to `to`, in this time zone (0 = same day). */
export function calendarDaysBetween(from: When, to: When, timeZone: string) {
  const day = (when: When) => {
    const p = parts(when, timeZone);
    return Date.UTC(p.year, p.month - 1, p.day) / 86_400_000;
  };
  return day(to) - day(from);
}

/** The full name of the month before this one, for example "October". */
export function lastMonthName(when: When, timeZone: string) {
  const month = parts(when, timeZone).month;
  return MONTHS[(month + 10) % 12];
}

/** A length of time: "45m", "1h 42m", "3h", "2d 4h". */
export function formatDuration(minutes: number) {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}m`;
  if (total < 24 * 60) {
    const hours = Math.floor(total / 60);
    const rest = total % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }
  const days = Math.floor(total / (24 * 60));
  const hours = Math.floor((total % (24 * 60)) / 60);
  return hours ? `${days}d ${hours}h` : `${days}d`;
}
