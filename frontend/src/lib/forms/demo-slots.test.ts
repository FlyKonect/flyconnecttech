import { describe, expect, test } from "vitest";

import { londonTimeToUtc, upcomingDemoDays } from "@/lib/forms/demo-slots";

describe("upcomingDemoDays", () => {
  test("gives the next 10 weekdays, starting tomorrow", () => {
    // Monday 9 November 2026, 10:00 UK time (the design's "today").
    const days = upcomingDemoDays(new Date("2026-11-09T10:00:00Z"));

    expect(days).toHaveLength(10);
    expect(days[0]).toMatchObject({
      date: "2026-11-10",
      weekdayShort: "Tue",
      dayOfMonth: "10",
      monthShort: "Nov",
      long: "Tuesday 10 November",
    });
    // Weekends are skipped: Friday 13 is followed by Monday 16.
    expect(days.map((day) => day.date)).toEqual([
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-23",
    ]);
  });

  test("each day has the six slots from the design", () => {
    const [day] = upcomingDemoDays(new Date("2026-11-09T10:00:00Z"));
    expect(day.slots.map((slot) => slot.time)).toEqual([
      "09:30",
      "11:00",
      "12:30",
      "14:00",
      "15:30",
      "17:00",
    ]);
  });

  test("uses the UK date, not the visitor's", () => {
    // 23:30 UTC on Sunday 8 Nov is still Sunday in the UK in winter...
    const winter = upcomingDemoDays(new Date("2026-11-08T23:30:00Z"));
    expect(winter[0].date).toBe("2026-11-09");
    // ...but 23:30 UTC on 30 June is already 1 July in the UK (summer time).
    const summer = upcomingDemoDays(new Date("2026-06-30T23:30:00Z"));
    expect(summer[0].date).toBe("2026-07-02");
  });
});

describe("londonTimeToUtc", () => {
  test("winter: UK time is UTC", () => {
    expect(londonTimeToUtc(2026, 11, 16, 9, 30).toISOString()).toBe(
      "2026-11-16T09:30:00.000Z",
    );
  });

  test("summer: UK time is one hour ahead of UTC", () => {
    expect(londonTimeToUtc(2026, 7, 6, 9, 30).toISOString()).toBe(
      "2026-07-06T08:30:00.000Z",
    );
  });

  test("the clocks change on 29 March 2026", () => {
    expect(londonTimeToUtc(2026, 3, 27, 9, 30).toISOString()).toBe(
      "2026-03-27T09:30:00.000Z",
    );
    expect(londonTimeToUtc(2026, 3, 30, 9, 30).toISOString()).toBe(
      "2026-03-30T08:30:00.000Z",
    );
  });
});
