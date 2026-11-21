/**
 * How long old data is kept (the owner's choice, audit Phase 3: "keep
 * longer"). Support requests, customers and projects are never deleted by
 * this; nor are leads that became customers.
 */
export const KEEP = {
  /** Notifications someone has read. */
  readNotificationsMonths: 12,
  /** Website leads never converted, once closed, lost or cancelled. */
  closedLeadsMonths: 36,
  /** The Activity log. */
  auditYears: 6,
} as const;

/** `months` calendar months before `now` (UTC). */
export function monthsAgo(now: Date, months: number): Date {
  const date = new Date(now);
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}
