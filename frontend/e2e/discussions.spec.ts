import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";
import { waitForEmail } from "./support/mailpit";
import { tick } from "./support/forms";
import { addProject, idOf, PNG, postAs } from "./support/portal";

// Project discussions: the customer starts a topic with a file; the team
// developer replies; an admin posts a proposal the customer approves; the
// customer marks the answer and closes the topic; the admin reopens it.
// Then a team topic asks the developer, waits for them, and never shows
// to the customer.

test.describe.configure({ timeout: 300_000 });

const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

test("a customer topic and a team topic, from start to close", async ({
  page,
  browser,
}) => {
  const word = randomUUID().slice(0, 6);
  const title = `Checkout on one page ${word}`;
  const secret = `Card fees ${word}`;
  const admin = await createPerson("admin");
  const developer = await createPerson("developer", `Dev ${word}`);
  const customer = await createPerson("customer");
  const code = addProject(customer.email, `Booking site ${word}`);
  // Put the developer on the project team.
  await postAs(admin, `/team/projects/${code}/members`, {
    userId: await idOf(developer),
  });

  // The customer starts a topic with a file.
  const customerContext = await browser.newContext();
  const portal = await customerContext.newPage();
  await signInBrowser(customerContext, customer);
  await portal.goto(`/portal/projects/${code}/discussions`);
  await portal.getByRole("button", { name: "+ New topic" }).click();
  const start = portal.getByRole("dialog", { name: "New discussion" });
  await start.getByLabel("Title *").fill(title);
  await start.getByLabel("Message").fill("Our agents find two steps slow.");
  await start.locator('input[type="file"]').setInputFiles({
    name: "checkout.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await expect(start.getByText("checkout.png")).toBeVisible();
  await start.getByRole("button", { name: "Start topic" }).click();
  await expect(portal).toHaveURL(
    new RegExp(`/portal/projects/${code}/discussions/\\d+$`),
  );
  const topicPath = new URL(portal.url()).pathname.split("/").pop()!;
  await waitForEmail(developer.email, new RegExp(`^New discussion: ${title}`));

  // The developer on the team replies.
  await signInBrowser(page.context(), developer);
  await page.goto(`/team/projects/${code}/discussions/${topicPath}`);
  await page
    .getByLabel("Your reply")
    .fill("Yes: details above, payment below.");
  await page.getByRole("button", { name: "Post reply" }).click();
  await expect(toast(page, "Reply posted")).toBeVisible();
  await waitForEmail(customer.email, new RegExp(`replied: ${title}`));

  // An admin posts a proposal; the customer approves it.
  const adminContext = await browser.newContext();
  const team = await adminContext.newPage();
  await signInBrowser(adminContext, admin);
  await team.goto(`/team/projects/${code}/discussions/${topicPath}`);
  await team.getByLabel("Your reply").fill("We propose a one-page checkout.");
  await team
    .getByLabel("Post as a proposal for the customer to approve")
    .check();
  await team.getByRole("button", { name: "Post proposal" }).click();
  await expect(toast(team, "Proposal posted")).toBeVisible();
  await waitForEmail(
    customer.email,
    new RegExp(`^Proposal waiting for your approval: ${title}`),
  );
  await portal.reload();
  await portal.getByRole("button", { name: "Approve proposal" }).click();
  await portal
    .getByRole("dialog")
    .getByRole("button", { name: "Approve proposal" })
    .click();
  await expect(toast(portal, "Proposal approved")).toBeVisible();
  await expect(portal.getByText("Approved", { exact: true })).toBeVisible();

  // The customer marks the developer's reply as the answer, then closes.
  await portal
    .getByRole("button", { name: `Actions for the message by Dev ${word}` })
    .click();
  await portal.getByRole("menuitem", { name: "Mark as the answer" }).click();
  await expect(toast(portal, "Marked as the answer")).toBeVisible();
  await expect(portal.getByText(`Answer, by Dev ${word}`)).toBeVisible();
  await portal.getByRole("button", { name: "Close topic" }).click();
  const closing = portal.getByRole("dialog");
  await closing.getByLabel("Closing note (optional)").fill("Agreed, thanks");
  await closing.getByRole("button", { name: "Close topic" }).click();
  await expect(toast(portal, "Topic closed")).toBeVisible();
  await expect(portal.getByText("This topic is closed.")).toBeVisible();
  await expect(portal.getByLabel("Your reply")).toHaveCount(0);

  // The admin reopens it.
  await team.reload();
  await team.getByRole("button", { name: "Reopen topic" }).click();
  await expect(toast(team, "Topic reopened")).toBeVisible();

  // A team topic: the admin asks the developer.
  await team.goto(`/team/projects/${code}/team-discussions`);
  await team.getByRole("button", { name: "+ New topic" }).click();
  const internal = team.getByRole("dialog", { name: "New team topic" });
  await internal.getByLabel("Title *").fill(secret);
  await internal.getByLabel("Message").fill("Where should the card fee show?");
  await tick(
    internal.getByLabel("Ask someone (optional)"),
    new RegExp(`^Dev ${word}`),
  );
  await internal.getByRole("button", { name: "Start topic" }).click();
  await expect(team).toHaveURL(
    new RegExp(`/team/projects/${code}/team-discussions/\\d+$`),
  );
  const secretPath = new URL(team.url()).pathname.split("/").pop()!;
  await expect(team.getByText(`Dev ${word} · waiting`)).toBeVisible();
  await waitForEmail(developer.email, new RegExp(`asked you: ${secret}`));

  // The developer replies: no longer waited for.
  await page.goto(`/team/projects/${code}/team-discussions/${secretPath}`);
  await page.getByLabel("Your reply").fill("Above the Pay button.");
  await page.getByRole("button", { name: "Post reply" }).click();
  await expect(toast(page, "Reply posted")).toBeVisible();
  await expect(page.getByText(`Dev ${word} · replied`)).toBeVisible();

  // The customer never sees the team topic.
  await portal.goto(`/portal/projects/${code}/discussions`);
  await expect(
    portal.getByRole("link", { name: new RegExp(title) }),
  ).toBeVisible();
  await expect(portal.getByText(secret)).toHaveCount(0);
  await portal.goto(`/portal/projects/${code}/discussions/${secretPath}`);
  await expect(
    portal.getByRole("heading", { name: "This page could not be found." }),
  ).toBeVisible();

  await customerContext.close();
  await adminContext.close();
});
