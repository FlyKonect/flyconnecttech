import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { TeamAuthCard } from "@/components/auth/auth-layouts";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { getMe, homeFor } from "@/lib/auth/server";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Set up two-factor sign-in",
  robots: { index: false, follow: false },
};

/** Two-factor setup for team members who have not set it up yet. */
export default function TwoFactorPage() {
  return (
    <TeamAuthCard>
      <Suspense>
        <TwoFactorGate />
      </Suspense>
    </TeamAuthCard>
  );
}

async function TwoFactorGate() {
  const me = await getMe();
  if (!me) redirect(routes.teamSignIn);
  if (me.area !== "team" || me.twoFactorEnabled) redirect(homeFor(me));
  return <TwoFactorSetup name={me.name} />;
}
