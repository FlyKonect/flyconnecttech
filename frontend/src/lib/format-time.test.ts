import { describe, expect, test } from "vitest";

import {
  formatDate,
  formatLongDate,
  formatMessageTime,
  formatShortWhen,
  formatWhen,
  greeting,
} from "./format-time";

const UK = "Europe/London";
// Monday 9 November 2026, 10:00 in the UK (the design's "today").
const now = new Date("2026-11-09T10:00:00Z");

describe("dates and times as the design writes them", () => {
  test("today shows the time, other days the date", () => {
    expect(formatWhen("2026-11-09T08:50:00Z", UK, now)).toBe("Today, 08:50");
    expect(formatWhen("2026-11-08T15:00:00Z", UK, now)).toBe("8 Nov 2026");
  });

  test("short dates drop this year", () => {
    expect(formatShortWhen("2026-11-09T08:50:00Z", UK, now)).toBe(
      "Today, 08:50",
    );
    expect(formatShortWhen("2026-10-28T09:00:00Z", UK, now)).toBe("28 Oct");
    expect(formatShortWhen("2025-10-28T09:00:00Z", UK, now)).toBe(
      "28 Oct 2025",
    );
  });

  test("conversation times", () => {
    expect(formatMessageTime("2026-11-02T10:14:00Z", UK, now)).toBe(
      "2 Nov, 10:14",
    );
    expect(formatMessageTime("2026-11-09T08:50:00Z", UK, now)).toBe(
      "Today, 08:50",
    );
  });

  test("uses the person's own time zone", () => {
    // 22:30 in London on 8 November is already 9 November in Karachi.
    expect(formatWhen("2026-11-08T22:30:00Z", "Asia/Karachi", now)).toBe(
      "Today, 03:30",
    );
    expect(formatDate("2026-11-08T22:30:00Z", "Asia/Karachi")).toBe(
      "9 Nov 2026",
    );
  });

  test("summer time in the UK", () => {
    expect(
      formatMessageTime("2026-07-01T09:00:00Z", UK, new Date("2026-07-05")),
    ).toBe("1 Jul, 10:00");
  });

  test("the Overview's date line and greeting", () => {
    expect(formatLongDate(now, UK)).toBe("Monday, 9 November");
    expect(greeting("2026-11-09T09:00:00Z", UK)).toBe("Good morning");
    expect(greeting("2026-11-09T13:00:00Z", UK)).toBe("Good afternoon");
    expect(greeting("2026-11-09T19:30:00Z", UK)).toBe("Good evening");
  });

  test("an unknown time zone falls back to the UK", () => {
    expect(formatDate("2026-11-08T22:30:00Z", "Mars/Olympus")).toBe(
      "8 Nov 2026",
    );
  });
});
