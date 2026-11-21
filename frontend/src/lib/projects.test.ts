import { describe, expect, test } from "vitest";

import {
  formatDay,
  isWebAddress,
  itemLinesProblem,
  itemsFromLines,
  MAX_ITEMS,
  modulesWords,
  progressWords,
  shortAddress,
  stagesFor,
  stepperSteps,
  type ProjectModule,
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

describe("module stages on the stepper", () => {
  const at = (to: ProjectModule["stage"], day: number) => ({
    id: `${to}-${day}`,
    from: null,
    to,
    round: 1,
    note: null,
    createdAt: `2026-11-${String(day).padStart(2, "0")}T10:00:00.000Z`,
    by: null,
  });

  test("done steps, the current one, and the ones to come", () => {
    const steps = stepperSteps({
      stage: "TESTING",
      history: [at("NOT_STARTED", 1), at("DEVELOPMENT", 2), at("TESTING", 5)],
    });
    expect(steps.map((s) => [s.stage, s.state])).toEqual([
      ["DESIGN", "done"],
      ["DEVELOPMENT", "done"],
      ["TESTING", "current"],
      ["CLIENT_REVIEW", "next"],
      ["DONE", "next"],
    ]);
    expect(steps[1].at).toBe("2026-11-02T10:00:00.000Z");
    expect(steps[3].at).toBeNull();
  });

  test("rework shows on its step: changes on Development, retest on Testing", () => {
    const changes = stepperSteps({
      stage: "CHANGES_REQUESTED",
      history: [at("CLIENT_REVIEW", 4), at("CHANGES_REQUESTED", 6)],
    });
    expect(changes[1]).toMatchObject({
      stage: "DEVELOPMENT",
      state: "current",
      rework: "CHANGES_REQUESTED",
      at: "2026-11-06T10:00:00.000Z",
    });
    const retest = stepperSteps({ stage: "RETEST", history: [] });
    expect(retest[2]).toMatchObject({ state: "current", rework: "RETEST" });
  });

  test("Not started has nothing done; Done ticks every step", () => {
    expect(
      stepperSteps({ stage: "NOT_STARTED", history: [] }).every(
        (s) => s.state === "next",
      ),
    ).toBe(true);
    expect(
      stepperSteps({ stage: "DONE", history: [] }).every(
        (s) => s.state === "done",
      ),
    ).toBe(true);
  });

  test("who may move a module where", () => {
    expect(stagesFor("ADMIN")).toContain("DONE");
    expect(stagesFor("DEVELOPER")).not.toContain("DONE");
    expect(stagesFor("DEVELOPER")).toContain("CLIENT_REVIEW");
    expect(stagesFor("MANAGER")).toEqual([]);
    expect(modulesWords(2, 5)).toBe("2 of 5 modules done");
    expect(modulesWords(1, 1)).toBe("1 of 1 module done");
  });
});
