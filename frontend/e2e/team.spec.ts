import { expect, test, type Page } from "@playwright/test";

import {
  createPerson,
  signInBrowser,
  type TestPerson,
} from "./support/accounts";
import { waitForEmail } from "./support/mailpit";
import {
  addProject,
  asPerson,
  idOf,
  postAs,
  sendRequest,
} from "./support/portal";
import { choose } from "./support/forms";

// The team panel (docs/01, section 5) through the real screens.

const phone = { width: 390, height: 844 };

/** A customer with a project, ready to send requests. */
async function customer(project = "Northgate checkout rebuild") {
  const person = await createPerson("customer");
  addProject(person.email, project, "website");
  return person;
}

/** Signs this person in, in a new browser window of their own. */
async function windowFor(page: Page, person: TestPerson) {
  const context = await page.context().browser()!.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  await signInBrowser(context, person);
  return context.newPage();
}

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test("admin: assign, reply and an internal note the customer never sees", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  await createPerson("developer");
  const client = await customer();
  const code = await sendRequest(client, { title: "Payment page times out" });
  await signInBrowser(page.context(), admin);

  // New requests tab, then open the request.
  await page.goto("/team/requests?status=submitted");
  await page
    .getByRole("link", { name: `${code}: Payment page times out` })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`/team/requests/${code}$`));
  await expect(page.getByText("Assigned: Unassigned")).toBeVisible();

  // Assign: the request moves to Under Review.
  await page.getByRole("button", { name: "Assign developer" }).click();
  // Every test developer is called "Test developer": any of them will do.
  const dialog = page.getByRole("dialog", { name: "Assign to a developer" });
  await dialog
    .getByRole("button", { name: /Test developer/ })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText(
    `${code} assigned to Test developer`,
  );
  await expect(page.getByText("Assigned: Test developer")).toBeVisible();
  const conversation = page.getByRole("region", {
    name: "Conversation & internal notes",
  });
  await expect(conversation).toContainText(
    "Assigned to Test developer by Test admin",
  );
  await expect(
    page.getByRole("region", { name: "ACTIVITY TIMELINE" }),
  ).toContainText("Under Review");

  // Reply to the customer: they get it by email.
  await page
    .getByLabel("Reply to the customer", { exact: true })
    .fill("We are looking at it now.");
  // With a file: staff replies take attachments too.
  await page.locator("form[data-mode] input[type=file]").setInputFiles({
    name: "fixed-checkout.png",
    mimeType: "image/png",
    buffer: Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from("a small test picture"),
    ]),
  });
  await page.getByRole("button", { name: "Send to customer" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Reply sent to the customer",
  );
  const email = await waitForEmail(client.email, /replied to/);
  expect(email.subject).toBe(`Test admin replied to ${code}`);

  // An internal note, in amber.
  await page.getByRole("button", { name: "Internal note" }).click();
  await page
    .getByLabel("Internal note", { exact: true })
    .fill("SECRET-NOTE: check the payment provider logs");
  await page.getByRole("button", { name: "Save internal note" }).click();
  await expect(conversation).toContainText("INTERNAL NOTE");
  await expect(conversation).toContainText("SECRET-NOTE");

  // The customer sees the reply, never the note.
  const customerPage = await windowFor(page, client);
  await customerPage.goto(`/portal/requests/${code}`);
  const theirs = customerPage.getByRole("list", { name: "Conversation" });
  await expect(theirs).toContainText("We are looking at it now.");
  await expect(theirs).toContainText("fixed-checkout.png");
  await expect(theirs).toContainText("Assigned to Test developer");
  await expect(customerPage.getByText("SECRET-NOTE")).toHaveCount(0);
  await customerPage.context().close();
});

test("developer: only their own requests, their limits, and resolve", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  const developer = await createPerson("developer");
  const client = await customer("Atlas stock sync");
  const mine = await sendRequest(client, { title: "Overnight sync failing" });
  const other = await sendRequest(client, { title: "Not for this developer" });
  await postAs(admin, `/team/requests/${mine}/assign`, {
    developerId: await idOf(developer),
  });
  await signInBrowser(page.context(), developer);

  // The dashboard's queue.
  await page.goto("/team");
  const queue = page.getByRole("region", { name: "My queue" });
  await expect(queue).toContainText("Overnight sync failing");

  // The list: only their own, with the banner.
  await page.goto("/team/requests");
  await expect(
    page
      .getByText("Showing requests assigned to you, Test developer.")
      .filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Request status" }),
  ).not.toContainText("New");
  await expect(
    page.getByRole("link", { name: `${mine}: Overnight sync failing` }).first(),
  ).toBeAttached();
  await expect(page.getByText(other)).toHaveCount(0);

  // Someone else's request is not found.
  await page.goto(`/team/requests/${other}`);
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();

  // Their limits on their own request.
  await page.goto(`/team/requests/${mine}`);
  const statuses = page.getByRole("radiogroup", { name: "STATUS" });
  await expect(statuses.getByRole("radio", { name: "Closed" })).toBeDisabled();
  await expect(
    statuses.getByRole("radio", { name: "In Progress" }),
  ).toBeEnabled();
  await expect(
    page.getByText("Set by your manager").filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Close request" })).toHaveCount(
    0,
  );

  // Resolve: the customer is asked to confirm, and confirms.
  await page.getByRole("button", { name: "Resolve" }).click();
  const dialog = page.getByRole("dialog", { name: `Resolve ${mine}` });
  await expect(
    dialog.getByLabel("Resolution summary for the customer"),
  ).toHaveValue(/The fix is live/);
  await dialog.getByRole("button", { name: "Mark as resolved" }).click();
  await expect(page.getByRole("status")).toContainText(
    `${mine} marked as resolved`,
  );
  const email = await waitForEmail(client.email, /Please confirm the fix/);
  expect(email.subject).toBe(`${mine} was resolved. Please confirm the fix.`);

  const customerPage = await windowFor(page, client);
  await customerPage.goto(`/portal/requests/${mine}`);
  await customerPage
    .getByRole("button", { name: "Confirm it's fixed" })
    .click();
  // Skipping the rating.
  await customerPage
    .getByRole("dialog", { name: "Confirm it's fixed" })
    .getByRole("button", { name: "Confirm it's fixed" })
    .click();
  await expect(customerPage.getByRole("status")).toContainText(
    `${mine} is now Closed`,
  );
  await customerPage.context().close();
});

test("manager: assign from the dashboard", async ({ page }) => {
  test.slow();
  const manager = await createPerson("manager");
  await createPerson("developer");
  const client = await customer();
  // Older urgent requests from earlier runs would fill the short list first.
  const leftovers = await asPerson<{
    rows: { code: string; status: string }[];
  }>(manager, "/team/requests?assignee=unassigned&priority=URGENT");
  for (const row of leftovers.rows) {
    if (row.status === "CLOSED") continue;
    await postAs(manager, `/team/requests/${row.code}/close`);
  }
  const code = await sendRequest(client, {
    title: "Checkout is down",
    priority: "URGENT",
  });
  await signInBrowser(page.context(), manager);

  await page.goto("/team");
  const list = page.getByRole("region", { name: "Unassigned requests" });
  await expect(list).toContainText("Checkout is down");
  await list.getByRole("button", { name: `Assign ${code}` }).click();
  const dialog = page.getByRole("dialog", { name: "Assign to a developer" });
  await dialog
    .getByRole("button", { name: /Test developer/ })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText(
    `${code} assigned to Test developer`,
  );
  await expect(list).not.toContainText("Checkout is down");
});

test("phone: the developer's dashboard fits the screen", async ({ page }) => {
  const developer = await createPerson("developer");
  await signInBrowser(page.context(), developer);
  await page.setViewportSize(phone);
  await page.goto("/team");
  await expect(page.getByRole("heading", { name: "My queue" })).toBeVisible();
  await expectNoSidewaysScroll(page);
});

test("manager: Edit details corrects the title and type, with a line in the conversation", async ({
  page,
}) => {
  const manager = await createPerson("manager", "Edit Manager");
  const client = await customer();
  const code = await sendRequest(client, { title: "Paymnet page slow" });
  await signInBrowser(page.context(), manager);
  await page.goto(`/team/requests/${code}`);

  await page.getByRole("button", { name: "Edit details" }).click();
  const dialog = page.getByRole("dialog", { name: `Edit ${code}` });
  await dialog.getByLabel("Title *").fill("Payment page slow");
  await choose(dialog.getByLabel("Request type"), "BUG_REPORT");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status")).toContainText(`${code} saved`);
  await expect(
    page.getByRole("heading", { name: /Payment page slow/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Conversation & internal notes" }),
  ).toContainText("Edit Manager changed the title, the type to Bug Report");
});
