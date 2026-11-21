import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ScheduledJobs,
  type JobHealth,
} from "@/components/team/scheduled-jobs";
import { SettingsForm } from "@/components/team/settings-form";
import { requireTeamMember } from "@/lib/auth/server";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { AppSettings } from "@/lib/team/types";

export const metadata: Metadata = { title: "Settings" };

/** Settings (screen 33): super admins only; others get "not found". */
async function SettingsContent() {
  const me = await requireTeamMember();
  const [settings, health] = await Promise.all([
    serverApi<AppSettings>("/team/settings", { signIn: routes.teamSignIn }),
    serverApi<{ jobs: JobHealth[] }>("/team/settings/jobs", {
      signIn: routes.teamSignIn,
    }),
  ]);
  return (
    <div className="flex flex-col gap-5">
      <SettingsForm settings={settings} />
      <ScheduledJobs jobs={health.jobs} timeZone={me.timezone} />
    </div>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
