import { expect, test, type Page } from "@playwright/test";

const desktop = { width: 1440, height: 900 };
const phone = { width: 390, height: 844 };

const pages = [
  { path: "/", title: "FlyConnect Tech", h1: /Your Business Idea/ },
  {
    path: "/solutions",
    title: "Products & Solutions · FlyConnect Tech",
    h1: /Everything you need to launch/,
  },
  {
    path: "/travel-technology",
    title: "Travel Technology · FlyConnect Tech",
    h1: /booking platforms that sell/,
  },
  {
    path: "/services",
    title: "Services · FlyConnect Tech",
    h1: /Design, development and integration/,
  },
  {
    path: "/services/website-development",
    title: "Website Development · FlyConnect Tech",
    h1: /From a fast website/,
  },
  {
    path: "/services/ui-ux-design",
    title: "UI/UX Design · FlyConnect Tech",
    h1: /See it, click it, approve it/,
  },
  {
    path: "/services/api-integrations",
    title: "API Integrations · FlyConnect Tech",
    h1: /Connect the systems/,
  },
  {
    path: "/case-studies",
    title: "Case Studies · FlyConnect Tech",
    h1: /FlyConnect: a complete travel booking platform/,
  },
  {
    path: "/about",
    title: "About Us · FlyConnect Tech",
    h1: /A technology partner/,
  },
  {
    path: "/contact",
    title: "Contact & Quote · FlyConnect Tech",
    h1: /Tell us about/,
  },
  {
    path: "/support",
    title: "Support · FlyConnect Tech",
    h1: /Help for the projects/,
  },
];

async function expectNoSidewaysScroll(page: Page) {
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflows).toBe(false);
}

test.describe("the 11 website pages", () => {
  for (const info of pages) {
    test(`${info.path} opens with its title, heading and description`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));

      await page.setViewportSize(desktop);
      const response = await page.goto(info.path);
      expect(response?.status()).toBe(200);

      await expect(page).toHaveTitle(info.title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(
        page.getByRole("heading", { level: 1, name: info.h1 }),
      ).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.{40,}/,
      );
      // The design's working name never shows.
      await expect(page.locator("body")).not.toContainText("Northstack");
      expect(errors).toEqual([]);
    });

    test(`${info.path} fits a phone screen`, async ({ page }) => {
      await page.setViewportSize(phone);
      await page.goto(info.path);
      await expect(
        page.getByRole("heading", { level: 1, name: info.h1 }),
      ).toBeVisible();
      await expectNoSidewaysScroll(page);
    });
  }
});

test("FAQ: the first answer is open, and only one is open at a time", async ({
  page,
}) => {
  // Home has no FAQ any more; the Support page keeps one.
  await page.goto("/support");
  const faq = page.locator("#faq");
  const first = faq.getByRole("button", { name: "How do I get an account?" });
  const second = faq.getByRole("button", {
    name: "I cannot find my invitation email",
  });

  await expect(first).toHaveAttribute("aria-expanded", "true");
  await expect(second).toHaveAttribute("aria-expanded", "false");
  await expect(faq.getByText(/Our team creates it/)).toBeVisible();

  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "true");
  await expect(first).toHaveAttribute("aria-expanded", "false");
  await expect(faq.getByText(/Check your spam folder first/)).toBeVisible();
  await expect(faq.getByText(/Our team creates it/)).toBeHidden();

  // Clicking an open question closes it.
  await second.click();
  await expect(second).toHaveAttribute("aria-expanded", "false");
});

test.describe("Get a quote", () => {
  test("Home: the short form shows the design's errors, then sends", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.locator("#quote");
    const submit = card.getByRole("button", { name: "Request my quote" });

    // The short form has no timeline, company or phone.
    await expect(card.getByLabel("Timeline")).toHaveCount(0);

    await submit.click();
    await expect(card.getByText("Enter your name")).toBeVisible();
    await expect(card.getByText("Enter a valid work email")).toBeVisible();
    await expect(
      card.getByText("Tell us a little about your project"),
    ).toBeVisible();
    await expect(card.getByRole("alert")).toHaveText(
      "Please fix the highlighted fields.",
    );
    await expect(card.getByLabel("Full name *")).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    await card
      .getByLabel("Project type")
      .selectOption({ label: "New website" });
    await card.getByLabel("Budget range").selectOption({ label: "£5k – £15k" });
    await card.getByLabel("Full name *").fill("Sarah Mitchell");
    await card.getByLabel("Work email *").fill("sarah@bluewave.co.uk");
    await card.getByLabel("Requirements *").fill("A new booking website.");
    await submit.click();

    const done = card.getByRole("status");
    await expect(done).toContainText("Thanks, Sarah. Your request is in.");
    await expect(done).toContainText("sarah@bluewave.co.uk");
    await expect(done).toContainText("New website");
    await expect(done).toContainText("£5k – £15k");

    await card.getByRole("button", { name: "Send another request" }).click();
    await expect(card.getByLabel("Full name *")).toHaveValue("");
  });

  test("Contact: the full form has timeline, company and phone", async ({
    page,
  }) => {
    await page.goto("/contact");
    const tabs = page.getByRole("tablist", { name: "Contact options" });
    await expect(
      tabs.getByRole("tab", { name: "Get a quote" }),
    ).toHaveAttribute("aria-selected", "true");

    const form = page.getByRole("form", { name: "Get a quote" });
    await form
      .getByLabel("Timeline")
      .selectOption({ label: "Within 1–3 months" });
    await form.getByLabel("Full name *").fill("James Carter");
    await form.getByLabel("Work email *").fill("james@northgate.travel");
    await form.getByLabel("Company (optional)").fill("Northgate Tours");
    await form.getByLabel("Phone (optional)").fill("+44 20 7946 0000");
    await form.getByLabel("Requirements *").fill("Amadeus search on our site.");
    await form.getByRole("button", { name: "Request my quote" }).click();

    const done = page
      .getByRole("status")
      .filter({ hasText: "Your request is in" });
    await expect(done).toContainText("Thanks, James.");
    await expect(done).toContainText("Within 1–3 months");
    await expect(done).toContainText("Northgate Tours");
  });
});

test("Contact: Send a message shows its errors, then sends", async ({
  page,
}) => {
  await page.goto("/contact");
  await page
    .getByRole("tablist", { name: "Contact options" })
    .getByRole("tab", { name: "Send a message" })
    .click();

  const form = page.getByRole("form", { name: "Send a message" });
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form.getByText("Enter your name")).toBeVisible();
  await expect(form.getByText("Enter a valid email")).toBeVisible();
  await expect(form.getByText("Write a short message")).toBeVisible();

  await form.getByLabel("Topic").selectOption({ label: "Partnership" });
  await form.getByLabel("Full name *").fill("Laura Bennett");
  await form.getByLabel("Email *").fill("laura@example.com");
  await form.getByLabel("Message *").fill("Can we talk about a partnership?");
  await form.getByRole("button", { name: "Send message" }).click();

  const done = page.getByRole("status").filter({ hasText: "Message sent" });
  await expect(done).toContainText("Thanks, Laura.");
  await expect(done).toContainText("laura@example.com");
});

test.describe("Book a demo", () => {
  test("all three steps, the errors and the confirmation", async ({ page }) => {
    await page.goto("/services");
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Book a demo" })
      .click();

    const dialog = page.getByRole("dialog", { name: "Book a demo" });
    await expect(dialog).toBeVisible();

    // Step 1: what to see.
    await dialog.getByRole("button", { name: "Continue" }).click();
    await expect(dialog.getByRole("alert")).toHaveText(
      "Choose what you’d like to see.",
    );
    await dialog.getByRole("radio", { name: /API and integrations/ }).click();
    await dialog.getByRole("button", { name: "Continue" }).click();

    // Step 2: 10 weekdays, 6 times each.
    await expect(
      dialog.getByRole("radiogroup", { name: "Pick a day" }).getByRole("radio"),
    ).toHaveCount(10);
    await dialog.getByRole("button", { name: "Continue" }).click();
    await expect(dialog.getByRole("alert")).toHaveText(
      "Pick an available time to continue.",
    );
    await dialog.getByRole("radio", { name: "14:00" }).click();
    await dialog.getByRole("button", { name: "Continue" }).click();

    // Step 3: your details.
    await expect(dialog.getByText(/14:00 UK time/)).toBeVisible();
    await dialog.getByRole("button", { name: "Request demo" }).click();
    await expect(dialog.getByText("Enter your name")).toBeVisible();
    await expect(dialog.getByText("Enter a valid work email")).toBeVisible();
    await expect(dialog.getByText("Enter your company name")).toBeVisible();

    await dialog.getByLabel("Full name *").fill("Olivia Grant");
    await dialog.getByLabel("Work email *").fill("olivia@skyhaven.travel");
    await dialog.getByLabel("Company *").fill("Skyhaven Travel");
    await dialog.getByRole("button", { name: "Request demo" }).click();

    // Confirmation.
    const done = dialog.getByRole("status");
    await expect(done).toContainText("Demo requested");
    await expect(done).toContainText("Thanks, Olivia.");
    await expect(done).toContainText("olivia@skyhaven.travel");
    await expect(done).toContainText("API and integrations");
    await expect(done).toContainText("14:00 UK time");
    await expect(done).toContainText("Video call · 30 minutes");

    // Done closes it, and the next visit starts again from step 1.
    await dialog.getByRole("button", { name: "Done" }).click();
    await expect(dialog).toBeHidden();
    await page
      .getByRole("banner")
      .getByRole("button", { name: "Book a demo" })
      .click();
    await expect(dialog.getByText("What would you like to see?")).toBeVisible();
  });

  test("closing part-way keeps the choices; Escape closes it", async ({
    page,
  }) => {
    await page.goto("/");
    const open = page
      .getByRole("banner")
      .getByRole("button", { name: "Book a demo" });
    // Opened from the keyboard: focus going back to the button is for
    // keyboard users (Safari does not focus a button that is clicked).
    await open.focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Book a demo" });
    await dialog
      .getByRole("radio", { name: /Travel booking platform/ })
      .click();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();

    await open.click();
    await expect(
      dialog.getByRole("radio", { name: /Travel booking platform/ }),
    ).toBeChecked();
  });

  test("buttons inside the pages open it too", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Pick a time" }).click();
    await expect(
      page.getByRole("dialog", { name: "Book a demo" }),
    ).toBeVisible();
  });
});

test("the footer's Privacy, Terms and Cookies links open their pages", async ({
  page,
}) => {
  await page.goto("/");
  const legal = page.getByRole("navigation", { name: "Legal" });
  for (const [link, heading] of [
    ["Privacy", "Privacy policy"],
    ["Terms", "Terms of use"],
    ["Cookies", "Cookie policy"],
  ]) {
    await legal.getByRole("link", { name: link }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: heading }),
    ).toBeVisible();
  }
});

test("the footer's Legal and Ownership column opens the legal entity page", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Legal and Ownership" })
    .getByRole("link", { name: "Legal Entity and Ownership" })
    .click();
  // The test server builds a page on its first visit: allow it time.
  await expect(page).toHaveURL(/\/legal-entity-and-ownership$/, {
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", { level: 1, name: "Legal Entity and Ownership" }),
  ).toBeVisible();
  await expect(page.getByText(/company registration number/)).toContainText(
    "16152024",
  );
});

test("sitemap.xml lists the 15 pages and robots.txt keeps out private areas", async ({
  request,
}) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g)).toHaveLength(15);
  expect(sitemap).toContain("/legal-entity-and-ownership</loc>");
  expect(sitemap).toContain("/services/ui-ux-design</loc>");
  expect(sitemap).toContain("/privacy</loc>");
  expect(sitemap).not.toContain("/portal");

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /portal");
  expect(robots).toContain("Disallow: /team");
  expect(robots).toContain("Sitemap:");
});
