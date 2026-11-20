import { describe, expect, test } from "vitest";

import type { TeamRole } from "@/lib/labels";
import { isTeamNavItemActive, teamNav } from "@/lib/team-nav";

const keys = (role: TeamRole) =>
  teamNav(role).flatMap((section) => section.items.map((item) => item.key));
const headings = (role: TeamRole) =>
  teamNav(role)
    .map((section) => section.label)
    .filter(Boolean);
const item = (role: TeamRole, key: string) =>
  teamNav(role)
    .flatMap((section) => section.items)
    .find((entry) => entry.key === key)!;

describe("team menu per role (docs/01, section 5)", () => {
  test("super admin sees everything, including Settings", () => {
    expect(keys("SUPER_ADMIN")).toEqual([
      "dashboard",
      "all",
      "demos",
      "quotes",
      "messages",
      "websiteContent",
      "customers",
      "users",
      "reports",
      "failedEmails",
      "notifications",
      "settings",
    ]);
    expect(headings("SUPER_ADMIN")).toEqual([
      "SUPPORT REQUESTS",
      "WEBSITE",
      "MANAGE",
    ]);
  });

  test("admin sees everything except Settings", () => {
    expect(keys("ADMIN")).toContain("users");
    expect(keys("ADMIN")).toContain("websiteContent");
    expect(keys("ADMIN")).toContain("failedEmails");
    expect(keys("ADMIN")).not.toContain("settings");
  });

  test("manager sees customers and reports, but not users, website content or settings", () => {
    expect(keys("MANAGER")).toEqual(
      expect.arrayContaining(["customers", "reports", "demos"]),
    );
    expect(keys("MANAGER")).not.toContain("users");
    expect(keys("MANAGER")).not.toContain("websiteContent");
    expect(keys("MANAGER")).not.toContain("failedEmails");
    expect(keys("MANAGER")).not.toContain("settings");
  });

  test("developer sees only their requests and notifications", () => {
    expect(keys("DEVELOPER")).toEqual(["dashboard", "all", "notifications"]);
    expect(headings("DEVELOPER")).toEqual(["MY REQUESTS"]);
  });
});

describe("which menu item is active", () => {
  test("Dashboard only on /team itself", () => {
    const dashboard = item("ADMIN", "dashboard");
    expect(isTeamNavItemActive(dashboard, "/team", null)).toBe(true);
    expect(isTeamNavItemActive(dashboard, "/team/users", null)).toBe(false);
  });

  test("All requests stays active on every status tab and on a request", () => {
    const all = item("ADMIN", "all");
    expect(isTeamNavItemActive(all, "/team/requests", null)).toBe(true);
    expect(isTeamNavItemActive(all, "/team/requests", "in-progress")).toBe(
      true,
    );
    expect(
      isTeamNavItemActive(all, "/team/requests/TKT-2026-00001", null),
    ).toBe(true);
    expect(isTeamNavItemActive(all, "/team/customers", null)).toBe(false);
  });

  test("a section stays active on its inner pages", () => {
    const customers = item("ADMIN", "customers");
    expect(isTeamNavItemActive(customers, "/team/customers/new", null)).toBe(
      true,
    );
    expect(isTeamNavItemActive(customers, "/team/users", null)).toBe(false);
  });
});
