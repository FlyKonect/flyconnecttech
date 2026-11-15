import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import {
  createPerson,
  PASSWORD,
  signInBrowser,
  uniqueEmail,
} from "./support/accounts";
import { linkIn, waitForEmail } from "./support/mailpit";

// The main journey (docs/04, Phase 11): a visitor books a demo, becomes a
// customer, sends a request, an admin assigns it, a developer resolves it
// and the customer confirms. Each person in a browser window of their own.

test.describe.configure({ timeout: 240_000 });

const tag = () => randomUUID().slice(0, 6);

/** A visible form field by its label (pages left behind stay hidden). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

test("demo → customer → request → assigned → resolved → confirmed", async ({
  page,
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  const word = tag();
  const admin = await createPerson("admin");
  const developerName = `Journey developer ${word}`;
  const developer = await createPerson("developer", developerName);
  const email = uniqueEmail("maya");
  const company = `Northwind Holidays ${word}`;

  // 1. A visitor books a demo on the website.
  const visitorWindow = await browser.newContext({ baseURL });
  const visitor = await visitorWindow.newPage();
  await visitor.goto("/");
  await visitor
    .getByRole("banner")
    .getByRole("button", { name: "Book a demo" })
    .click();
  const booking = visitor.getByRole("dialog", { name: "Book a demo" });
  await booking.getByRole("radio", { name: /Travel booking platform/ }).click();
  await booking.getByRole("button", { name: "Continue" }).click();
  // The third day (the other tests that confirm demos use the first and last).
  await booking
    .getByRole("radiogroup", { name: "Pick a day" })
    .getByRole("radio")
    .nth(2)
    .click();
  await booking
    .getByRole("radiogroup", { name: /Available times/ })
    .getByRole("radio", { disabled: false })
    .first()
    .click();
  await booking.getByRole("button", { name: "Continue" }).click();
  await booking.getByLabel("Full name *").fill("Maya Lindqvist");
  await booking.getByLabel("Work email *").fill(email);
  await booking.getByLabel("Company *").fill(company);
  await booking.getByRole("button", { name: "Request demo" }).click();
  await expect(booking.getByRole("status")).toContainText("Demo requested");
  await visitorWindow.close();

  // The admin confirms it: the visitor gets the calendar invite.
  await signInBrowser(page.context(), admin);
  await page.goto(`/team/leads/demos?q=${encodeURIComponent(company)}`);
  await page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: company })
    .getByRole("link")
    .first()
    .click();
  await page.getByRole("button", { name: "Confirm time" }).click();
  await page
    .getByRole("dialog", { name: "Confirm demo time" })
    .getByRole("button", { name: "Send calendar invite" })
    .click();
  await expect(toast(page, `Calendar invite sent to ${email}`)).toBeVisible();
  const invite = await waitForEmail(email, /demo is confirmed/);
  expect(invite.attachments).toContain("invite.ics");

  // 2. After the demo: completed, then converted into a customer.
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await expect(toast(page, /is now Completed/)).toBeVisible();
  await page.getByRole("link", { name: "Convert to customer" }).click();
  await expect(field(page, "Full name *")).toHaveValue("Maya Lindqvist");
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();
  await expect(
    toast(page, `Customer added. Invitation sent to ${email}`),
  ).toBeVisible();

  // The customer activates the account from the email and signs in.
  const invitation = await waitForEmail(email, /support account is ready/);
  const customerWindow = await browser.newContext({ baseURL });
  const customer = await customerWindow.newPage();
  await customer.goto(new URL(linkIn(invitation, "/invite/")).pathname);
  await field(customer, "New password").fill(PASSWORD);
  await field(customer, "Confirm password").fill(PASSWORD);
  await customer.getByRole("button", { name: "Activate account" }).click();
  await field(customer, "Email address").fill(email);
  await field(customer, "Password").fill(PASSWORD);
  await customer.getByRole("button", { name: "Sign in" }).click();
  await expect(customer).toHaveURL(/\/portal$/);

  // 3. The customer sends a request (their one project is picked already).
  await customer.goto("/portal/requests/new");
  await customer.getByRole("button", { name: "Continue" }).click();
  await customer.getByRole("radio", { name: /Bug Report/ }).click();
  await customer.getByRole("button", { name: "Continue" }).click();
  await field(customer, "Request title").fill("Hotel prices missing on search");
  await field(customer, "Detailed description").fill(
    "Since this morning the search page shows no hotel prices.",
  );
  await customer.getByRole("button", { name: "Continue" }).click();
  await customer.getByRole("button", { name: "Submit request" }).click();
  // Sending saves the request and its emails: slower on a busy machine.
  await expect(customer).toHaveURL(
    /\/portal\/requests\/TKT-[\d-]+\/submitted$/,
    { timeout: 15_000 },
  );
  const code = customer.url().match(/TKT-\d{4}-\d{5}/)![0];

  // The admin assigns it to the developer, who gets the email.
  await page.goto(`/team/requests/${code}`);
  await page.getByRole("button", { name: "Assign developer" }).click();
  await page
    .getByRole("dialog", { name: "Assign to a developer" })
    .getByRole("button", { name: new RegExp(developerName) })
    .click();
  await expect(
    toast(page, `${code} assigned to ${developerName}`),
  ).toBeVisible();
  await waitForEmail(
    developer.email,
    new RegExp(`${code} was assigned to you`),
  );

  // The developer resolves it.
  const developerWindow = await browser.newContext({ baseURL });
  await signInBrowser(developerWindow, developer);
  const dev = await developerWindow.newPage();
  await dev.goto(`/team/requests/${code}`);
  await dev.getByRole("button", { name: "Resolve" }).click();
  const resolve = dev.getByRole("dialog", { name: `Resolve ${code}` });
  await resolve
    .getByLabel("Resolution summary for the customer")
    .fill("Fixed: the hotel supplier's prices load again.");
  await resolve.getByRole("button", { name: "Mark as resolved" }).click();
  await expect(toast(dev, `${code} marked as resolved`)).toBeVisible();
  await developerWindow.close();

  // The customer gets the email and confirms the fix: the request closes.
  await waitForEmail(email, new RegExp(`${code} was resolved`));
  await customer.goto(`/portal/requests/${code}`);
  await customer.getByRole("button", { name: "Confirm it's fixed" }).click();
  await expect(
    customer.getByRole("button", { name: "Reopen request" }),
  ).toBeVisible();
  await expect(
    customer.getByRole("list", { name: "Conversation" }),
  ).toContainText("confirmed the resolution. Request closed.");
  await customerWindow.close();

  // The team sees it closed.
  await page.reload();
  await expect(
    page
      .getByRole("radiogroup", { name: "STATUS" })
      .getByRole("radio", { name: "Closed" }),
  ).toBeChecked();
});
