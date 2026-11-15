import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/portal/page-loading";
import {
  ChangePasswordCard,
  ProfileForm,
} from "@/components/portal/profile-forms";
import { serverApi } from "@/lib/api-server";
import type { Profile } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Profile Settings" };

/** Every time zone, labelled like "Europe/London (GMT)". */
function timeZoneOptions(current: string) {
  const now = new Date();
  const zones = Intl.supportedValuesOf("timeZone");
  if (!zones.includes(current)) zones.unshift(current);
  return zones.map((zone) => {
    let offset = "";
    try {
      offset =
        new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          timeZoneName: "shortOffset",
        })
          .formatToParts(now)
          .find((part) => part.type === "timeZoneName")?.value ?? "";
    } catch {
      offset = "";
    }
    // "GMT+0" reads as "GMT", as in the design.
    if (offset === "GMT+0") offset = "GMT";
    return { value: zone, label: offset ? `${zone} (${offset})` : zone };
  });
}

/** Profile Settings (screen 15). */
async function ProfileSettingsPageContent() {
  const profile = await serverApi<Profile>("/portal/profile");
  return (
    <div className="flex flex-wrap items-start gap-5">
      <ProfileForm
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
