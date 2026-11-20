import { describe, expect, test } from "vitest";

import type { TeamUserRow } from "@/lib/team/types";

import { plural } from "@/lib/plural";

import { customerSummary } from "./customers-list";
import { PERMISSION_ROWS, permissionCell } from "./role-permissions";
import { lastActive } from "./users-table";

describe("the customers summary line", () => {
  test("reads like the design", () => {
    expect(customerSummary({ customers: 6, projects: 7, invited: 1 })).toBe(
      "6 customers · 7 projects · 1 invitation pending",
    );
  });

  test("uses one and many, and leaves out zero invitations", () => {
    expect(customerSummary({ customers: 1, projects: 1, invited: 0 })).toBe(
      "1 customer · 1 project",
    );
    expect(customerSummary({ customers: 3, projects: 4, invited: 2 })).toBe(
      "3 customers · 4 projects · 2 invitations pending",
    );
    expect(plural(1, "open request")).toBe("1 open request");
  });
});

describe("last active on the Users list", () => {
  const zone = "Europe/London";
  const now = new Date("2026-11-09T12:00:00Z");
  const user = (changes: Partial<TeamUserRow>): TeamUserRow => ({
    id: "1",
    name: "Bilal Khan",
    email: "bilal@example.com",
    role: "DEVELOPER",
    jobTitle: null,
    status: "ACTIVE",
    lastActiveAt: null,
    invitedAt: null,
    openAssigned: 0,
    canManage: true,
    canDelete: true,
    ...changes,
  });

  test("invited people show when they were invited", () => {
    const invited = user({
      status: "INVITED",
      invitedAt: "2026-11-07T10:00:00Z",
    });
    expect(lastActive(invited, zone, now)).toBe("Invited 7 Nov");
  });

  test("active people show their last visit, or a dash", () => {
    const today = user({ lastActiveAt: "2026-11-09T09:40:00Z" });
    expect(lastActive(today, zone, now)).toBe("Today, 09:40");
    expect(lastActive(user({}), zone, now)).toBe("—");
  });
});

describe("What each role can do", () => {
  const permissions = {
    "requests.view": ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"],
    "requests.changePriority": ["SUPER_ADMIN", "ADMIN", "MANAGER"],
    "requests.close": ["SUPER_ADMIN", "ADMIN"],
    "settings.manage": ["SUPER_ADMIN"],
  } as Record<string, ("SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEVELOPER")[]>;
  const row = (label: string) =>
    PERMISSION_ROWS.find((item) => item.label === label)!;

  test("developers see their own requests only", () => {
    const see = row("See all support requests");
    expect(permissionCell(see, "ADMIN", permissions)).toBe("yes");
    expect(permissionCell(see, "DEVELOPER", permissions)).toBe("own");
  });

  test("a row with two actions needs both", () => {
    const change = row("Change priority, close requests");
    expect(permissionCell(change, "ADMIN", permissions)).toBe("yes");
    expect(permissionCell(change, "MANAGER", permissions)).toBe("no");
  });

  test("an action the backend did not send is a no", () => {
    expect(permissionCell(row("Add team users"), "ADMIN", permissions)).toBe(
      "no",
    );
    expect(permissionCell(row("Settings"), "SUPER_ADMIN", permissions)).toBe(
      "yes",
    );
  });
});
