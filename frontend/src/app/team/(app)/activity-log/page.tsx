import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ActivityLog,
  type ActivityLogView,
} from "@/components/team/activity-log";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { pagingQuery } from "@/lib/paging";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Activity log" };

/** The Activity log: super admins only; others get "not found". */
async function ActivityLogContent({
  searchParams,
}: PageProps<"/team/activity-log">) {
  const params = await searchParams;
  const one = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : "";
  };
  const chosen = {
    what: one("what"),
    person: one("person"),
    from: one("from"),
    to: one("to"),
  };
  const me = await requireTeamMember();
  const query = new URLSearchParams({
    ...Object.fromEntries(Object.entries(chosen).filter(([, v]) => v)),
    ...pagingQuery(params),
  }).toString();
  const view = await serverApi<ActivityLogView>(
    `/team/audit${query ? `?${query}` : ""}`,
    { signIn: routes.teamSignIn },
  );
  return <ActivityLog view={view} chosen={chosen} timeZone={me.timezone} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function Page(props: PageProps<"/team/activity-log">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ActivityLogContent {...props} />
    </Suspense>
  );
}
