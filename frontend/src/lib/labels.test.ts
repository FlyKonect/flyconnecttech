import { describe, expect, test } from "vitest";

import {
  budgets,
  notificationDots,
  pillGroups,
  requestStatuses,
  requestTypes,
  roles,
} from "@/lib/labels";

describe("labels", () => {
  test("request statuses use the wording from the design", () => {
    expect(requestStatuses.WAITING_FOR_CUSTOMER.label).toBe(
      "Waiting for Customer",
    );
    expect(requestStatuses.UNDER_REVIEW.label).toBe("Under Review");
  });

  test("budgets use the wording from the design", () => {
    expect(budgets.FROM_5K_TO_15K.label).toBe("$5k – $15k");
  });

  test("there are seven request types, each with a description", () => {
    const types = Object.values(requestTypes);
    expect(types).toHaveLength(7);
    for (const type of types) expect(type.description).not.toBe("");
  });

  test("every pill has a label and two valid colours", () => {
    const hex = /^#[0-9A-F]{6}$/;
    for (const group of Object.values(pillGroups)) {
      for (const entry of Object.values(group)) {
        expect(entry.label).not.toBe("");
        expect(entry.tone.bg).toMatch(hex);
        expect(entry.tone.text).toMatch(hex);
      }
    }
  });

  test("the super admin pill is navy with white text", () => {
    expect(roles.SUPER_ADMIN.tone).toEqual({ bg: "#021A54", text: "#FFFFFF" });
  });

  test("website lead notifications use the gold dot", () => {
    expect(notificationDots.lead).toBe("#D3AF34");
  });
});
