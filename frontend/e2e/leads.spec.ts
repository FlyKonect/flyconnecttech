import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import {
  createPerson,
  PASSWORD,
  signInBrowser,
  uniqueEmail,
} from "./support/accounts";
import { linkIn, waitForEmail } from "./support/mailpit";
import { postAs } from "./support/portal";

// Website leads (docs/01 §2 and §6, screens 34 to 42): from the website's
// forms to the team panel, with the real emails from Mailpit.

const phone = { width: 390, height: 844 };

/** Something unique to search for. */
const tag = () => randomUUID().slice(0, 6);

/** A visible form field by its label (pages left behind stay hidden). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

/** The toast with this text (a page's loading placeholder is a "status" too). */
const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

/** Opens a lead from its list, found by a unique word. */
async function openLead(page: Page, list: string, search: string) {
  await page.goto(`/team/leads/${list}?q=${encodeURIComponent(search)}`);
  await page
    .getByRole("table")
    .getByRole("row")
    .filter({ hasText: search })
    .getByRole("link")
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/team/leads/${list}/[A-Z]{3}-`));
}

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test("a demo booked on the website: confirm with an invite, complete, convert, and the customer signs in", async ({
  page,
  browser,
}) => {
  test.slow();
  const baseURL = test.info().project.use.baseURL;
  const admin = await createPerson("admin");
  const email = uniqueEmail("olivia");
  const company = `Skyhaven ${tag()}`;

  // The visitor books on the Travel Technology page, in a window of their own.
  const visitorWindow = await browser.newContext({ baseURL });
  const visitor = await visitorWindow.newPage();
  await visitor.goto("/travel-technology");
  await visitor
    .getByRole("banner")
    .getByRole("button", { name: "Book a demo" })
    .click();
  let dialog = visitor.getByRole("dialog", { name: "Book a demo" });
  await dialog.getByRole("radio", { name: /Travel booking platform/ }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  // The last day offered, and its first free time (the website test uses
  // the first day).
  await dialog
    .getByRole("radiogroup", { name: "Pick a day" })
    .getByRole("radio")
    .last()
    .click();
  const free = dialog
    .getByRole("radiogroup", { name: /Available times/ })
    .getByRole("radio", { disabled: false })
    .first();
  const time = (await free.getAttribute("aria-label"))!;
  await free.click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByLabel("Full name *").fill("Olivia Grant");
  await dialog.getByLabel("Work email *").fill(email);
  await dialog.getByLabel("Company *").fill(company);
  await dialog.getByRole("button", { name: "Request demo" }).click();
  await expect(dialog.getByRole("status")).toContainText("Demo requested");
  const copy = await waitForEmail(email, /demo request/);
  expect(copy.subject).toBe("Your FlyConnect Tech demo request");

  // The team sees it, with where it came from.
  await signInBrowser(page.context(), admin);
  await openLead(page, "demos", company);
  await expect(
    page.getByText(
      "Olivia was told to expect a calendar invite by email. Confirm the time they picked, or choose another one.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Travel Technology page").first()).toBeVisible();

  // Confirm the time they picked: the invite has the .ics file.
  await page.getByRole("button", { name: "Confirm time" }).click();
  const confirm = page.getByRole("dialog", { name: "Confirm demo time" });
  await expect(confirm.getByLabel("Time (UK)")).toHaveValue(time);
  await confirm
    .getByLabel("Video call link (optional)")
    .fill("https://meet.example.com/abc-defg");
  await confirm.getByRole("button", { name: "Send calendar invite" }).click();
  await expect(toast(page, `Calendar invite sent to ${email}`)).toBeVisible();
  await expect(
    page.getByText(/^Demo booked for .+ with Test admin\.$/),
  ).toBeVisible();
  const invite = await waitForEmail(email, /demo is confirmed/);
  expect(invite.attachments).toContain("invite.ics");
  expect(invite.text).toContain("https://meet.example.com/abc-defg");

  // The website now shows that time as taken.
  await visitor.reload();
  await visitor
    .getByRole("banner")
    .getByRole("button", { name: "Book a demo" })
    .click();
  dialog = visitor.getByRole("dialog", { name: "Book a demo" });
  await dialog.getByRole("radio", { name: /API and integrations/ }).click();
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog
    .getByRole("radiogroup", { name: "Pick a day" })
    .getByRole("radio")
    .last()
    .click();
  await expect(
    dialog.getByRole("radio", { name: `${time}, taken` }),
  ).toBeDisabled();
  await visitorWindow.close();

  // Completed, then converted.
  await page.getByRole("button", { name: "Mark as completed" }).click();
  await expect(toast(page, /is now Completed/)).toBeVisible();
  await page.getByRole("link", { name: "Convert to customer" }).click();
  await expect(page).toHaveURL(/\/team\/customers\/new\?from=DEM-/);
  await expect(
    page.getByText(/^Details copied from demo request DEM-/),
  ).toBeVisible();
  await expect(field(page, "Full name *")).toHaveValue("Olivia Grant");
  await expect(field(page, "Project 1 name *")).toHaveValue(
    `${company.split(" ")[0]} booking platform`,
  );
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();
  await expect(
    toast(page, `Customer added. Invitation sent to ${email}`),
  ).toBeVisible();
  await expect(page.getByText(/^Demo request DEM-/)).toBeVisible();

  // The customer activates from the invitation and signs in.
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
  await customerWindow.close();
});

test("a quote from the Contact page: review, estimate, won, convert", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  const email = uniqueEmail("hannah");
  const company = `Alpenblick ${tag()}`;

  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Get a quote" });
  await form
    .getByLabel("Project type")
    .selectOption({ label: "API integration" });
  await form.getByLabel("Budget range").selectOption({ label: "£15k – £50k" });
  await form
    .getByLabel("Timeline")
    .selectOption({ label: "Within 3–6 months" });
  await form.getByLabel("Full name *").fill("Hannah Weber");
  await form.getByLabel("Work email *").fill(email);
  await form.getByLabel("Company (optional)").fill(company);
  await form.getByLabel("Requirements *").fill("Connect our booking engine.");
  await form.getByRole("button", { name: "Request my quote" }).click();
  await expect(page.getByText("Your request is in").first()).toBeVisible();
  await waitForEmail(email, /quote request/);

  await signInBrowser(page.context(), admin);
  await openLead(page, "quotes", company);
  await page.getByRole("button", { name: "Start review" }).click();
  await expect(
    page.getByText(
      "In review with Test admin. Send the estimate when the scope is clear.",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Send estimate" }).click();
  const estimate = page.getByRole("dialog", { name: "Send estimate" });
  await expect(estimate.getByLabel("Estimate (GBP) *")).toHaveValue("£24,000");
  await estimate.getByRole("button", { name: "Send estimate" }).click();
  await expect(toast(page, `Estimate sent to ${email}`)).toBeVisible();
  const sent = await waitForEmail(email, /estimate from/);
  expect(sent.subject).toBe("Your estimate from FlyConnect Tech");
  await expect(
    page.getByText(/^Estimate of £24,000 sent\. Valid until /),
  ).toBeVisible();

  await page.getByRole("button", { name: "Mark as won" }).click();
  await expect(toast(page, /is now Won/)).toBeVisible();
  await page.getByRole("link", { name: "Convert to customer" }).click();
  await expect(
    page.getByText(/^Details copied from quote request QUO-/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "← Back to quote request" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();
  await expect(toast(page, "Customer added.")).toBeVisible();
  const cameFrom = page.getByRole("link", { name: /^Quote request QUO-/ });
  await expect(cameFrom).toBeVisible();

  // The quote now says it is a customer, and can't be converted again.
  await cameFrom.click();
  await expect(
    page.getByText(/^Hannah Weber is now a customer · /),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Convert to customer" }),
  ).toHaveCount(0);
});

test("a message from an existing customer: banner, Open customer, and the reply", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  const email = uniqueEmail("sarah");
  const company = `Bluewave ${tag()}`;
  await postAs(admin, "/team/customers", {
    name: "Sarah Mitchell",
    email,
    company,
    projects: [{ name: "Bluewave booking website", type: "WEBSITE" }],
  });

  await page.goto("/contact");
  await page
    .getByRole("tablist", { name: "Contact options" })
    .getByRole("tab", { name: "Send a message" })
    .click();
  const form = page.getByRole("form", { name: "Send a message" });
  await form.getByLabel("Topic").selectOption({ label: "An existing project" });
  await form.getByLabel("Full name *").fill("Sarah Mitchell");
  await form.getByLabel("Email *").fill(email);
  await form
    .getByLabel("Message *")
    .fill("Could you add a page for our winter sale?");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Message sent").first()).toBeVisible();

  await signInBrowser(page.context(), admin);
  await openLead(page, "messages", email);
  await expect(
    page.getByText(
      `Sarah Mitchell is a customer (${company}). Project requests should come through the client portal so the team can track them.`,
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open customer" })).toBeVisible();

  // The reply starts with the "use the client portal" wording.
  const reply = page.getByLabel("Email to Sarah");
  await expect(reply).toHaveValue(/support request from your client portal/);
  await page.getByRole("button", { name: "Send email" }).click();
  await expect(toast(page, `Email sent to ${email}`)).toBeVisible();
  await expect(page.getByText("Status changed to Replied")).toBeVisible();
  const answer = await waitForEmail(email, /About your message/);
  expect(answer.text).toContain("client portal");

  await page.getByRole("link", { name: "Open customer" }).click();
  await expect(page).toHaveURL(/\/team\/customers\/[0-9a-f-]{36}$/);
});

test("phone: Demo requests fits the screen", async ({ page }) => {
  const manager = await createPerson("manager");
  await signInBrowser(page.context(), manager);
  await page.setViewportSize(phone);
  await page.goto("/team/leads/demos");
  await expect(
    page.getByText(/demo requests? ·/).filter({ visible: true }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
});

test("a developer can't open website leads", async ({ page }) => {
  const developer = await createPerson("developer");
  await signInBrowser(page.context(), developer);
  await page.goto("/team/leads/quotes");
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
});
