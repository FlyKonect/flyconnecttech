import { defineConfig, devices } from "@playwright/test";

import { e2e } from "./e2e/support/e2e-env";

/**
 * Browser tests: a real browser opens the site and checks it.
 *
 * They run on their own copy of the app, so they never touch your own
 * database or dev servers:
 *   - the website on http://localhost:3101 (built into .next-e2e)
 *   - the backend on http://localhost:4100
 *   - the database "flyconnect_tech_e2e", created and migrated on start
 *   - emails go to Mailpit as usual (http://localhost:8025)
 * Docker (MariaDB and Mailpit) must be running: docker compose up -d
 *
 * Set E2E_BASE_URL to test a site that is already running somewhere else
 * (for example a production build). Then nothing is started here.
 */
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A few browsers at a time: more runs out of memory on an ordinary PC
  // while the dev servers are also building pages.
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: external ?? e2e.siteUrl,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Safari and an iPhone, for the screens customers see. Only with
    // E2E_ALL_BROWSERS=1: the nightly run (.github/workflows/nightly-browsers.yml),
    // so the checks before a deploy stay quick.
    ...(process.env.E2E_ALL_BROWSERS
      ? [
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
            testMatch: /(layouts|portal|website)\.spec\.ts/,
          },
          {
            name: "iphone",
            use: { ...devices["iPhone 15"] },
            // The website, where most phone visitors land. The portal's phone
            // layout has its own test at phone size (portal.spec.ts), and
            // layouts.spec.ts sets its own screen sizes.
            testMatch: /website\.spec\.ts/,
          },
        ]
      : []),
  ],
  webServer: external
    ? undefined
    : [
        {
          name: "backend",
          command: "npm run e2e:serve",
          cwd: "../backend",
          url: `${e2e.apiUrl}/health`,
          env: e2e.backendEnv,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
        {
          name: "website",
          command: `npx next dev --port ${e2e.sitePort}`,
          url: e2e.siteUrl,
          env: {
            NEXT_DIST_DIR: ".next-e2e",
            NEXT_PUBLIC_SITE_URL: e2e.siteUrl,
            NEXT_PUBLIC_API_URL: e2e.apiUrl,
          },
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
        },
      ],
});
