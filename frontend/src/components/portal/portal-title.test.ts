import { describe, expect, test } from "vitest";

import { portalTitle } from "./portal-shell";

describe("the title in the portal header", () => {
  test("each page has the design's title", () => {
    expect(portalTitle("/portal")).toBe("Overview");
    expect(portalTitle("/portal/requests")).toBe("My Requests");
    expect(portalTitle("/portal/requests/new")).toBe("Create Support Request");
    expect(portalTitle("/portal/notifications")).toBe("Notifications");
    expect(portalTitle("/portal/profile")).toBe("Profile Settings");
    expect(portalTitle("/portal/projects")).toBe("My Projects");
  });

  test("a single project shows its code", () => {
    expect(portalTitle("/portal/projects/P-0004")).toBe("Project P-0004");
    expect(portalTitle("/portal/projects/P-0004/timeline")).toBe(
      "Project P-0004",
    );
  });

  test("a single request shows its code, and its submitted page says so", () => {
    expect(portalTitle("/portal/requests/TKT-2026-00118")).toBe(
      "Request TKT-2026-00118",
    );
    expect(portalTitle("/portal/requests/TKT-2026-00125/submitted")).toBe(
      "Request submitted",
    );
  });
});
