import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { SettingsForm } from "@/components/team/settings-form";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { AppSettings } from "@/lib/team/types";

export const metadata: Metadata = { title: "Settings" };

/** Settings (screen 33): super admins only; others get "not found". */
async function SettingsContent() {
  const settings = await serverApi<AppSettings>("/team/settings", {
    signIn: routes.teamSignIn,
  });
  return <SettingsForm settings={settings} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
