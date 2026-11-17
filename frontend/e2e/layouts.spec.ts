import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser, type Role } from "./support/accounts";

const desktop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

/** The page must never scroll sideways. */
async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test.describe("website layout", () => {
  test("desktop: full menu, Support and Client login, Services dropdown and footer", async ({
    page,
  }) => {
    await page.setViewportSize(desktop);
    await page.goto("/");

    // No promotion bar: Support and Client login are in the header.
    await expect(page.locator("body")).not.toContainText(
      "Travel agencies: add Amadeus flight search",
    );
    const banner = page.getByRole("banner");
    await expect(
      banner.getByRole("link", { name: "Support", exact: true }),
    ).toHaveAttribute("href", "/support");
    await expect(
      banner.getByRole("link", { name: "Client login", exact: true }),
    ).toHaveAttribute("href", "/portal/sign-in");

    // Header menu.
    const main = page.getByRole("navigation", { name: "Main" });
    for (const name of [
      "Solutions",
      "Travel Technology",
      "Services",
      "Case Studies",
      "About",
    ]) {
      await expect(main.getByRole("link", { name, exact: true })).toBeVisible();
    }
    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "Get a quote" }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: "Book a demo" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();

    // Services dropdown: opens with the keyboard, Escape closes it.
    const services = main.getByRole("link", { name: "Services", exact: true });
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await services.focus();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await expect(
      main.getByRole("link", { name: /Website development/ }),
    ).toHaveAttribute("href", "/services/website-development");
    await expect(
      main.getByRole("link", { name: /UI\/UX design/ }),
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: /API integrations/ }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(services).toHaveAttribute("aria-expanded", "false");

    // Footer, with the Clients column.
    const clients = page.getByRole("navigation", { name: "Clients" });
    await expect(
      clients.getByRole("link", { name: "Open my invitation" }),
    ).toHaveAttribute("href", "/portal/invitation");
    await expect(page.getByRole("contentinfo")).toContainText(
      "© 2026 FlyConnect Tech. All rights reserved.",
    );

    // The old working name must not appear anywhere.
    await expect(page.locator("body")).not.toContainText("Northstack");
    await expectNoSidewaysScroll(page);
  });

  test("the menu does not wrap at the narrowest desktop width", async ({
    page,
  }) => {
    // The full menu shows from 1360px (1366px laptops and wider).
    await page.setViewportSize({ width: 1360, height: 800 });
    await page.goto("/");

    const main = page.getByRole("navigation", { name: "Main" });
    await expect(main).toBeVisible();
    const link = await main
      .getByRole("link", { name: "Travel Technology" })
      .boundingBox();
    // One line of text inside the 76px header.
    expect(link!.height).toBeLessThanOrEqual(76);
    await expectNoSidewaysScroll(page);
  });

  test("phone: menu button, two buttons under the header, keyboard", async ({
    page,
  }) => {
    await page.setViewportSize(phone);
    await page.goto("/");

    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();
    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "Get a quote" }),
    ).toBeVisible();
    await expect(
      header.getByRole("button", { name: "Book a demo" }),
    ).toBeVisible();

    const open = page.getByRole("button", { name: "Open menu" });
    await expect(open).toHaveAttribute("aria-expanded", "false");
    await open.click();

    const menu = page.getByRole("navigation", { name: "Menu" });
    await expect(menu).toBeVisible();
    for (const name of [
      "Home",
      "Solutions",
      "Travel Technology",
      "Services",
      "Website development",
      "UI/UX design",
      "API integrations",
      "Case Studies",
      "About",
      "Contact",
      "Support",
      "Client login",
    ]) {
      await expect(menu.getByRole("link", { name, exact: true })).toBeVisible();
    }
    await expect(menu.getByRole("link", { name: "Home" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    // Escape closes the menu and puts the keyboard back on the button.
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expectNoSidewaysScroll(page);
  });
});

/** Opens a page signed in as a fresh person of this role. */
async function signedInAs(page: Page, role: Role) {
  const person = await createPerson(role);
  await signInBrowser(page.context(), person);
  return person;
}

test.describe("client portal layout", () => {
  test("desktop: sidebar, header and the active menu item", async ({
    page,
  }) => {
    const customer = await signedInAs(page, "customer");
    await page.setViewportSize(desktop);
    await page.goto("/portal");

    const nav = page.getByRole("navigation", { name: "Customer" });
    await expect(nav.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: /My Requests/ })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: /Notifications/ }),
    ).toBeVisible();
    await expect(
      nav.getByRole("link", { name: "Profile Settings" }),
    ).toBeVisible();

    const sidebar = page.getByRole("complementary", {
      name: "Client portal menu",
    });
    await expect(sidebar).toContainText("Client portal");
    // The real signed-in customer and company, not sample names.
    await expect(sidebar).toContainText(customer.name);
    await expect(sidebar).toContainText("E2E Travel Ltd");
    await expect(
      sidebar.getByRole("link", { name: "Create support request" }),
    ).toHaveAttribute("href", "/portal/requests/new");
    await expect(
      sidebar.getByRole("link", { name: "Visit website" }),
    ).toBeVisible();
    await expect(sidebar.getByRole("button", { name: "Logout" })).toBeVisible();

    await expect(
      page.getByRole("searchbox", { name: "Search requests" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expectNoSidewaysScroll(page);
  });

  test("phone: the sidebar slides in and Escape closes it", async ({
    page,
  }) => {
    await signedInAs(page, "customer");
    await page.setViewportSize(phone);
    await page.goto("/portal");

    const sidebar = page.getByRole("complementary", {
      name: "Client portal menu",
    });
    await expect(sidebar).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Overview" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();

    // A tap outside closes it too.
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(sidebar).toBeVisible();
    await page
      .getByRole("button", { name: "Close menu" })
      .click({ position: { x: 360, y: 400 } });
    await expect(sidebar).toBeHidden();
    await expectNoSidewaysScroll(page);
  });
});

test.describe("team panel layout", () => {
  test("super admin sees every section, including Settings", async ({
    page,
  }) => {
    const superAdmin = await signedInAs(page, "super-admin");
    await page.setViewportSize(desktop);
    await page.goto("/team");

    const nav = page.getByRole("navigation", { name: "Team" });
    await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    for (const heading of ["SUPPORT REQUESTS", "WEBSITE", "MANAGE"]) {
      await expect(nav.getByText(heading, { exact: true })).toBeVisible();
    }
    for (const name of [
      /New requests/,
      /Demo requests/,
      /Customers/,
      /Users/,
      /Reports & Analytics/,
      /Settings/,
    ]) {
      await expect(nav.getByRole("link", { name })).toBeVisible();
    }

    const header = page.getByRole("banner");
    await expect(header).toContainText(superAdmin.name);
    await expect(header).toContainText("Super admin · Tester");
    await expectNoSidewaysScroll(page);
  });

  test("developer sees only their own requests", async ({ page }) => {
    await signedInAs(page, "developer");
    await page.setViewportSize(desktop);
    await page.goto("/team");

    const nav = page.getByRole("navigation", { name: "Team" });
    await expect(nav.getByText("MY REQUESTS", { exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: /All requests/ })).toBeVisible();
    await expect(
      nav.getByRole("link", { name: /Notifications/ }),
    ).toBeVisible();

    await expect(nav.getByText("WEBSITE", { exact: true })).toHaveCount(0);
    await expect(nav.getByText("MANAGE", { exact: true })).toHaveCount(0);
    for (const name of [
      /New requests/,
      /Demo requests/,
      /Customers/,
      /Users/,
      /Reports/,
      /Settings/,
    ]) {
      await expect(nav.getByRole("link", { name })).toHaveCount(0);
    }

    await expect(page.getByRole("banner")).toContainText("Developer · Tester");
  });

  test("phone: the navy sidebar slides in and Escape closes it", async ({
    page,
  }) => {
    await signedInAs(page, "manager");
    await page.setViewportSize(phone);
    await page.goto("/team");

    const sidebar = page.getByRole("complementary", {
      name: "Team panel menu",
    });
    await expect(sidebar).toBeHidden();

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(sidebar).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expectNoSidewaysScroll(page);
  });
});

test.describe("components page (development only)", () => {
  test("dialog opens, traps the keyboard and closes; toast shows", async ({
    page,
  }) => {
    await page.setViewportSize(desktop);
    await page.goto("/dev/components");

    await expect(
      page.getByRole("heading", { level: 1, name: "Components" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Assign developer" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Open dialog" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Show toast" }).click();
    // The visible toast, and the copy that screen readers announce.
    await expect(page.locator('[data-slot="toast"]')).toHaveText(
      "Settings saved",
    );
    await expect(page.getByRole("status")).toContainText("Settings saved");
  });

  test("tabs and chips work with the keyboard", async ({ page }) => {
    await page.setViewportSize(desktop);
    await page.goto("/dev/components");

    const tabs = page.getByRole("tablist", { name: "Requests" });
    await tabs.getByRole("tab", { name: /All/ }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: /New/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByText("New requests would show here.")).toBeVisible();

    const priority = page.getByRole("radiogroup", { name: "Priority" });
    await priority.getByRole("radio", { name: "Medium" }).focus();
    // Hold the key, as a person does: the choice follows the keyboard focus.
    await page.keyboard.down("ArrowRight");
    await expect(priority.getByRole("radio", { name: "High" })).toBeFocused();
    await page.keyboard.up("ArrowRight");
    await expect(priority.getByRole("radio", { name: "High" })).toBeChecked();
  });

  test("phone: the table becomes cards and nothing scrolls sideways", async ({
    page,
  }) => {
    await page.setViewportSize(phone);
    await page.goto("/dev/components");

    await expect(
      page.getByRole("table", { name: "Support requests" }),
    ).toBeHidden();
    const cards = page.getByRole("list", { name: "Support requests" });
    await expect(cards.getByRole("listitem")).toHaveCount(3);
    await expectNoSidewaysScroll(page);
  });
});
