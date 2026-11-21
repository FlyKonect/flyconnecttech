import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";
import { e2e } from "./support/e2e-env";
import { waitForEmail } from "./support/mailpit";
import {
  addProject,
  asPerson,
  PNG,
  postAs,
  sendRequest,
} from "./support/portal";
import { choose } from "./support/forms";

// The client portal (docs/01, section 4) through the real screens.

const phone = { width: 390, height: 844 };

/** A visible form field by its label (pages left behind stay hidden in the page). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

const sidebar = (page: Page) =>
  page.getByRole("complementary", { name: "Client portal menu" });

/** A new customer with one project, signed in in the browser. */
async function customerWithProject(
  page: Page,
  projectName = "Bluewave booking website",
) {
  const customer = await createPerson("customer");
  addProject(customer.email, projectName);
  await signInBrowser(page.context(), customer);
  return customer;
}

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test("a customer sends a request in four steps, with a file", async ({
  page,
}) => {
  test.slow();
  const customer = await createPerson("customer");
  addProject(customer.email, "Bluewave booking website");
  addProject(
    customer.email,
    "Bluewave agent portal",
    "agent-portal",
    "in-development",
  );
  await signInBrowser(page.context(), customer);

  // A new customer's Overview.
  await page.goto("/portal");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(", Test");
  await expect(
    page.getByText("No requests need your response.").filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("link", { name: "Create support request" })
    .click();

  // One page: submitting it empty shows what's missing.
  await expect(page).toHaveURL(/\/portal\/requests\/new$/);
  await page.getByRole("button", { name: "Submit request" }).click();
  await expect(page.getByText("Choose a project.")).toBeVisible();
  await expect(page.getByText("Choose a request type.")).toBeVisible();
  await expect(page.getByText("Enter a request title")).toBeVisible();
  await expect(field(page, "Project *")).toBeFocused();

  await choose(field(page, "Project *"), /Bluewave agent portal/);
  await page.getByRole("radio", { name: /Bug Report/ }).click();
  await field(page, "Request title *").fill(
    "Agent commission report shows wrong totals",
  );
  await field(page, "Detailed description *").fill(
    "Since the October update, the commission report shows totals about 8% higher.",
  );
  await page.getByRole("radio", { name: "High" }).click();
  await field(page, "Page or website URL (optional)").fill(
    "agents.bluewaveholidays.co.uk/reports",
  );
  await page.locator("input[type=file]").setInputFiles({
    name: "report-totals.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await expect(page.getByText("report-totals.png")).toBeVisible();
  await page.getByRole("button", { name: "Submit request" }).click();

  // Submitted (screen 11). Sending saves the request, its file and its
  // emails: slower on a busy machine.
  await expect(page).toHaveURL(
    /\/portal\/requests\/TKT-\d{4}-\d{5}\/submitted$/,
    { timeout: 15_000 },
  );
  const code = page.url().match(/TKT-\d{4}-\d{5}/)![0];
  await expect(
    page.getByRole("heading", { name: "Request submitted" }),
  ).toBeVisible();
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  await expect(
    sidebar(page).getByRole("link", { name: /My Requests/ }),
  ).toContainText("1");

  // The copy by email.
  const copy = await waitForEmail(customer.email, /We received your request/);
  expect(copy.subject).toBe(`We received your request ${code}`);
  expect(copy.text).toContain("Agent commission report shows wrong totals");

  // The request page: the description is the first message, with its file.
  await page.getByRole("link", { name: "View request" }).click();
  await expect(page).toHaveURL(new RegExp(`/portal/requests/${code}$`));
  const details = page.getByRole("region", { name: "Request details" });
  await expect(details).toContainText("Unassigned");
  await expect(details).toContainText("Bluewave agent portal");
  const conversation = page.getByRole("list", { name: "Conversation" });
  await expect(conversation).toContainText("Since the October update");
  const download = page.waitForEvent("download");
  await conversation.getByRole("link", { name: /report-totals\.png/ }).click();
  expect((await download).suggestedFilename()).toBe("report-totals.png");

  // My requests.
  await page.goto("/portal/requests");
  const tabs = page.getByRole("tablist", { name: "My requests" });
  await expect(tabs.getByRole("tab", { name: /All/ })).toContainText("1");
  await expect(tabs.getByRole("tab", { name: /Open/ })).toContainText("1");
  await expect(
    page
      .getByRole("link", {
        name: `${code}: Agent commission report shows wrong totals`,
      })
      .first(),
  ).toBeAttached();
});

test("replies, waiting for the customer, resolved, confirm and reopen", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  const customer = await customerWithProject(page);
  const code = await sendRequest(customer);
  // The team asks for more information (team panel, "Request more info").
  await postAs(admin, `/team/requests/${code}/request-info`, {
    body: "Could you share the booking reference?",
  });

  await page.goto(`/portal/requests/${code}`);
  await expect(
    page.getByText("The support team is waiting for your reply."),
  ).toBeVisible();
  const conversation = page.getByRole("list", { name: "Conversation" });
  await expect(conversation).toContainText(
    `${admin.name} · FlyConnect Tech Support`,
  );
  await expect(conversation).toContainText(
    "Could you share the booking reference?",
  );

  // The reply moves the request back to In Progress.
  // The file first: once its chip shows, the page is ready for typing
  // (in Safari, text typed earlier could be reset as the page loads).
  await page.locator("input[type=file]").setInputFiles({
    name: "booking.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await expect(page.getByText("booking.png")).toBeVisible();
  await field(page, "Reply").fill("The booking reference is BW-58213.");
  await expect(field(page, "Reply")).toHaveValue(
    "The booking reference is BW-58213.",
  );
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Reply sent to the support team",
  );
  await expect(conversation).toContainText(
    "The booking reference is BW-58213.",
  );
  await expect(conversation).toContainText(
    "Status changed to In Progress after the customer replied",
  );
  await expect(
    conversation.getByRole("link", { name: /booking\.png/ }),
  ).toBeVisible();
  await expect(
    page.getByText("The support team is waiting for your reply."),
  ).toBeHidden();

  // Resolved: "I still need help" reopens it.
  const resolve = () =>
    postAs(admin, `/team/requests/${code}/resolve`, { email: false });
  await resolve();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Confirm it's fixed" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "I still need help" }).click();
  await expect(page.getByRole("status")).toContainText(
    `${code} is now In Progress`,
  );

  // Close, then reopen.
  await page.getByRole("button", { name: "Close request" }).click();
  await expect(
    page.getByRole("button", { name: "Reopen request" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reopen request" }).click();
  await expect(
    page.getByRole("button", { name: "Close request" }),
  ).toBeVisible();

  // Resolved again, and confirmed: closed.
  await resolve();
  await page.reload();
  await page.getByRole("button", { name: "Confirm it's fixed" }).click();
  // The rating: 5 stars and a comment (both optional).
  const rate = page.getByRole("dialog", { name: "Confirm it's fixed" });
  await rate.getByRole("radio", { name: /5 stars/ }).click();
  await rate.getByLabel("Anything to add? (optional)").fill("Fixed fast.");
  await rate.getByRole("button", { name: "Confirm it's fixed" }).click();
  await expect(
    page.getByRole("button", { name: "Reopen request" }),
  ).toBeVisible();
  await expect(conversation).toContainText(
    "confirmed the resolution. Request closed.",
  );
  const history = page.getByRole("region", { name: "Status history" });
  await expect(history.getByRole("listitem")).toHaveCount(9);
});

test("notifications: open one, then mark all as read", async ({ page }) => {
  // Two people, two requests and two replies before the screen opens.
  test.slow();
  const customer = await customerWithProject(page);
  const first = await sendRequest(customer, { title: "First request" });
  const second = await sendRequest(customer, { title: "Second request" });
  // Sending a request gives the customer no notice; a team reply does.
  const admin = await createPerson("admin", "Notice admin");
  for (const code of [first, second]) {
    await postAs(admin, `/team/requests/${code}/messages`, {
      kind: "reply",
      body: "We are looking at it.",
    });
  }

  await page.goto("/portal/notifications");
  await expect(page.getByRole("heading", { name: "2 unread" })).toBeVisible();
  await page
    .getByRole("link", { name: `Unread: Notice admin replied to ${first}` })
    .click();
  await expect(page).toHaveURL(new RegExp(`/portal/requests/${first}$`));
  await expect(
    sidebar(page).getByRole("link", { name: /Notifications/ }),
  ).toContainText("1");

  await page.goto("/portal/notifications");
  await expect(page.getByRole("heading", { name: "1 unread" })).toBeVisible();
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByRole("heading", { name: "0 unread" })).toBeVisible();
});

test("profile: save changes and change the password", async ({ page }) => {
  const customer = await customerWithProject(page);
  await page.goto("/portal/profile");

  await expect(page.getByText("E2E Travel Ltd").first()).toBeVisible();
  await expect(page.getByText(customer.email)).toBeVisible();
  await field(page, "Full name").fill("Sarah Mitchell");
  await field(page, "Phone").fill("+44 20 7946 0321");
  await choose(field(page, "Country"), "United Kingdom");
  await choose(field(page, "Time zone"), "Asia/Karachi");
  await page.getByLabel("Weekly summary of my requests").check();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Changes saved");
  await expect(sidebar(page)).toContainText("Sarah Mitchell");
  const saved = await asPerson<{ timezone: string; emailPrefs: object }>(
    customer,
    "/portal/profile",
  );
  expect(saved).toMatchObject({
    timezone: "Asia/Karachi",
    emailPrefs: { replies: true, statusChanges: true, weeklySummary: true },
  });

  // Change password: the current one must be right.
  await field(page, "Current password").fill("Not-the-password-1");
  await field(page, "New password").fill("Harbour-Light-9");
  await field(page, "Confirm new password").fill("Harbour-Light-9");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.locator("[data-slot=form-error]")).toHaveText(
    "Your current password is not right.",
  );
  await field(page, "Current password").fill(customer.password);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("status")).toContainText("Password updated");
  await expect(field(page, "Current password")).toHaveValue("");

  const signIn = await fetch(`${e2e.apiUrl}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: e2e.siteUrl },
    body: JSON.stringify({
      email: customer.email,
      password: "Harbour-Light-9",
    }),
  });
  expect(signIn.status).toBe(200);
});

test("another customer's request and files are not found", async ({ page }) => {
  // Two people, a project and a request with a file before the page opens:
  // close to 30 seconds on a busy machine.
  test.slow();
  const owner = await createPerson("customer");
  addProject(owner.email, "Private project");
  const code = await sendRequest(owner, { file: "private.png" });
  const detail = await asPerson<{ files: { id: string }[] }>(
    owner,
    `/portal/requests/${code}`,
  );

  await customerWithProject(page, "Someone else's project");
  await page.goto(`/portal/requests/${code}`);
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
  const file = await page.request.get(
    `${e2e.apiUrl}/portal/requests/${code}/files/${detail.files[0].id}`,
  );
  expect(file.status()).toBe(404);
});

test("phone: the Overview and a request fit the screen", async ({ page }) => {
  const customer = await customerWithProject(page);
  const code = await sendRequest(customer, { file: "screen.png" });
  await page.setViewportSize(phone);

  await page.goto("/portal");
  await expect(
    page.getByRole("heading", { name: "Recent requests" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.goto(`/portal/requests/${code}`);
  await expect(page.getByRole("button", { name: "Send reply" })).toBeVisible();
  await expectNoSidewaysScroll(page);

  await page.goto("/portal/requests/new");
  await expect(
    page.getByRole("heading", { name: "New support request" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
});
