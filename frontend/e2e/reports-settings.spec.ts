import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";
import { addProject, postAs, sendRequest } from "./support/portal";

// Reports & Analytics and Settings (docs/01 §5, screens 31 and 33).

const phone = { width: 390, height: 844 };

const toast = (page: Page, text: string) =>
  page.getByRole("status").filter({ hasText: text });

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

const DEFAULTS = {
  responseTargets: { URGENT: "1h", HIGH: "4h", MEDIUM: "1bd", LOW: "2bd" },
  teamNotifications: {
    urgentAlert: true,
    notifyAssigneeOnReply: true,
    dailyDigest: true,
    autoCloseResolvedAfter7Days: false,
  },
};

test("a super admin changes a response target; the next request is due by it", async ({
  page,
}) => {
  test.slow();
  const owner = await createPerson("super-admin");
  const customer = await createPerson("customer");
  addProject(customer.email, "Atlas stock sync", "website");
  await signInBrowser(page.context(), owner);

  try {
    await page.goto("/team/settings");
    const low = page.getByLabel("Response target for Low");
    await expect(page.getByLabel("Response target for Urgent")).toHaveValue(
      "1 hour",
    );
    await expect(low).toHaveValue("2 business days");

    // Something that isn't a time is refused.
    await low.fill("soon");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(
      page.getByText("Write it like 4 hours or 1 business day"),
    ).toBeVisible();

    // Low becomes 3 hours (no other test sends Low requests).
    await low.fill("3 hours");
    await page.getByRole("button", { name: "Save settings" }).click();
    await expect(toast(page, "Changes saved")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Response target for Low")).toHaveValue(
      "3 hours",
    );

    // The next Low request is due within 3 hours: its SLA badge on the
    // dashboard's "New requests to review".
    const code = await sendRequest(customer, {
      title: "Low request after the change",
      priority: "LOW",
    });
    await page.goto("/team");
    const row = page
      .getByRole("region", { name: "New requests to review" })
      .getByRole("listitem")
      .filter({ hasText: code });
    await expect(row).toContainText(/Due in 2h \d+m/);
  } finally {
    // Back to the defaults for every other test.
    await postAs(owner, "/team/settings", DEFAULTS);
  }
});

test("only super admins open Settings", async ({ page }) => {
  const admin = await createPerson("admin");
  await signInBrowser(page.context(), admin);
  await page.goto("/team/settings");
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
});

test("a manager sees the reports; a developer does not", async ({
  page,
  browser,
}) => {
  const manager = await createPerson("manager");
  await signInBrowser(page.context(), manager);
  await page.goto("/team/reports");
  const cards = page.getByRole("list", { name: "This month" });
  for (const label of [
    "Avg. first response",
    "Avg. resolution time",
    "Resolved this month",
    "Reopened requests",
  ]) {
    await expect(cards).toContainText(label);
  }
  await expect(
    page.getByRole("heading", { name: "Requests this week" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Requests by project" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Developer performance · this month" }),
  ).toBeVisible();
  for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
    await expect(
      page.getByRole("listitem", { name: new RegExp(`^${day}: \\d+$`) }),
    ).toBeVisible();
  }

  const developer = await createPerson("developer");
  const other = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  await signInBrowser(other, developer);
  const theirs = await other.newPage();
  await theirs.goto("/team/reports");
  await expect(
    theirs.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
  await other.close();
});

test("phone: Reports and Settings fit the screen", async ({ page }) => {
  const owner = await createPerson("super-admin");
  await signInBrowser(page.context(), owner);
  await page.setViewportSize(phone);
  await page.goto("/team/reports");
  await expect(
    page.getByRole("heading", { name: "Requests this week" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.goto("/team/settings");
  await expect(
    page.getByRole("button", { name: "Save settings" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
});

test("Reports: a date range and a customer narrow the report", async ({
  page,
}) => {
  await signInBrowser(page.context(), await createPerson("manager"));
  await page.goto("/team/reports");
  const choices = page.getByRole("form", { name: "Report choices" });
  await choices.getByLabel("From", { exact: true }).fill("2026-11-01");
  await choices.getByLabel("To", { exact: true }).fill("2026-11-15");
  await choices.getByRole("button", { name: "Apply" }).click();
  await expect(page).toHaveURL(/from=2026-11-01&to=2026-11-15/);
  await expect(
    page.getByRole("heading", { name: /Report for 1 Nov 2026 to 15 Nov 2026/ }),
    // A full page load (the choices are a plain form): slower on a busy machine.
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByRole("list", { name: "Service levels" }),
  ).toContainText("Reply SLA met");
  await expect(
    page.getByRole("list", { name: "1 Nov 2026 to 15 Nov 2026" }),
  ).toContainText("Resolved");
  await expect(page.getByRole("link", { name: "This month" })).toBeVisible();
});
