import { calendarDaysBetween, formatDuration } from "@/lib/format-time";
import type { RequestStatus, SlaState } from "@/lib/labels";

/**
 * The SLA badge for a request (docs/01, "SLA"): "Due in 38m", "Due in 2h 10m",
 * "Due tomorrow", "Due in 3 days", "Overdue", "Paused" or "Met". It follows
 * the reply clock until the first team reply, then the fix clock.
 * Less than an hour left (or past due) is "at risk". Days are counted in the
 * person's own time zone.
 */
export type SlaBadge = { state: SlaState; label: string };

export function slaBadge(
  request: {
    status: RequestStatus;
    dueAt: string | null;
    /** The fix clock; empty for requests made before it existed. */
    resolveDueAt?: string | null;
    /** Set once the team replied: the reply clock has stopped. */
    firstResponseAt?: string | null;
    resolvedAt: string | null;
  },
  timeZone: string,
  now = new Date(),
): SlaBadge | null {
  const { status, resolvedAt } = request;

  if (status === "RESOLVED" || status === "CLOSED") {
    // Met: fixed in time (older requests: by their only due time).
    const deadline = request.resolveDueAt ?? request.dueAt;
    return resolvedAt && deadline && new Date(resolvedAt) <= new Date(deadline)
      ? { state: "MET", label: "Met" }
      : null;
  }
  if (status === "WAITING_FOR_CUSTOMER") {
    return { state: "PAUSED", label: "Paused" };
  }
  // The clock that counts: reply until the first team reply, then fix.
  const dueAt = request.firstResponseAt
    ? (request.resolveDueAt ?? null)
    : request.dueAt;
  if (!dueAt) return null;

  const minutesLeft = (new Date(dueAt).getTime() - now.getTime()) / 60_000;
  if (minutesLeft < 0) return { state: "AT_RISK", label: "Overdue" };
  if (minutesLeft < 60) {
    return {
      state: "AT_RISK",
      label: `Due in ${Math.max(1, Math.floor(minutesLeft))}m`,
    };
  }
  const days = calendarDaysBetween(now, dueAt, timeZone);
  if (days === 0) {
    return {
      state: "ON_TRACK",
      label: `Due in ${formatDuration(Math.floor(minutesLeft))}`,
    };
  }
  return {
    state: "ON_TRACK",
    label: days === 1 ? "Due tomorrow" : `Due in ${days} days`,
  };
}
