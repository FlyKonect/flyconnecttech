import type {
  Budget,
  DemoTopic,
  MessageTopic,
  ProjectType,
  QuoteProjectType,
  Timeline,
} from '../generated/prisma/client.js';
import { fromUkWallClock, ukWallClock } from '../time/uk-time.js';

/**
 * The fixed rules and words for website leads (docs/01, sections 2 and 6),
 * shared by the public forms, the team routes and the emails.
 */

// ------------------------------------------------------------ labels

export const DEMO_TOPIC_LABELS: Record<DemoTopic, string> = {
  TRAVEL_BOOKING_PLATFORM: 'Travel booking platform',
  AGENT_ADMIN_DASHBOARDS: 'Agent and admin dashboards',
  CUSTOM_SOFTWARE_WEBSITES: 'Custom software and websites',
  API_INTEGRATIONS: 'API and integrations',
};

export const QUOTE_TYPE_LABELS: Record<QuoteProjectType, string> = {
  TRAVEL_BOOKING_PLATFORM: 'Travel booking platform',
  AMADEUS_SABRE_INTEGRATION: 'Amadeus / Sabre integration',
  NEW_WEBSITE: 'New website',
  WEBSITE_REDESIGN: 'Website redesign',
  CUSTOM_SOFTWARE: 'Custom software',
  UI_UX_DESIGN: 'UI/UX design',
  API_INTEGRATION: 'API integration',
  OTHER: 'Other',
};

export const BUDGET_LABELS: Record<Budget, string> = {
  UNDER_5K: 'Under $5k',
  FROM_5K_TO_15K: '$5k – $15k',
  FROM_15K_TO_50K: '$15k – $50k',
  OVER_50K: '$50k+',
  NOT_SURE: 'Not sure yet',
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  ASAP: 'As soon as possible',
  WITHIN_1_3_MONTHS: 'Within 1–3 months',
  WITHIN_3_6_MONTHS: 'Within 3–6 months',
  NOT_SURE: 'Not sure yet',
};

export const MESSAGE_TOPIC_LABELS: Record<MessageTopic, string> = {
  GENERAL_QUESTION: 'General question',
  PARTNERSHIP: 'Partnership',
  EXISTING_PROJECT: 'An existing project',
  SOMETHING_ELSE: 'Something else',
};

/** Cancel demo (docs/01 §6). */
export const CANCEL_REASONS = [
  'Asked to reschedule later',
  'No longer interested',
  'Duplicate request',
  'No reply',
] as const;

/** Mark as lost (docs/01 §6). */
export const LOST_REASONS = [
  'Budget',
  'Timing',
  'Chose another provider',
  'No reply',
  'Not a fit',
] as const;

// ------------------------------------------------------- source pages

/** The website's pages, by address, as the team sees them ("… page"). */
const PAGES: Record<string, string> = {
  '/': 'Home',
  '/solutions': 'Products & Solutions',
  '/travel-technology': 'Travel Technology',
  '/services': 'Services',
  '/services/website-development': 'Website Development',
  '/services/ui-ux-design': 'UI/UX Design',
  '/services/api-integrations': 'API Integrations',
  '/case-studies': 'Case Studies',
  '/about': 'About Us',
  '/contact': 'Contact & Quote',
  '/support': 'Support',
};

/** "Travel Technology" for "/travel-technology"; "Website" for anything else. */
export function pageName(path: string | undefined): string {
  const clean = (path ?? '').split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return PAGES[clean] ?? 'Website';
}

// --------------------------------------------------------- demo slots

/** The six 30-minute demo slots a day, UK time. */
export const DEMO_SLOT_TIMES = [
  '09:30',
  '11:00',
  '12:30',
  '14:00',
  '15:30',
  '17:00',
] as const;
export const DEMO_MINUTES = 30;
/** How many weekdays ahead the website offers. */
export const DEMO_DAYS_OFFERED = 10;

/** The slots on the website: the next 10 weekdays after today (UK). */
export function offeredDemoSlots(now = new Date()): Date[] {
  const today = ukWallClock(now);
  const cursor = new Date(Date.UTC(today.year, today.month - 1, today.day, 12));
  const slots: Date[] = [];
  let days = 0;
  while (days < DEMO_DAYS_OFFERED) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const weekday = cursor.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    days++;
    for (const time of DEMO_SLOT_TIMES) {
      const [hour, minute] = time.split(':').map(Number);
      slots.push(
        fromUkWallClock({
          year: cursor.getUTCFullYear(),
          month: cursor.getUTCMonth() + 1,
          day: cursor.getUTCDate(),
          hour,
          minute,
          second: 0,
          millisecond: 0,
        }),
      );
    }
  }
  return slots;
}

/**
 * A real demo time: in the future, on a UK weekday, at one of the six
 * slots. (The team may confirm any such time, not only the offered days.)
 */
export function isDemoSlot(start: Date, now = new Date()): boolean {
  if (Number.isNaN(start.getTime()) || start <= now) return false;
  const clock = ukWallClock(start);
  if (clock.weekday === 0 || clock.weekday === 6) return false;
  if (clock.second !== 0 || clock.millisecond !== 0) return false;
  return (DEMO_SLOT_TIMES as readonly string[]).includes(ukClock(start));
}

/** A time the website offers today: one of the next 10 weekdays' slots. */
export function isOfferedSlot(start: Date, now = new Date()): boolean {
  return offeredDemoSlots(now).some(
    (slot) => slot.getTime() === start.getTime(),
  );
}

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
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

/** "11:00", UK time. */
export function ukClock(when: Date): string {
  const clock = ukWallClock(when);
  return `${String(clock.hour).padStart(2, '0')}:${String(clock.minute).padStart(2, '0')}`;
}

/** "Tuesday 10 November", UK date. */
export function ukDayLong(when: Date): string {
  const clock = ukWallClock(when);
  return `${WEEKDAYS[clock.weekday]} ${clock.day} ${MONTHS[clock.month - 1]}`;
}

/** "Tue 10 Nov", UK date. */
export function ukDayShort(when: Date): string {
  const clock = ukWallClock(when);
  return `${WEEKDAYS[clock.weekday].slice(0, 3)} ${clock.day} ${MONTHS[clock.month - 1].slice(0, 3)}`;
}

/** "Tuesday 10 November, 11:00 UK time" */
export function ukSlotLong(when: Date): string {
  return `${ukDayLong(when)}, ${ukClock(when)} UK time`;
}

/** "23 November 2026", a calendar date (stored at midnight UTC). */
export function longDate(date: Date): string {
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

// ---------------------------------------------------------- estimates

/** "$24,000", or "$24,000.50" when there are cents. */
export function formatUsd(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/** The estimate's starting amount from their budget (the design's numbers). */
export const ESTIMATE_FROM_BUDGET: Record<Budget, number | null> = {
  UNDER_5K: 4500,
  FROM_5K_TO_15K: 9800,
  FROM_15K_TO_50K: 24000,
  OVER_50K: 60000,
  NOT_SURE: null,
};

// ------------------------------------------------------------ convert

/** The project type a converted lead starts with (docs/01 §6). */
export const PROJECT_TYPE_FROM_DEMO: Record<DemoTopic, ProjectType> = {
  TRAVEL_BOOKING_PLATFORM: 'TRAVEL_BOOKING_PLATFORM',
  AGENT_ADMIN_DASHBOARDS: 'AGENT_PORTAL',
  CUSTOM_SOFTWARE_WEBSITES: 'CUSTOM_SOFTWARE',
  API_INTEGRATIONS: 'API_INTEGRATION',
};

export const PROJECT_TYPE_FROM_QUOTE: Record<QuoteProjectType, ProjectType> = {
  TRAVEL_BOOKING_PLATFORM: 'TRAVEL_BOOKING_PLATFORM',
  AMADEUS_SABRE_INTEGRATION: 'API_INTEGRATION',
  API_INTEGRATION: 'API_INTEGRATION',
  NEW_WEBSITE: 'WEBSITE',
  WEBSITE_REDESIGN: 'WEBSITE',
  CUSTOM_SOFTWARE: 'CUSTOM_SOFTWARE',
  UI_UX_DESIGN: 'UI_UX_DESIGN',
  OTHER: 'WEB_APPLICATION',
};

const PROJECT_WORD: Record<ProjectType, string> = {
  WEBSITE: 'website',
  WEB_APPLICATION: 'web app',
  TRAVEL_BOOKING_PLATFORM: 'booking platform',
  AGENT_PORTAL: 'agent portal',
  API_INTEGRATION: 'integration',
  CUSTOM_SOFTWARE: 'software',
  UI_UX_DESIGN: 'design project',
  MAINTENANCE_PLAN: 'maintenance plan',
};

/** "Coastline booking platform": the company's first word (or their surname). */
export function suggestedProjectName(
  company: string | null,
  name: string,
  type: ProjectType,
): string {
  const base =
    company?.trim().split(/\s+/)[0] ||
    name.trim().split(/\s+/).slice(-1)[0] ||
    'New';
  return `${base} ${PROJECT_WORD[type]}`;
}

/** "Olivia" from "Olivia Grant". */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
