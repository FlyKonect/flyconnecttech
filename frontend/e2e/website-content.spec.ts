import { randomUUID } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser } from "./support/accounts";

// Website content: an admin adds a testimonial and changes the
// live-project link on the team panel, and the public website shows them
// straight away. Everything is put back at the end.

test.describe.configure({ timeout: 180_000 });

/** A visible form field by its label (pages left behind stay hidden). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

const toast = (page: Page, text: string) =>
  page.getByRole("status").filter({ hasText: text });

const DEFAULT_LINK = "https://dev.flyconnect.co.uk";

test("a testimonial and the live-project link reach the website", async ({
  page,
  browser,
}) => {
  const baseURL = test.info().project.use.baseURL;
  const word = randomUUID().slice(0, 6);
  const quote = `They rebuilt our booking site in six weeks (${word}).`;
  const link = `https://live-${word}.example.com`;

  const admin = await createPerson("admin");
  await signInBrowser(page.context(), admin);
  await page.goto("/team/website-content");

  // Add a testimonial for Home.
  await page.getByRole("button", { name: "Add testimonial" }).click();
  const add = page.getByRole("dialog", { name: "Add testimonial" });
  await add.getByRole("button", { name: "Add testimonial" }).click();
  await expect(add.getByText("Write the quote")).toBeVisible();
  await add.getByLabel("Quote *").fill(quote);
  await add.getByLabel("Client name *").fill("Sarah Mitchell");
  await add.getByLabel("Company (optional)").fill("Bluewave Holidays");
  await add.getByRole("button", { name: "Add testimonial" }).click();
  await expect(toast(page, "Testimonial added")).toBeVisible();
  const list = page.getByRole("list", { name: "Testimonials" });
  await expect(list).toContainText(quote);

  // A visitor sees it on Home at once.
  const visitorWindow = await browser.newContext({ baseURL });
  const visitor = await visitorWindow.newPage();
  await visitor.goto("/");
  await expect(
    visitor.getByRole("heading", { name: "What our clients say" }),
  ).toBeVisible();
  await expect(visitor.getByText(quote)).toBeVisible();

  // Change the live-project link: "View live project" opens it.
  await field(page, "Web address").fill("not a web address");
  await page.getByRole("button", { name: "Save link" }).click();
  await expect(
    page.getByText("Enter a full web address starting with https://"),
  ).toBeVisible();
  await field(page, "Web address").fill(link);
  await page.getByRole("button", { name: "Save link" }).click();
  await expect(toast(page, "Live project link saved")).toBeVisible();
  await visitor.goto("/case-studies");
  await expect(
    visitor.getByRole("link", { name: /View live project/ }).first(),
  ).toHaveAttribute("href", link);

  // Put the link back for everyone else.
  await field(page, "Web address").fill(DEFAULT_LINK);
  await page.getByRole("button", { name: "Save link" }).click();
  await expect(toast(page, "Live project link saved")).toBeVisible();

  // Remove the testimonial: it leaves the website.
  await list
    .getByRole("listitem")
    .filter({ hasText: quote })
    .getByRole("button", { name: /^Actions for/ })
    .click();
  await page.getByRole("menuitem", { name: "Remove" }).click();
  await page
    .getByRole("dialog", { name: "Remove this testimonial?" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(toast(page, "Testimonial removed")).toBeVisible();
  await expect(list.getByText(quote)).toHaveCount(0);
  await visitor.goto("/");
  await expect(visitor.getByText(quote)).toHaveCount(0);
  await visitorWindow.close();
});
