import os from "node:os";
import path from "node:path";

/**
 * Where the browser tests' own copy of the app runs (see playwright.config.ts).
 * Kept in one place so the config and the test helpers agree.
 */
const sitePort = 3101;
const apiPort = 4100;

const siteUrl = `http://localhost:${sitePort}`;
const apiUrl = `http://localhost:${apiPort}`;
const databaseUrl =
  process.env.E2E_DATABASE_URL ??
  "mysql://root:root@localhost:3306/flyconnect_tech_e2e";

export const e2e = {
  sitePort,
  siteUrl,
  apiUrl,
  mailpitUrl: process.env.E2E_MAILPIT_URL ?? "http://localhost:8025",
  /** Settings for the backend started for the tests. */
  backendEnv: {
    NODE_ENV: "test",
    PORT: String(apiPort),
    FRONTEND_URL: siteUrl,
    BACKEND_URL: apiUrl,
    DATABASE_URL: databaseUrl,
    AUTH_SECRET: "e2e-secret-that-is-at-least-32-characters-long",
    // The tests sign in many times a minute.
    RATE_LIMITS: "false",
    SMTP_HOST: process.env.E2E_SMTP_HOST ?? "localhost",
    SMTP_PORT: "1025",
    EMAIL_FROM: "FlyConnect Tech Support <hello@yourdomain.com>",
    // Uploaded files go to a folder of their own, not the real uploads/.
    UPLOAD_DIR: path.join(os.tmpdir(), "flyconnect-tech-e2e-uploads"),
  },
};
