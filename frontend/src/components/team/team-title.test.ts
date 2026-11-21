import { describe, expect, test } from "vitest";

import { teamTitle } from "./team-shell";

describe("the title in the team panel header", () => {
  test("pages have the design's titles", () => {
    expect(teamTitle("/team")).toBe("Dashboard");
    expect(teamTitle("/team/requests")).toBe("Support Requests");
    expect(teamTitle("/team/notifications")).toBe("Notifications");
    expect(teamTitle("/team/website-content")).toBe("Website content");
  });

  test("website leads show the kind and code", () => {
    expect(teamTitle("/team/leads/demos")).toBe("Demo requests");
    expect(teamTitle("/team/leads/demos/DEM-2026-031")).toBe(
      "Demo request · DEM-2026-031",
    );
    expect(teamTitle("/team/leads/quotes/QUO-2026-042")).toBe(
      "Quote request · QUO-2026-042",
    );
    expect(teamTitle("/team/leads/messages/MSG-2026-018")).toBe(
      "Message · MSG-2026-018",
    );
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

  test("projects have their own titles", () => {
    expect(teamTitle("/team/projects")).toBe("Projects");
    expect(teamTitle("/team/projects/new")).toBe("Add project");
    expect(teamTitle("/team/projects/P-0004")).toBe("Project P-0004");
    expect(teamTitle("/team/projects/P-0004/modules")).toBe("Project P-0004");
  });

  test("a single request shows its code", () => {
    expect(teamTitle("/team/requests/TKT-2026-00124")).toBe(
      "Request TKT-2026-00124",
    );
  });
});
