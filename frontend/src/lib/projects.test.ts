import { describe, expect, test } from "vitest";

import {
  formatDay,
  isWebAddress,
  itemLinesProblem,
  itemsFromLines,
  MAX_ITEMS,
  progressWords,
  shortAddress,
} from "@/lib/projects";
import { addProjectSchema, projectDetailsSchema } from "@/lib/team/forms";

describe("What's included, one item a line", () => {
  test("blank lines, bullets and extra spaces are tidied", () => {
    expect(
      itemsFromLines(
        "  Flight search \n\n- Agent   portal\n• Stripe\n* Emails",
      ),
    ).toEqual(["Flight search", "Agent portal", "Stripe", "Emails"]);
    expect(itemsFromLines("")).toEqual([]);
  });

  test(`up to ${MAX_ITEMS} items of up to 160 characters`, () => {
    const lines = (n: number) =>
      Array.from({ length: n }, (_, i) => `Item ${i + 1}`).join("\n");
    expect(itemLinesProblem(lines(MAX_ITEMS))).toBe("");
    expect(itemLinesProblem(lines(MAX_ITEMS + 1))).toBe("Up to 50 items");
    expect(itemLinesProblem("x".repeat(161))).toBe(
      "Keep each line under 160 characters",
    );
  });
});

describe("progress and details in words", () => {
  test("progress", () => {
    expect(progressWords({ done: 6, total: 10, percent: 60 })).toBe(
      "6 of 10 done",
    );
    expect(progressWords({ done: 0, total: 0, percent: null })).toBe(
      "Nothing listed yet",
    );
  });

  test("dates have no time of day, addresses are shown short", () => {
    expect(formatDay("2027-01-15")).toBe("15 Jan 2027");
    expect(formatDay(null)).toBe("");
    expect(shortAddress("https://bluewave.example.com/")).toBe(
      "bluewave.example.com",
    );
    expect(isWebAddress("https://bluewave.example.com")).toBe(true);
    expect(isWebAddress("javascript:alert(1)")).toBe(false);
  });
});

describe("the project forms", () => {
  const details = {
    name: "Bluewave booking website",
    type: "WEBSITE" as const,
    description: "",
    startDate: "2026-11-02",
    targetDate: "2027-01-15",
    liveDate: "",
    supportUntil: "",
    liveUrl: "",
    testUrl: "",
    builtWith: "",
    leadId: "",
    teamNotes: "",
  };

  test("Edit details refuses a bad address and a target before the start", () => {
    expect(projectDetailsSchema.safeParse(details).success).toBe(true);
    expect(
      projectDetailsSchema.safeParse({ ...details, liveUrl: "bluewave" })
        .success,
    ).toBe(false);
    expect(
      projectDetailsSchema.safeParse({ ...details, targetDate: "2026-10-01" })
        .success,
    ).toBe(false);
  });

  test("Add project needs a customer", () => {
    const project = {
      customerId: "",
      name: "Skyline website",
      type: "WEBSITE" as const,
      description: "",
      items: "Home page\nBooking form",
      startDate: "",
      targetDate: "",
      leadId: "",
    };
    expect(addProjectSchema.safeParse(project).success).toBe(false);
    expect(
      addProjectSchema.safeParse({ ...project, customerId: "c1" }).success,
    ).toBe(true);
  });
});
