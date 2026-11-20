import { Suspense } from "react";
import type { Metadata } from "next";

import { TeamAuthCard } from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import {
  TeamSignInForm,
  TeamSignInHeading,
} from "@/components/auth/team-sign-in-form";

export const metadata: Metadata = {
  title: "Team sign in",
  robots: { index: false, follow: false },
};

/**
 * Team sign in (screen 16), in two steps: email and password, then the
 * two-factor code on its own screen. The form shows each step's heading.
 */
export default function TeamSignInPage() {
  return (
    <TeamAuthCard>
      <Suspense fallback={<TeamSignInHeading />}>
        <RedirectIfSignedIn />
        <TeamSignInForm />
      </Suspense>
    </TeamAuthCard>
  );
}
