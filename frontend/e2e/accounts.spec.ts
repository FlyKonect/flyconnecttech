import { expect, test, type Page } from "@playwright/test";

import {
  createPerson,
  inviteWithCommand,
  PASSWORD,
  signInBrowser,
  uniqueEmail,
} from "./support/accounts";
import { linkIn, waitForEmail } from "./support/mailpit";
import { totp } from "./support/totp";

/** A visible form field by its label (pages left behind stay hidden in the page). */
const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true }).filter({ visible: true });

/** Our own error message above a form button (not Next.js's route announcer). */
const formError = (page: Page) =>
  page.locator("[data-slot=form-error]").filter({ visible: true });

// The account journeys through the real screens (docs/01, section 3),
// with the real emails read from Mailpit.

test.describe("invitations", () => {
  test("a customer opens the email, sets a password, signs in and out", async ({
    page,
  }) => {
    const email = uniqueEmail("sarah");
    inviteWithCommand({
      role: "customer",
      name: "Sarah Mitchell",
      email,
      company: "Bluewave Holidays",
    });

    // The invitation email.
    const invitation = await waitForEmail(email);
    expect(invitation.subject).toBe(
      "Your FlyConnect Tech support account is ready",
    );
    expect(invitation.text).toContain("Bluewave Holidays");
    const link = linkIn(invitation, "/invite/");

    // Set your password (screen 03).
    await page.goto(new URL(link).pathname);
    await expect(page.getByText("Email verified")).toBeVisible();
    await expect(page.getByText(`Last step for ${email}`)).toBeVisible();
    await expect(
      page.getByText(
        "Company: Bluewave Holidays · set by the FlyConnect Tech team",
      ),
    ).toBeVisible();
    await expect(field(page, "Full name")).toHaveValue("Sarah Mitchell");

    // A weak password is refused before anything is sent.
    await field(page, "New password").fill("short");
    await field(page, "Confirm password").fill("short");
    await page.getByRole("button", { name: "Activate account" }).click();
    await expect(formError(page)).toHaveText(
      "Please fix the highlighted fields.",
    );

    await field(page, "Phone (optional)").fill("+44 20 7946 0321");
    await field(page, "New password").fill(PASSWORD);
    await field(page, "Confirm password").fill(PASSWORD);
    const rules = page.getByRole("list", { name: "Password rules" });
    await expect(rules.getByText(/not met yet/)).toHaveCount(0);
    await page.getByRole("button", { name: "Activate account" }).click();

    // Sign in (screen 01).
    await expect(page).toHaveURL(/\/portal\/sign-in\?activated=1$/);
    await expect(page.getByRole("status")).toContainText(
      "Your account is active",
    );
    await field(page, "Email address").fill(email);
    await field(page, "Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/portal$/);
    const sidebar = page.getByRole("complementary", {
      name: "Client portal menu",
    });
    await expect(sidebar).toContainText("Sarah Mitchell");
    await expect(sidebar).toContainText("Bluewave Holidays");

    // Signed in, the invitation link just leads to the portal.
    await page.goto(new URL(link).pathname);
    await expect(page).toHaveURL(/\/portal$/);

    // Sign out: back to customer sign in, and the portal is closed again.
    await page.getByRole("button", { name: /^Account menu/ }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/portal\/sign-in$/);
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal\/sign-in$/);

    // Signed out, the link works only once.
    await page.goto(new URL(link).pathname);
    await expect(
      page.getByRole("heading", { name: "This link no longer works" }),
    ).toBeVisible();
  });

  test("a team member sets a password, then sets up two-factor before getting in", async ({
    page,
  }) => {
    test.slow();
    const email = uniqueEmail("dev");
    inviteWithCommand({
      role: "developer",
      name: "Daniyal Ahmed",
      email,
      jobTitle: "Integration engineer",
    });
    const invitation = await waitForEmail(email);
    expect(invitation.subject).toBe(
      "Your FlyConnect Tech team account is ready",
    );
    expect(invitation.text).toContain("as Developer");

    await page.goto(new URL(linkIn(invitation, "/invite/")).pathname);
    await expect(
      page.getByText("Role: Developer · set by the FlyConnect Tech team"),
    ).toBeVisible();
    await field(page, "New password").fill(PASSWORD);
    await field(page, "Confirm password").fill(PASSWORD);
    await page.getByRole("button", { name: "Activate account" }).click();

    // First team sign in: no code yet, so the setup comes next.
    await expect(page).toHaveURL(/\/team\/sign-in\?activated=1$/);
    await field(page, "Work email").fill(email);
    await field(page, "Password").fill(PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/\/team\/two-factor$/);

    // The team panel stays closed until two-factor is on.
    await page.goto("/team");
    await expect(page).toHaveURL(/\/team\/two-factor$/);

    // Set up the authenticator app.
    await field(page, "Confirm your password").fill(PASSWORD);
    await page.getByRole("button", { name: "Continue" }).click();
    const secret = (await page.getByTestId("totp-secret").textContent())!;
    await field(page, "6-digit code").fill("000000");
    await page.getByRole("button", { name: "Turn on two-factor" }).click();
    await expect(formError(page)).toContainText("That code is not right");
    await field(page, "6-digit code").fill(totp(secret));
    await page.getByRole("button", { name: "Turn on two-factor" }).click();
    await expect(page.getByText("Two-factor sign-in is on.")).toBeVisible();
    const backupCode = (await page
      .getByRole("list", { name: "Backup codes" })
      .getByRole("listitem")
      .first()
      .textContent())!.trim();
    await page
      .getByRole("button", { name: "I have saved them. Continue" })
      .click();

    // In: the developer's menu.
    await expect(page).toHaveURL(/\/team$/);
    const nav = page.getByRole("navigation", { name: "Team" });
    await expect(nav.getByText("MY REQUESTS", { exact: true })).toBeVisible();
    await expect(page.getByRole("banner")).toContainText(
      "Developer · Integration engineer",
    );

    // Sign out, then sign in again: the code has a step of its own.
    const signOut = async () => {
      const logout = page.getByRole("menuitem", { name: "Logout" });
      // A click before the page is ready does nothing: try until it opens.
      await expect(async () => {
        await page.getByRole("button", { name: /^Account menu/ }).click();
        await expect(logout).toBeVisible({ timeout: 2_000 });
      }).toPass();
      await logout.click();
      await expect(page).toHaveURL(/\/team\/sign-in$/);
    };
    const passwordStep = async () => {
      await field(page, "Work email").fill(email);
      await field(page, "Password").fill(PASSWORD);
      await page.getByRole("button", { name: "Continue" }).click();
      await expect(
        page.getByRole("heading", { name: "Enter your code" }),
      ).toBeVisible();
      await expect(page.getByText(`Signing in as ${email}`)).toBeVisible();
    };
    await signOut();
    await passwordStep();
    // Pressing the button with no code says what is missing.
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(formError(page)).toHaveText(
      "Enter the 6-digit code from your authenticator app.",
    );
    // A wrong code is refused and the box empties for the next try.
    await field(page, "6-digit code").fill("000000");
    await expect(formError(page)).toContainText("That code is not right");
    await expect(field(page, "6-digit code")).toHaveValue("");
    // The right code signs in as soon as the sixth digit is typed.
    await field(page, "6-digit code").fill(totp(secret));
    await expect(page).toHaveURL(/\/team$/);

    // No phone: a backup code works instead, once.
    await signOut();
    await passwordStep();
    await page
      .getByRole("button", { name: "Use a backup code instead" })
      .click();
    await field(page, "Backup code").fill(backupCode);
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page).toHaveURL(/\/team$/);

    await signOut();
    await passwordStep();
    await page
      .getByRole("button", { name: "Use a backup code instead" })
      .click();
    await field(page, "Backup code").fill(backupCode);
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(formError(page)).toHaveText(
      "That backup code is not right, or it has been used already.",
    );

    // Start again goes back to the password, with the email kept.
    await page.getByRole("button", { name: "Start again" }).click();
    await expect(field(page, "Work email")).toHaveValue(email);
    await expect(field(page, "Password")).toHaveValue("");
  });
});

test("forgot password: the emailed link sets a new password", async ({
  page,
}) => {
  const customer = await createPerson("customer");

  await page.goto("/portal/forgot-password");
  await field(page, "Email address").fill(customer.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText(
    `If there is an account for ${customer.email}`,
  );

  const email = await waitForEmail(customer.email, /Reset your/);
  const link = linkIn(email, "/reset-password/");
  await page.goto(new URL(link).pathname);
  await expect(
    page.getByText(`For ${customer.email}`).filter({ visible: true }),
  ).toBeVisible();
  await field(page, "New password").fill("Harbour-Light-9");
  await field(page, "Confirm new password").fill("Harbour-Light-9");
  await page.getByRole("button", { name: "Update password" }).click();

  await expect(page).toHaveURL(/\/portal\/sign-in\?reset=1$/);
  await field(page, "Email address").fill(customer.email);
  await field(page, "Password").fill("Harbour-Light-9");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/portal$/);
});

test("forgot password says the same for an email with no account", async ({
  page,
}) => {
  const nobody = uniqueEmail("nobody");
  await page.goto("/team/forgot-password");
  await field(page, "Email address").fill(nobody);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText(
    `If there is an account for ${nobody}`,
  );
});

test("a wrong password is refused without saying which part was wrong", async ({
  page,
}) => {
  const customer = await createPerson("customer");
  await page.goto("/portal/sign-in");
  await field(page, "Email address").fill(customer.email);
  await field(page, "Password").fill("Not-the-password-1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(formError(page)).toHaveText(
    "The email or password is not right.",
  );
});

test.describe("each person lands in their own area", () => {
  test("signed out: the portal and team panel send you to sign in", async ({
    page,
  }) => {
    await page.goto("/portal/requests");
    await expect(page).toHaveURL(/\/portal\/sign-in$/);
    await page.goto("/team/requests");
    await expect(page).toHaveURL(/\/team\/sign-in$/);
  });

  test("a customer who opens the team panel is sent to the portal", async ({
    page,
  }) => {
    await signInBrowser(page.context(), await createPerson("customer"));
    await page.goto("/team");
    await expect(page).toHaveURL(/\/portal$/);
    // Signed in already: the sign-in page goes straight to the portal.
    await page.goto("/portal/sign-in");
    await expect(page).toHaveURL(/\/portal$/);
  });

  test("a team member who opens the portal is sent to the team panel", async ({
    page,
  }) => {
    await signInBrowser(page.context(), await createPerson("admin"));
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/team$/);
  });
});
