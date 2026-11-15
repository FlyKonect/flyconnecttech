import { calendarDaysBetween, formatDuration } from "@/lib/format-time";
import type { RequestStatus, SlaState } from "@/lib/labels";

/**
 * The SLA badge for a request (docs/01, "SLA"): "Due in 38m", "Due in 2h 10m",
 * "Due tomorrow", "Due in 3 days", "Overdue", "Paused" or "Met".
 * Less than an hour left (or past due) is "at risk". Days are counted in the
 * person's own time zone.
 */
export type SlaBadge = { state: SlaState; label: string };

export function slaBadge(
  request: {
    status: RequestStatus;
    dueAt: string | null;
    resolvedAt: string | null;
  },
  timeZone: string,
  now = new Date(),
): SlaBadge | null {
  const { status, dueAt, resolvedAt } = request;

  if (status === "RESOLVED" || status === "CLOSED") {
    return resolvedAt && dueAt && new Date(resolvedAt) <= new Date(dueAt)
      ? { state: "MET", label: "Met" }
      : null;
  }
  if (status === "WAITING_FOR_CUSTOMER") {
    return { state: "PAUSED", label: "Paused" };
  }
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
