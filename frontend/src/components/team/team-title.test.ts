import { describe, expect, test } from "vitest";

import { teamTitle } from "./team-shell";

describe("the title in the team panel header", () => {
  test("pages have the design's titles", () => {
    expect(teamTitle("/team")).toBe("Dashboard");
    expect(teamTitle("/team/requests")).toBe("Support Requests");
    expect(teamTitle("/team/notifications")).toBe("Notifications");
  });

  test("customers and users have their own titles", () => {
    expect(teamTitle("/team/customers")).toBe("Customers");
    expect(teamTitle("/team/customers/new")).toBe("Add customer");
    expect(
      teamTitle("/team/customers/0b8c7c1e-1d3a-4f2e-9a51-2f5d0c7e9b11"),
    ).toBe("Customer");
    expect(teamTitle("/team/users")).toBe("Users");
    expect(teamTitle("/team/users/new")).toBe("Add user");
  });

  test("a single request shows its code", () => {
    expect(teamTitle("/team/requests/TKT-2026-00124")).toBe(
      "Request TKT-2026-00124",
    );
  });
});
