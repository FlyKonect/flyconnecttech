import { Suspense } from "react";
import type { Metadata } from "next";

import {
  AuthHeading,
  AuthLead,
  AuthSplit,
} from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/** Customer sign in (screen 01). */
export default function PortalSignInPage() {
  return (
    <AuthSplit>
      <AuthHeading>Welcome back</AuthHeading>
      <AuthLead>Sign in to send and track your support requests.</AuthLead>
      <Suspense>
        <RedirectIfSignedIn />
        <SignInForm />
      </Suspense>
    </AuthSplit>
  );
}
