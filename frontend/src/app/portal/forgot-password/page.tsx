import type { Metadata } from "next";

import {
  AuthHeading,
  AuthLead,
  AuthSplit,
} from "@/components/auth/auth-layouts";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  robots: { index: false, follow: false },
};

/** Forgot password for customers (screen 04). */
export default function PortalForgotPasswordPage() {
  return (
    <AuthSplit>
      <AuthHeading>Forgot your password?</AuthHeading>
      <AuthLead>
        Enter your account email and we will send you a secure link to choose a
        new password.
      </AuthLead>
      <ForgotPasswordForm area="portal" />
    </AuthSplit>
  );
}
