import { Suspense } from "react";
import type { Metadata } from "next";

import {
  AuthHeading,
  AuthLead,
  AuthSplit,
} from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

/** Forgot password for customers (screen 04). */
export default function PortalForgotPasswordPage() {
  return (
    <AuthSplit>
      {/* Already signed in: straight to their own area. */}
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthHeading>Forgot your password?</AuthHeading>
      <AuthLead>
        Enter your account email and we will send you a secure link to choose a
        new password.
      </AuthLead>
      <ForgotPasswordForm area="portal" />
    </AuthSplit>
  );
}
