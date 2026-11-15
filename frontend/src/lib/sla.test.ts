import { describe, expect, test } from "vitest";

import {
  calendarDaysBetween,
  formatDuration,
  lastMonthName,
} from "./format-time";
import { slaBadge } from "./sla";

const UK = "Europe/London";
const now = new Date("2026-11-09T09:22:00Z"); // Monday, 09:22 in the UK
const open = (dueAt: string | null) =>
  slaBadge({ status: "IN_PROGRESS", dueAt, resolvedAt: null }, UK, now);

describe("SLA badges", () => {
  test("less than an hour left is at risk", () => {
    expect(open("2026-11-09T10:00:00Z")).toEqual({
      state: "AT_RISK",
      label: "Due in 38m",
    });
    expect(open("2026-11-09T09:00:00Z")).toEqual({
      state: "AT_RISK",
      label: "Overdue",
    });
  });

  test("later today, tomorrow, and further out", () => {
    expect(open("2026-11-09T11:32:00Z")).toEqual({
      state: "ON_TRACK",
      label: "Due in 2h 10m",
    });
    expect(open("2026-11-10T09:00:00Z")?.label).toBe("Due tomorrow");
    expect(open("2026-11-12T09:00:00Z")?.label).toBe("Due in 3 days");
  });

  test("paused while waiting for the customer, met when resolved in time", () => {
    expect(
      slaBadge(
        { status: "WAITING_FOR_CUSTOMER", dueAt: null, resolvedAt: null },
        UK,
        now,
      ),
    ).toEqual({ state: "PAUSED", label: "Paused" });
    expect(
      slaBadge(
        {
          status: "CLOSED",
          dueAt: "2026-11-09T12:00:00Z",
          resolvedAt: "2026-11-09T11:00:00Z",
        },
        UK,
        now,
      ),
    ).toEqual({ state: "MET", label: "Met" });
    expect(
      slaBadge(
        {
          status: "RESOLVED",
          dueAt: "2026-11-09T10:00:00Z",
          resolvedAt: "2026-11-09T11:00:00Z",
        },
        UK,
        now,
      ),
    ).toBeNull();
  });

  test("no due time, no badge", () => {
    expect(open(null)).toBeNull();
  });
});

describe("dashboard helpers", () => {
  test("durations", () => {
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(102)).toBe("1h 42m");
    expect(formatDuration(180)).toBe("3h");
    expect(formatDuration(60 * 26)).toBe("1d 2h");
    expect(formatDuration(60 * 48)).toBe("2d");
  });

  test("calendar days and the month before", () => {
    expect(calendarDaysBetween(now, "2026-11-10T23:30:00Z", UK)).toBe(1);
    expect(lastMonthName(now, UK)).toBe("October");
    expect(lastMonthName("2027-01-05T10:00:00Z", UK)).toBe("December");
  });
});
