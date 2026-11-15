import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, securityHeaders } from "./security-headers";

const live = {
  apiUrl: "https://api.yourdomain.com/",
  siteUrl: "https://yourdomain.com",
  development: false,
};
const dev = {
  apiUrl: "http://localhost:4000",
  siteUrl: "http://localhost:3001",
  development: true,
};
// A production build tried on a PC, over plain http.
const localBuild = { ...dev, development: false };

describe("security headers", () => {
  it("lets the browser call only this site and the backend", () => {
    expect(contentSecurityPolicy(live)).toContain(
      "connect-src 'self' https://api.yourdomain.com;",
    );
  });

  it("blocks framing, plugins and forms posting elsewhere", () => {
    const policy = contentSecurityPolicy(live);
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("form-action 'self'");
  });

  it("allows eval only in development", () => {
    expect(contentSecurityPolicy(dev)).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy(live)).not.toContain("'unsafe-eval'");
  });

  it("asks for https only when the site runs on https", () => {
    const names = (options: typeof live) =>
      securityHeaders(options).map((header) => header.key);
    expect(names(live)).toContain("Strict-Transport-Security");
    expect(names(dev)).not.toContain("Strict-Transport-Security");
    expect(names(localBuild)).not.toContain("Strict-Transport-Security");
    expect(contentSecurityPolicy(live)).toContain("upgrade-insecure-requests");
    expect(contentSecurityPolicy(localBuild)).not.toContain(
      "upgrade-insecure-requests",
    );
  });
});
