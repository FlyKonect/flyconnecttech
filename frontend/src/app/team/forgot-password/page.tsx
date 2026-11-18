import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthHeading, TeamAuthCard } from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

/** Forgot password for the team, in the team sign-in style. */
export default function TeamForgotPasswordPage() {
  return (
    <TeamAuthCard>
      {/* Already signed in: straight to their own area. */}
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthHeading size="card">Forgot your password?</AuthHeading>
      <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
        Enter your work email and we will send you a secure link to choose a new
        password.
      </p>
      <ForgotPasswordForm area="team" />
    </TeamAuthCard>
  );
}
