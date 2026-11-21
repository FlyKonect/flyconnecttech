import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";
import { waitForEmail } from "./support/mailpit";
import { asPerson, PNG, postAs, sendRequest } from "./support/portal";

// Projects: an admin adds a project with what it includes, ticks items,
// posts an update with a file; the customer gets the email and sees the
// progress, the update and the file in My Projects. Delete is refused
// while a request is open, then hides the project, and Restore brings it
// back.

test.describe.configure({ timeout: 240_000 });

/** A visible form field by its label (pages left behind stay hidden). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

test("from Add project to the customer's My Projects, then delete and restore", async ({
  page,
  browser,
}) => {
  const word = randomUUID().slice(0, 6);
  const name = `Booking website ${word}`;
  const update = `Flight search is ready to try (${word}).`;
  const admin = await createPerson("admin");
  const customer = await createPerson("customer");
  const [row] = (
    await asPerson<{ rows: { id: string; email: string }[] }>(
      admin,
      `/team/customers?q=${encodeURIComponent(customer.email)}`,
    )
  ).rows;

  // Add project, with the customer already chosen (from their page).
  await signInBrowser(page.context(), admin);
  await page.goto(`/team/projects/new?customer=${row.id}`);
  await field(page, "Project name *").fill(name);
  await field(page, "Project type").selectOption("TRAVEL_BOOKING_PLATFORM");
  await field(page, "What's included (optional)").fill(
    "Flight search\nHotel search\nStripe payments\nAgent portal\nEmails",
  );
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(page).toHaveURL(/\/team\/projects\/P-\d{4,}$/);
  const code = new URL(page.url()).pathname.split("/").pop()!;
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("Nothing listed yet")).toHaveCount(0);

  // The items went into a first module, "General". Tick two Done: the
  // progress follows.
  await page.getByRole("link", { name: /^Modules/ }).click();
  await expect(page).toHaveURL(new RegExp(`/team/projects/${code}/modules$`));
  await expect(page.getByRole("heading", { name: /^General/ })).toBeVisible();
  for (const item of ["Flight search", "Hotel search"]) {
    await page.getByLabel(`Status of ${item}`).selectOption("DONE");
    await expect(toast(page, `${item}: Done`)).toBeVisible();
  }
  await expect(
    page.getByRole("progressbar", { name: `Progress of ${name}` }).first(),
  ).toHaveAttribute("aria-valuenow", "40");

  // Post an update with a file: the customer is emailed.
  await page.getByRole("link", { name: /^Updates/ }).click();
  await page.getByLabel("Update for the customer").fill(update);
  await page
    .getByRole("form", { name: "Post an update" })
    .locator('input[type="file"]')
    .setInputFiles({
      name: "flight-search.png",
      mimeType: "image/png",
      buffer: PNG,
    });
  await expect(page.getByText("flight-search.png")).toBeVisible();
  await page.getByRole("button", { name: "Post update" }).click();
  await expect(
    toast(page, "Update posted. The customer was emailed."),
  ).toBeVisible();
  const email = await waitForEmail(customer.email, /^Update on /);
  expect(email.text).toContain("Progress: 2 of 5 done (40%)");
  expect(email.text).toContain(`/portal/projects/${code}`);

  // The Projects list finds it.
  await page.goto(`/team/projects?q=${code}`);
  await expect(
    page.getByRole("link", { name: new RegExp(name) }),
  ).toBeVisible();

  // The customer: My Projects, the progress, the update and its file.
  const customerContext = await browser.newContext();
  const portal = await customerContext.newPage();
  await signInBrowser(customerContext, customer);
  await portal.goto("/portal/projects");
  await portal.getByRole("link", { name: new RegExp(name) }).click();
  await expect(portal).toHaveURL(new RegExp(`/portal/projects/${code}$`));
  await expect(
    portal.getByRole("progressbar", { name: `Progress of ${name}` }),
  ).toHaveAttribute("aria-valuenow", "40");
  // The Overview shows the latest update with its file.
  await expect(portal.getByText(update)).toBeVisible();
  await expect(portal.getByLabel(/Status of/)).toHaveCount(0);
  const download = portal.waitForEvent("download");
  await portal.getByRole("link", { name: /flight-search\.png/ }).click();
  expect((await download).suggestedFilename()).toBe("flight-search.png");

  // Delete: refused while a request is open.
  const request = await sendRequest(customer, { title: `Slow search ${word}` });
  await page.goto(`/team/projects/${code}`);
  await page.getByRole("button", { name: "Delete project" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("has 1 open request");
  await expect(
    dialog.getByRole("button", { name: "Delete project" }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Close" }).first().click();

  // Closed: Delete hides it, with its history; Restore brings it back.
  await postAs(admin, `/team/requests/${request}/close`);
  await page.reload();
  await page.getByRole("button", { name: "Delete project" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete project" })
    .click();
  await expect(toast(page, `${code} is deleted`)).toBeVisible();
  await expect(page.getByText(/^Deleted /)).toBeVisible();
  await portal.goto(`/portal/projects/${code}`);
  await expect(
    portal.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Restore project" }).click();
  await expect(toast(page, `${code} restored`)).toBeVisible();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await portal.goto(`/portal/projects/${code}`);
  await expect(portal.getByRole("heading", { name })).toBeVisible();
  await customerContext.close();
});
