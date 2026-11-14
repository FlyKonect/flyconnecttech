import { expect, test } from "@playwright/test";

test("the home page shows the FlyConnect Tech name and logo", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FlyConnect Tech");
  await expect(
    page.getByRole("heading", { level: 1, name: /Your Business Idea/ }),
  ).toBeVisible();

  // The logo image really loads (it is not a broken image).
  const logo = page.getByRole("img", { name: "FlyConnect Tech" }).first();
  await expect(logo).toBeVisible();
  expect(
    await logo.evaluate((img: HTMLImageElement) => img.naturalWidth),
  ).toBeGreaterThan(0);
});

test("the browser tab uses the FlyConnect Tech icon", async ({ page }) => {
  await page.goto("/");

  const href = await page
    .locator('link[rel="icon"][type="image/svg+xml"]')
    .getAttribute("href");
  expect(href).toContain("/icon.svg");

  const icon = await page.request.get(href!);
  expect(icon.ok()).toBe(true);
  expect(await icon.text()).toContain("#D3AF34");
});
