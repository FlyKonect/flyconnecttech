import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import {
  TeamRequests,
  type TeamFilters,
} from "@/components/team/team-requests";
import { serverApi } from "@/lib/api-server";
import { pagingQuery } from "@/lib/paging";
import { requireTeamMember } from "@/lib/auth/server";
import { routes } from "@/lib/routes";
import type { TeamRequestList } from "@/lib/team/types";

export const metadata: Metadata = { title: "Support Requests" };

const FILTERS = ["status", "q", "project", "priority", "assignee"] as const;

/** All requests (screen 21). Filters come from the address. */
async function TeamRequestsContent({
  searchParams,
}: PageProps<"/team/requests">) {
  const params = await searchParams;
  const filters = Object.fromEntries(
    FILTERS.map((key) => {
      const value = params[key];
      return [key, typeof value === "string" ? value.slice(0, 100) : ""];
    }),
  ) as TeamFilters;

  const me = await requireTeamMember();
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  ).toString();
  const apiQuery = new URLSearchParams({
    ...Object.fromEntries(new URLSearchParams(query)),
    ...pagingQuery(params),
  }).toString();
  const list = await serverApi<TeamRequestList>(
    `/team/requests${apiQuery ? `?${apiQuery}` : ""}`,
    { signIn: routes.teamSignIn },
  );

  return (
    <TeamRequests
      // A new set of filters starts with its own search text.
      key={query}
      list={list}
      filters={filters}
      developerName={me.role === "DEVELOPER" ? me.name : null}
      timeZone={me.timezone}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamRequestsPage(props: PageProps<"/team/requests">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamRequestsContent {...props} />
    </Suspense>
  );
}
