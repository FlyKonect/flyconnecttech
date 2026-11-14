import { defineConfig, devices } from "@playwright/test";

// Set E2E_BASE_URL to test a site that is already running somewhere else
// (for example a production build). Playwright then starts nothing itself.
const external = process.env.E2E_BASE_URL;
const baseURL = external ?? "http://localhost:3001";

// End-to-end tests: a real browser opens the website and checks it.
// Playwright starts the website itself, or uses it if it is already running.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A few browsers at a time: more runs out of memory on an ordinary PC
  // while the dev server is also building pages.
  workers: process.env.CI ? 2 : 3,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: external
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
