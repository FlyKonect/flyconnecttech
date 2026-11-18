import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ChangePasswordCard,
  ProfileForm,
} from "@/components/portal/profile-forms";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { TeamProfile } from "@/lib/team/types";
import { timeZoneOptions } from "@/lib/time-zones";

export const metadata: Metadata = { title: "Profile settings" };

/** A team member's own Profile settings and Change password. */
async function TeamProfileContent() {
  const profile = await serverApi<TeamProfile>("/team/profile", {
    signIn: routes.teamSignIn,
  });
  return (
    <div className="flex flex-wrap items-start gap-5">
      <ProfileForm
        area="team"
        profile={profile}
        timeZones={timeZoneOptions(profile.timezone)}
      />
      <ChangePasswordCard />
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamProfilePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamProfileContent />
    </Suspense>
  );
}
