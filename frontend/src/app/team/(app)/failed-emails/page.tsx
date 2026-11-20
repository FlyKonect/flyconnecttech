import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { FailedEmails } from "@/components/team/failed-emails";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { routes } from "@/lib/routes";
import type { FailedEmailsView } from "@/lib/team/types";

export const metadata: Metadata = { title: "Failed emails" };

/** Failed emails: super admins and admins; others get "not found". */
async function FailedEmailsPage() {
  const me = await requireTeamMember();
  const view = await serverApi<FailedEmailsView>("/team/emails", {
    signIn: routes.teamSignIn,
  });
  return <FailedEmails items={view.items} timeZone={me.timezone} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <FailedEmailsPage />
    </Suspense>
  );
}
