import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";
import { waitForEmail } from "./support/mailpit";
import { addProject, postAs } from "./support/portal";
import { choose } from "./support/forms";

// Modules: an admin puts a developer on the project team; the developer
// moves a module through Testing to Client review; the customer asks for
// changes (round 2); the developer retests and sends it back; the
// customer approves it, and the timeline shows every step.

test.describe.configure({ timeout: 300_000 });

const toast = (page: Page, text: string | RegExp) =>
  page.getByRole("status").filter({ hasText: text });

/** Opens "Move to…" on the module and moves it to the stage. */
async function moveTo(page: Page, part: string, stage: string) {
  const card = page.getByRole("region", { name: new RegExp(`^${part}`) });
  await card.getByRole("button", { name: "Move to…" }).click();
  const dialog = page.getByRole("dialog", { name: `Move ${part}` });
  await choose(dialog.getByLabel("New stage"), { label: stage });
  await dialog.getByRole("button", { name: "Move" }).click();
  await expect(toast(page, `${part} moved to ${stage}`)).toBeVisible();
}

test("a module from development to client review, a round of changes, then approved", async ({
  page,
  browser,
}) => {
  const word = randomUUID().slice(0, 6);
  const part = `Payments ${word}`;
  const admin = await createPerson("admin");
  const developer = await createPerson("developer", `Dev ${word}`);
  const customer = await createPerson("customer");
  const code = addProject(customer.email, `Booking site ${word}`);
  const { id: moduleId } = (await postAs(
    admin,
    `/team/projects/${code}/modules`,
    { name: part },
  )) as { id: string };
  await postAs(admin, `/team/projects/${code}/items`, {
    moduleId,
    lines: "Stripe payments\nReceipts",
  });

  // The admin puts the developer on the project team.
  await signInBrowser(page.context(), admin);
  await page.goto(`/team/projects/${code}`);
  await choose(page.getByLabel("Add someone"), {
    label: `Dev ${word} · Tester`,
  });
  await page
    .getByRole("form", { name: "Add to the team" })
    .getByRole("button", { name: "Add" })
    .click();
  await expect(toast(page, `Dev ${word} added to the team`)).toBeVisible();

  // The developer sees the project and moves the module on.
  const devContext = await browser.newContext();
  const dev = await devContext.newPage();
  await signInBrowser(devContext, developer);
  await dev.goto(`/team/projects/${code}/modules`);
  await expect(dev.getByRole("button", { name: "Edit details" })).toHaveCount(
    0,
  );
  await moveTo(dev, part, "Development");
  await moveTo(dev, part, "Testing");
  await moveTo(dev, part, "Client review");
  const ready = await waitForEmail(
    customer.email,
    new RegExp(`^Ready for your review: ${part}`),
  );
  expect(ready.text).toContain(`/portal/projects/${code}/modules`);

  // The customer asks for changes: a second round.
  const customerContext = await browser.newContext();
  const portal = await customerContext.newPage();
  await signInBrowser(customerContext, customer);
  await portal.goto(`/portal/projects/${code}/modules`);
  const review = portal.getByRole("group", { name: `Review ${part}` });
  await review.getByRole("button", { name: "Request changes" }).click();
  const changes = portal.getByRole("dialog");
  await changes.getByRole("button", { name: "Send changes" }).click();
  await expect(changes.getByText("Say what should change")).toBeVisible();
  await changes
    .getByLabel(/What should change/)
    .fill("Please show the card fee before the Pay button.");
  await changes.getByRole("button", { name: "Send changes" }).click();
  await expect(toast(portal, "The team has your changes")).toBeVisible();
  await expect(portal.getByText("Round 2").first()).toBeVisible();
  await waitForEmail(
    developer.email,
    new RegExp(`^Changes requested on ${part}`),
  );

  // Rework, retest, back for review.
  await dev.reload();
  await moveTo(dev, part, "Development");
  await moveTo(dev, part, "Retest");
  await moveTo(dev, part, "Client review");

  // Approved: Done, with every item done.
  await portal.reload();
  await portal
    .getByRole("group", { name: `Review ${part}` })
    .getByRole("button", { name: "Approve module" })
    .click();
  await portal
    .getByRole("dialog")
    .getByRole("button", { name: "Approve module" })
    .click();
  await expect(toast(portal, `${part} approved`)).toBeVisible();
  const card = portal.getByRole("region", { name: new RegExp(`^${part}`) });
  await expect(
    card.getByRole("progressbar", { name: `Progress of ${part}` }),
  ).toHaveAttribute("aria-valuenow", "100");
  await expect(card.getByRole("group", { name: /^Review/ })).toHaveCount(0);

  // The timeline shows every move, with the round and the note.
  await portal.goto(`/portal/projects/${code}/timeline`);
  const moves = portal.getByRole("region", { name: "Every move" });
  await expect(moves.getByText("(round 2)").first()).toBeVisible();
  await expect(
    moves.getByText("“Please show the card fee before the Pay button.”"),
  ).toBeVisible();
  await devContext.close();
  await customerContext.close();
});
