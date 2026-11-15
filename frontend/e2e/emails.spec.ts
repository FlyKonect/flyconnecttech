import { expect, test } from "@playwright/test";

// /dev/emails (development only): every email, as designed and as plain
// text, grouped by the rows of docs/01 section 7.

test("the email previews show every email, designed and as plain text", async ({
  page,
}) => {
  await page.goto("/dev/emails");
  const list = page.getByRole("navigation", { name: "Emails" });
  for (const row of [
    "Customer or team invitation",
    "New support request",
    "Daily digest of requests waiting for review",
    "Weekly summary of my requests",
    "Demo confirmed or rescheduled",
    "Lead email from the composer",
  ]) {
    await expect(list.getByRole("heading", { name: row })).toBeVisible();
  }

  await list
    .getByRole("button", { name: "2 requests waiting for review" })
    .click();
  const preview = page.getByRole("region", { name: "Preview" });
  await expect(preview).toContainText(
    "Super admins, admins and managers, every morning",
  );
  await expect(
    page
      .frameLocator('iframe[title="Email: 2 requests waiting for review"]')
      .getByText("Requests waiting for review", { exact: true }),
  ).toBeVisible();

  await preview.getByRole("tab", { name: "Plain text" }).click();
  await expect(preview.locator("pre")).toContainText("TKT-2026-00125");

  // A demo invite says the calendar file goes with it.
  await list
    .getByRole("button", { name: /^Your FlyConnect Tech demo is confirmed/ })
    .click();
  await expect(preview).toContainText("A calendar invite (invite.ics)");
});
