import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthHeading, TeamAuthCard } from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { TeamSignInForm } from "@/components/auth/team-sign-in-form";

export const metadata: Metadata = {
  title: "Team sign in",
  robots: { index: false, follow: false },
};

/** Team sign in (screen 16). */
export default function TeamSignInPage() {
  return (
    <TeamAuthCard>
      <AuthHeading size="card">Team sign in</AuthHeading>
      <p className="mt-2 text-[15px] text-muted-foreground">
        For super admins, admins, managers and developers.
      </p>
      <Suspense>
        <RedirectIfSignedIn />
        <TeamSignInForm />
      </Suspense>
    </TeamAuthCard>
  );
}
