import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ChangePasswordCard,
  ProfileForm,
} from "@/components/portal/profile-forms";
import { serverApi } from "@/lib/api-server";
import type { Profile } from "@/lib/portal/types";
import { timeZoneOptions } from "@/lib/time-zones";

export const metadata: Metadata = { title: "Profile Settings" };

/** Profile Settings (screen 15). */
async function ProfileSettingsPageContent() {
  const profile = await serverApi<Profile>("/portal/profile");
  return (
    <div className="flex flex-wrap items-start gap-5">
      <ProfileForm
        area="portal"
        profile={profile}
        timeZones={timeZoneOptions(profile.timezone)}
      />
      <ChangePasswordCard />
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProfileSettingsPageContent />
    </Suspense>
  );
}
