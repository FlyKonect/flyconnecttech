import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";

// Delete user and Delete customer (docs/01, "Delete"), then adding the same
// email again: the screen asks Restore their history or Start fresh.

test.describe.configure({ timeout: 120_000 });

const field = (page: Page, label: string) =>
  page.getByLabel(label).filter({ visible: true });

const toast = (page: Page, text: string) =>
  page.getByRole("status").filter({ hasText: text });

test("an admin deletes a team member, then restores their history", async ({
  page,
}) => {
  const admin = await createPerson("admin");
  const name = `Ravi Patel ${randomUUID().slice(0, 6)}`;
  const developer = await createPerson("developer", name);
  await signInBrowser(page.context(), admin);

  await page.goto("/team/users");
  const table = page.getByRole("table", { name: "Team members" });
  const search = page.getByRole("searchbox", { name: "Search team members" });
  await search.fill(developer.email);
  const row = table.getByRole("row").filter({ hasText: developer.email });
  await row.getByRole("button", { name: `Actions for ${name}` }).click();
  await page.getByRole("menuitem", { name: "Delete user" }).click();
  const dialog = page.getByRole("dialog", { name: `Delete ${name}?` });
  await expect(dialog).toContainText("This can't be undone");
  await expect(dialog).toContainText(`${name} (deleted)`);
  await dialog.getByRole("button", { name: "Delete user" }).click();
  await expect(toast(page, `${name} is deleted`)).toBeVisible();
  await expect(table.getByText(developer.email)).toHaveCount(0);

  // Adding the same email again asks first.
  await page.goto("/team/users/new");
  await field(page, "Full name").fill(name);
  await field(page, "Work email").fill(developer.email);
  await page
    .getByRole("radiogroup", { name: "Role *" })
    .getByRole("radio", { name: /Developer/ })
    .click();
  await page.getByRole("button", { name: "Send invitation" }).click();
  const asked = page.getByRole("dialog", {
    name: "This email had an account before",
  });
  await expect(asked).toContainText(`belonged to ${name}`);
  await asked.getByRole("button", { name: /Restore their history/ }).click();

  await expect(page).toHaveURL(/\/team\/users$/);
  await expect(
    toast(page, `Account restored. Invitation sent to ${developer.email}`),
  ).toBeVisible();
  await search.fill(developer.email);
  await expect(
    table.getByRole("row").filter({ hasText: developer.email }),
  ).toContainText("Invited");
});

test("an admin deletes a customer, then starts fresh with the same email", async ({
  page,
}) => {
  const admin = await createPerson("admin");
  const customer = await createPerson("customer");
  await signInBrowser(page.context(), admin);

  await page.goto(`/team/customers?q=${encodeURIComponent(customer.email)}`);
  await page
    .getByRole("table", { name: "Customers" })
    .getByRole("row")
    .filter({ hasText: customer.email })
    .getByRole("link")
    .click();
  await expect(page).toHaveURL(/\/team\/customers\/[0-9a-f-]{36}$/);
  await page.getByRole("button", { name: "Delete customer" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete E2E Travel Ltd?" });
  await expect(dialog).toContainText(`${customer.email} can be used again`);
  await dialog.getByRole("button", { name: "Delete customer" }).click();
  await expect(toast(page, "E2E Travel Ltd is deleted")).toBeVisible();
  await expect(page).toHaveURL(/\/team\/customers$/);

  // Added again: Start fresh makes a new customer.
  await page.goto("/team/customers/new");
  await field(page, "Full name").fill(customer.name);
  await field(page, "Work email").fill(customer.email);
  await field(page, "Company").fill("Fresh Start Travel");
  await field(page, "Project 1 name").fill("Fresh Start website");
  await page
    .getByRole("button", { name: "Create customer and send invitation" })
    .click();
  const asked = page.getByRole("dialog", {
    name: "This email had an account before",
  });
  await expect(asked).toContainText("E2E Travel Ltd");
  await asked.getByRole("button", { name: /Start fresh/ }).click();
  await expect(page).toHaveURL(/\/team\/customers\/[0-9a-f-]{36}$/);
  await expect(page.getByText("Fresh Start Travel").first()).toBeVisible();
});
