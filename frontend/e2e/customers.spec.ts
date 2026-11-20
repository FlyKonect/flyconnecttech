import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import {
  createPerson,
  PASSWORD,
  signInBrowser,
  uniqueEmail,
  type TestPerson,
} from "./support/accounts";
import { e2e } from "./support/e2e-env";
import { linkIn, waitForEmail } from "./support/mailpit";
import { postAs } from "./support/portal";

// Customers and users in the team panel (docs/01, section 5, screens 26 to
// 30), through the real screens, with the real emails from Mailpit.

const phone = { width: 390, height: 844 };

/** A visible form field by its label (pages left behind stay hidden). */
const field = (page: Page, label: string) =>
  page.getByLabel(label).filter({ visible: true });

/** Something unique to search for: "Skyline 1a2b3c". */
const tag = () => randomUUID().slice(0, 6);

/** A customer added through the backend, as an admin would. */
async function addCustomer(admin: TestPerson, projectName: string) {
  const email = uniqueEmail("customer");
  const { id } = (await postAs(admin, "/team/customers", {
    name: "Hassan Qureshi",
    email,
    company: "Skyline Travel",
    projects: [{ name: projectName, type: "TRAVEL_BOOKING_PLATFORM" }],
  })) as { id: string };
  return { id, email };
}

/** The toast with this text (the page's loading placeholder is a "status" too). */
const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test("an admin adds a customer with two projects; the customer activates and sees exactly those", async ({
  page,
  browser,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  await signInBrowser(page.context(), admin);
  const email = uniqueEmail("hassan");
  const name = `Skyline ${tag()}`;

  // Customers, then + Add customer.
  await page.goto("/team/customers");
  await page.getByRole("link", { name: "+ Add customer" }).click();
  await expect(page).toHaveURL(/\/team\/customers\/new$/);
  await expect(
    page.getByRole("banner").getByText("Add customer"),
  ).toBeVisible();

  // Nothing filled in: the design's messages.
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();
  await expect(
    page.getByText("Please fill in the highlighted fields."),
  ).toBeVisible();
  await expect(page.getByText("Enter the customer's name")).toBeVisible();
  await expect(page.getByText("Enter a project name")).toBeVisible();

  await field(page, "Full name").fill("Hassan Qureshi");
  await field(page, "Work email").fill(email);
  await field(page, "Company").fill("Skyline Travel");
  await field(page, "Project 1 name").fill(`${name} booking website`);
  await field(page, "Project type")
    .first()
    .selectOption("TRAVEL_BOOKING_PLATFORM");
  await page.getByRole("button", { name: "+ Add another project" }).click();
  await field(page, "Project 2 name").fill(`${name} agent portal`);
  await field(page, "Project type").nth(1).selectOption("AGENT_PORTAL");
  const next = page.getByRole("complementary", { name: "What happens next" });
  await expect(next).toContainText("We email Hassan an invitation link.");
  await expect(next).toContainText("send requests for 2 projects");
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();

  // The new customer's page.
  await expect(
    toast(page, `Customer added. Invitation sent to ${email}`),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/team\/customers\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole("banner").getByText("Customer · Skyline Travel"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Projects · 2" }),
  ).toBeVisible();
  await expect(
    page.getByText("Invitation sent. Waiting for Hassan"),
  ).toBeVisible();
  const customerUrl = page.url();

  // The invitation lists both projects.
  const invitation = await waitForEmail(email);
  expect(invitation.subject).toBe(
    "Your FlyConnect Tech support account is ready",
  );
  expect(invitation.text).toContain(`${name} booking website`);
  expect(invitation.text).toContain(`${name} agent portal`);

  // The customer activates and signs in, in a window of their own.
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const customer = await context.newPage();
  await customer.goto(new URL(linkIn(invitation, "/invite/")).pathname);
  await field(customer, "New password").fill(PASSWORD);
  await field(customer, "Confirm password").fill(PASSWORD);
  await customer.getByRole("button", { name: "Activate account" }).click();
  await expect(customer).toHaveURL(/\/portal\/sign-in\?activated=1$/);
  await field(customer, "Email address").fill(email);
  await field(customer, "Password").fill(PASSWORD);
  await customer.getByRole("button", { name: "Sign in" }).click();
  await expect(customer).toHaveURL(/\/portal$/);

  // New request: exactly those two projects (after "Choose a project").
  await customer.goto("/portal/requests/new");
  const projects = field(customer, "Project *").locator("option");
  await expect(projects).toHaveCount(3);
  await expect(projects.nth(1)).toContainText(`${name} booking website`);
  await expect(projects.nth(2)).toContainText(`${name} agent portal`);
  await context.close();

  // The team sees them as active now.
  await page.goto(customerUrl);
  await expect(
    page.getByText("Active. Hassan verified their email"),
  ).toBeVisible();
});

test("the customer page: add a project, change its status, send a reset link", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  const name = `Atlas ${tag()}`;
  const { id, email } = await addCustomer(admin, `${name} stock sync`);
  await signInBrowser(page.context(), admin);
  await page.goto(`/team/customers/${id}`);

  // Add project.
  await field(page, "New project name").fill(`${name} mobile app`);
  await field(page, "Project type").selectOption("WEB_APPLICATION");
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(toast(page, "Project added for Skyline Travel")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Projects · 2" }),
  ).toBeVisible();

  // Its status.
  await page
    .getByLabel(`Status of ${name} mobile app`)
    .selectOption("IN_DEVELOPMENT");
  await expect(toast(page, /P-\d+ is now In development/)).toBeVisible();

  // Invited: Resend invitation.
  await page.getByRole("button", { name: "Resend invitation" }).click();
  await expect(toast(page, `Invitation sent again to ${email}`)).toBeVisible();

  // The customer activates with the new link (the email is sent before the
  // button answers, so it is the newest one).
  const invitation = await waitForEmail(email);
  const token = linkIn(invitation, "/invite/").split("/invite/")[1];
  const accepted = await fetch(
    `${e2e.apiUrl}/accounts/invitations/${token}/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Hassan Qureshi", password: PASSWORD }),
    },
  );
  expect(accepted.ok).toBe(true);

  // Active: Send password reset link, and the email arrives.
  await page.reload();
  await page.getByRole("button", { name: "Send password reset link" }).click();
  await expect(
    toast(page, `Password reset link sent to ${email}`),
  ).toBeVisible();
  const reset = await waitForEmail(email, /Reset your/);
  expect(reset.subject).toBe("Reset your FlyConnect Tech password");
});

test("the customer page: edit the company name and a project", async ({
  page,
}) => {
  const admin = await createPerson("admin");
  const name = `Harbour ${tag()}`;
  const { id } = await addCustomer(admin, `${name} booking site`);
  await signInBrowser(page.context(), admin);
  await page.goto(`/team/customers/${id}`);

  await page.getByRole("button", { name: "Edit company" }).click();
  const company = page.getByRole("dialog", { name: "Edit company name" });
  await company.getByLabel("Company name *").fill(`${name} Travel Ltd`);
  await company.getByRole("button", { name: "Save" }).click();
  await expect(toast(page, "Company name saved")).toBeVisible();
  await expect(page.getByRole("region", { name: "Customer" })).toContainText(
    `${name} Travel Ltd`,
  );

  await page.getByRole("button", { name: `Edit ${name} booking site` }).click();
  const project = page.getByRole("dialog", { name: /^Edit P-\d+$/ });
  await project.getByLabel("Project name *").fill(`${name} booking engine`);
  await project.getByLabel("Project type").selectOption("WEB_APPLICATION");
  await project.getByRole("button", { name: "Save" }).click();
  await expect(toast(page, /P-\d+ saved/)).toBeVisible();
  await expect(page.getByText(`${name} booking engine`)).toBeVisible();
  await expect(page.getByText(/P-\d+ · Web application/)).toBeVisible();
});

test("Users: change a role, disable, then enable again", async ({ page }) => {
  const admin = await createPerson("admin");
  const name = `Role ${tag()}`;
  const person = await createPerson("developer", name);
  await signInBrowser(page.context(), admin);
  await page.goto("/team/users");
  await page
    .getByRole("searchbox", { name: "Search team members" })
    .fill(person.email);
  const row = page
    .getByRole("table", { name: "Team members" })
    .getByRole("row")
    .filter({ hasText: person.email });

  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Change role" }).click();
  const dialog = page.getByRole("dialog", { name: `Change ${name}'s role` });
  // Admins can't give the super admin role.
  await expect(dialog.getByRole("option", { name: "Super admin" })).toHaveCount(
    0,
  );
  await dialog.getByLabel("Role").selectOption("MANAGER");
  await dialog.getByRole("button", { name: "Change role" }).click();
  await expect(toast(page, `${name} is now Manager`)).toBeVisible();
  await expect(row).toContainText("Manager");

  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Disable user" }).click();
  await page
    .getByRole("dialog", { name: `Disable ${name}?` })
    .getByRole("button", { name: "Disable user" })
    .click();
  await expect(row).toContainText("Disabled");

  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Enable user" }).click();
  await expect(
    toast(page, `${name} is enabled and can sign in again`),
  ).toBeVisible();
  await expect(row).toContainText("Active");
});

test("Users: change an active member's email, confirmed from the new address", async ({
  page,
  browser,
}) => {
  const admin = await createPerson("admin");
  const name = `Email ${tag()}`;
  const person = await createPerson("developer", name);
  const next = uniqueEmail("moved");
  await signInBrowser(page.context(), admin);
  await page.goto("/team/users");
  await page
    .getByRole("searchbox", { name: "Search team members" })
    .fill(person.email);
  const row = page
    .getByRole("table", { name: "Team members" })
    .getByRole("row")
    .filter({ hasText: person.email });
  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Change email" }).click();
  const dialog = page.getByRole("dialog", { name: `Change ${name}'s email` });
  await dialog.getByLabel("New email address *").fill(next);
  await dialog.getByRole("button", { name: "Send link" }).click();
  await expect(toast(page, `Confirmation link sent to ${next}`)).toBeVisible();

  // The person opens the link from the new address and confirms.
  const email = await waitForEmail(next, /Confirm your new/);
  const visitor = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const tab = await visitor.newPage();
  await tab.goto(new URL(linkIn(email, "/confirm-email/")).pathname);
  await expect(
    tab.getByRole("heading", { name: "Confirm your new email" }),
  ).toBeVisible();
  // Ready first: a click before the page has loaded does nothing.
  await tab.waitForLoadState("networkidle");
  await tab.getByRole("button", { name: "Confirm new email" }).click();
  await expect(
    tab.getByRole("heading", { name: "Your new email is confirmed" }),
  ).toBeVisible();
  await visitor.close();

  // The old address hears about it.
  await waitForEmail(person.email, /email was changed/);
});

test("a manager only looks: View only, no add, no changes", async ({
  page,
}) => {
  const admin = await createPerson("admin");
  const manager = await createPerson("manager");
  const name = `Kestrel ${tag()}`;
  const { id } = await addCustomer(admin, `${name} reporting suite`);
  await signInBrowser(page.context(), manager);

  await page.goto("/team/customers");
  await expect(page.getByText("View only")).toBeVisible();
  await expect(page.getByRole("link", { name: "+ Add customer" })).toHaveCount(
    0,
  );

  // Search by project name finds just that customer.
  await field(page, "Search customers or projects").fill(name);
  await field(page, "Search customers or projects").press("Enter");
  await expect(page).toHaveURL(/\?q=/);
  const rows = page
    .getByRole("table", { name: "Customers" })
    .getByRole("row")
    .filter({ hasText: name });
  await expect(rows).toHaveCount(1);
  await rows.getByRole("link").click();

  await expect(page).toHaveURL(new RegExp(`/team/customers/${id}$`));
  await expect(
    page.getByText(`${name} reporting suite`).filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Planning", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByLabel("New project name")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Resend invitation" }),
  ).toHaveCount(0);
  await expect(page.getByLabel(/^Status of/)).toHaveCount(0);
});

test("a developer can't open customers", async ({ page }) => {
  const developer = await createPerson("developer");
  await signInBrowser(page.context(), developer);
  await page.goto("/team/customers");
  await expect(
    page.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();
});

test("Add user: admins can't pick super admin; the new developer shows as invited, then resend and disable", async ({
  page,
}) => {
  test.slow();
  const admin = await createPerson("admin");
  await signInBrowser(page.context(), admin);
  const name = `Ayesha ${tag()}`;
  const email = uniqueEmail("ayesha");

  await page.goto("/team/users");
  await page.getByRole("link", { name: "+ Add user" }).click();
  await expect(page).toHaveURL(/\/team\/users\/new$/);
  const roles = page.getByRole("radiogroup", { name: "Role *" });
  await expect(
    roles.getByRole("radio", { name: /Super admin/ }),
  ).toBeDisabled();
  await expect(
    page.getByText("Only a super admin can add another super admin"),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "What a Developer can do" }),
  ).toContainText("Convert a lead to a customer");

  await field(page, "Full name").fill(name);
  await field(page, "Work email").fill(email);
  await field(page, "Job title (optional)").fill("Frontend developer");
  await roles.getByRole("radio", { name: /Developer/ }).click();
  await expect(
    page.getByText(`We email ${name.split(" ")[0]} an invitation`),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send invitation" }).click();

  await expect(page).toHaveURL(/\/team\/users$/);
  await expect(toast(page, `Invitation sent to ${email}`)).toBeVisible();
  const invitation = await waitForEmail(email);
  expect(invitation.text).toContain("Developer");

  await page
    .getByRole("searchbox", { name: "Search team members" })
    .fill(email);
  const row = page
    .getByRole("table", { name: "Team members" })
    .getByRole("row")
    .filter({ hasText: email });
  await expect(row).toContainText("Invited");
  await expect(row).toContainText("Frontend developer");

  // Resend invitation from the row's menu.
  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Resend invitation" }).click();
  await expect(toast(page, `Invitation sent again to ${email}`)).toBeVisible();

  // Disable: confirm first.
  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Disable user" }).click();
  const dialog = page.getByRole("dialog", { name: `Disable ${name}?` });
  await expect(dialog).toContainText("Their invitation link stops working");
  await dialog.getByRole("button", { name: "Disable user" }).click();
  await expect(toast(page, `${name} is disabled`)).toBeVisible();
  await expect(row).toContainText("Disabled");
});

test("a super admin can pick every role", async ({ page }) => {
  const owner = await createPerson("super-admin");
  await signInBrowser(page.context(), owner);
  await page.goto("/team/users/new");
  await expect(
    page
      .getByRole("radiogroup", { name: "Role *" })
      .getByRole("radio", { name: /Super admin/ }),
  ).toBeEnabled();
  await expect(
    page.getByText("Only a super admin can add another super admin"),
  ).toHaveCount(0);
});

test("phone: the customers list and the customer page fit the screen", async ({
  page,
}) => {
  const admin = await createPerson("admin");
  const { id } = await addCustomer(admin, `Lagoon ${tag()} integration`);
  await signInBrowser(page.context(), admin);
  await page.setViewportSize(phone);
  await page.goto("/team/customers");
  await expect(
    page.getByRole("link", { name: "+ Add customer" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
  await page.goto(`/team/customers/${id}`);
  await expect(
    page.getByRole("heading", { name: "Projects · 1" }),
  ).toBeVisible();
  await expectNoSidewaysScroll(page);
});
