import { describe, expect, test } from "vitest";

import { teamTitle } from "./team-shell";

describe("the title in the team panel header", () => {
  test("pages have the design's titles", () => {
    expect(teamTitle("/team")).toBe("Dashboard");
    expect(teamTitle("/team/requests")).toBe("Support Requests");
    expect(teamTitle("/team/notifications")).toBe("Notifications");
  });

  test("a single request shows its code", () => {
    expect(teamTitle("/team/requests/TKT-2026-00124")).toBe(
      "Request TKT-2026-00124",
    );
  });
});
