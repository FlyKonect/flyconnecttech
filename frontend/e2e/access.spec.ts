import { expect, test, type Page } from "@playwright/test";

import { createPerson, signInBrowser, type Role } from "./support/accounts";

// Who reaches which page (docs/01 §4, backend/src/policies/policies.ts).
// Each address either opens, shows "not found", or sends the person to the
// right place. The backend makes the real decision; this checks the screens
// follow it.

test.describe.configure({ timeout: 120_000 });

type Outcome = "opens" | "not found" | `goes to ${string}`;

const PAGES = [
  "/portal",
  "/portal/requests",
  "/team",
  "/team/requests",
  "/team/notifications",
  "/team/customers",
  "/team/customers/new",
  "/team/users",
  "/team/users/new",
  "/team/leads/demos",
  "/team/leads/quotes",
  "/team/leads/messages",
  "/team/reports",
  "/team/settings",
] as const;

type Page_ = (typeof PAGES)[number];

/** What happens when this person opens the address. */
async function outcome(page: Page, path: string): Promise<Outcome> {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  const where = new URL(page.url()).pathname;
  if (where !== path) return `goes to ${where}`;
  const missing = page.getByRole("heading", {
    name: "This page could not be found.",
  });
  return (await missing.count()) ? "not found" : "opens";
}

/** Every page opens except the ones listed. */
function expected(
  rules: Partial<Record<Page_, Outcome>>,
  rest: Outcome = "opens",
): Record<Page_, Outcome> {
  return Object.fromEntries(
    PAGES.map((path) => [path, rules[path] ?? rest]),
  ) as Record<Page_, Outcome>;
}

async function check(page: Page, want: Record<Page_, Outcome>) {
  const got: Record<string, Outcome> = {};
  for (const path of PAGES) got[path] = await outcome(page, path);
  expect(got).toEqual(want);
}

const teamOnly = {
  "/portal": "goes to /team",
  "/portal/requests": "goes to /team",
} as const;

test("signed out: every page asks you to sign in", async ({ page }) => {
  await check(
    page,
    expected(
      {
        "/portal": "goes to /portal/sign-in",
        "/portal/requests": "goes to /portal/sign-in",
      },
      "goes to /team/sign-in",
    ),
  );
});

const cases: [Role, Partial<Record<Page_, Outcome>>, Outcome?][] = [
  [
    "customer",
    { "/portal": "opens", "/portal/requests": "opens" },
    "goes to /portal",
  ],
  [
    "developer",
    {
      ...teamOnly,
      "/team/customers": "not found",
      "/team/customers/new": "not found",
      "/team/users": "not found",
      "/team/users/new": "not found",
      "/team/leads/demos": "not found",
      "/team/leads/quotes": "not found",
      "/team/leads/messages": "not found",
      "/team/reports": "not found",
      "/team/settings": "not found",
    },
  ],
  [
    "manager",
    {
      ...teamOnly,
      "/team/customers/new": "not found",
      "/team/users": "not found",
      "/team/users/new": "not found",
      "/team/settings": "not found",
    },
  ],
  ["admin", { ...teamOnly, "/team/settings": "not found" }],
  ["super-admin", { ...teamOnly }],
];

for (const [role, rules, rest] of cases) {
  test(`${role}: reaches only their own pages`, async ({ page }) => {
    await signInBrowser(page.context(), await createPerson(role));
    await check(page, expected(rules, rest));
  });
}
