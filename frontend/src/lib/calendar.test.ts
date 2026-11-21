import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  clampDay,
  endOfWeek,
  inRange,
  isDay,
  longDay,
  monthGrid,
  parseTyped,
  startOfWeek,
  today,
  typedDay,
} from "./calendar";

describe("calendar days", () => {
  it("knows a real day from a wrong one", () => {
    expect(isDay("2026-11-21")).toBe(true);
    expect(isDay("2026-02-29")).toBe(false);
    expect(isDay("2028-02-29")).toBe(true);
    expect(isDay("2026-13-01")).toBe(false);
    expect(isDay("21/11/2026")).toBe(false);
    expect(isDay(undefined)).toBe(false);
  });

  it("adds days and months across the year and short months", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-11-21", -12)).toBe("2025-11-21");
  });

  it("starts weeks on Monday", () => {
    // 21 November 2026 is a Saturday.
    expect(startOfWeek("2026-11-21")).toBe("2026-11-16");
    expect(endOfWeek("2026-11-21")).toBe("2026-11-22");
    expect(longDay("2026-11-21")).toBe("Saturday 21 November 2026");
  });

  it("shows six full weeks around the month", () => {
    const grid = monthGrid(2026, 10);
    expect(grid).toHaveLength(6);
    expect(grid[0][0]).toBe("2026-10-26");
    expect(grid[0][6]).toBe("2026-11-01");
    expect(grid[5][6]).toBe("2026-12-06");
  });

  it("reads the ways people type a date", () => {
    expect(parseTyped("21/11/2026")).toBe("2026-11-21");
    expect(parseTyped("1/2/2026")).toBe("2026-02-01");
    expect(parseTyped("21-11-26")).toBe("2026-11-21");
    expect(parseTyped("21.11.2026")).toBe("2026-11-21");
    expect(parseTyped("21112026")).toBe("2026-11-21");
    expect(parseTyped("2026-11-21")).toBe("2026-11-21");
    expect(parseTyped(" 21 Nov 2026 ")).toBe("2026-11-21");
    expect(parseTyped("Sat, 21st November 2026")).toBe("2026-11-21");
  });

  it("refuses what isn't a day", () => {
    expect(parseTyped("")).toBeNull();
    expect(parseTyped("31/02/2026")).toBeNull();
    expect(parseTyped("tomorrow")).toBeNull();
    expect(parseTyped("21 Nox 2026")).toBeNull();
    expect(parseTyped("2026-11")).toBeNull();
  });

  it("writes the day the UK way", () => {
    expect(typedDay("2026-02-01")).toBe("01/02/2026");
    expect(typedDay("")).toBe("");
  });

  it("keeps days inside the range", () => {
    expect(inRange("2026-11-21", "2026-11-22")).toBe(false);
    expect(inRange("2026-11-21", undefined, "2026-11-21")).toBe(true);
    expect(clampDay("2026-11-01", "2026-11-10", "2026-11-20")).toBe(
      "2026-11-10",
    );
    expect(clampDay("2026-12-01", "", "2026-11-20")).toBe("2026-11-20");
  });

  it("takes today from the computer's own date", () => {
    expect(today(new Date(2026, 10, 21, 23, 59))).toBe("2026-11-21");
  });
});
