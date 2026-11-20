import { LeadPage } from "@/components/team/lead-page";
import { LeadsList } from "@/components/team/leads-list";

import { serverApi } from "@/lib/api-server";
import { pagingQuery } from "@/lib/paging";
import { requireTeamMember } from "@/lib/auth/server";
import { routes } from "@/lib/routes";
import { LEAD_PATH } from "@/lib/team/leads";
import type {
  DemoRow,
  LeadDetail,
  LeadKind,
  LeadList,
  LeadPerson,
  MessageRow,
  QuoteRow,
} from "@/lib/team/types";

/**
 * What the lead pages (app/team/(app)/leads/…) load. Each page wraps these
 * in its own Suspense. Developers get "not found" from the backend.
 */

const text = (value: string | string[] | undefined) =>
  typeof value === "string" ? value.trim().slice(0, 100) : "";

export async function LeadListContent({
  kind,
  searchParams,
}: {
  kind: LeadKind;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = text(params.status);
  const q = text(params.q);
  const me = await requireTeamMember();
  const query = new URLSearchParams(
    Object.entries({ status, q }).filter(([, value]) => value),
  ).toString();
  const apiQuery = new URLSearchParams({
    ...Object.fromEntries(new URLSearchParams(query)),
    ...pagingQuery(params),
  }).toString();
  const list = await serverApi<LeadList<DemoRow | QuoteRow | MessageRow>>(
    `/team/leads/${LEAD_PATH[kind]}${apiQuery ? `?${apiQuery}` : ""}`,
    { signIn: routes.teamSignIn },
  );
  return (
    <LeadsList
      // A new tab or search starts with its own search text.
      key={query}
      kind={kind}
      list={list}
      status={status}
      query={q}
      timeZone={me.timezone}
      canExport={me.actions.includes("exports.download")}
    />
  );
}

export async function LeadDetailContent({
  kind,
  params,
}: {
  kind: LeadKind;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const me = await requireTeamMember();
  const [lead, owners] = await Promise.all([
    serverApi<LeadDetail>(
      `/team/leads/${LEAD_PATH[kind]}/${encodeURIComponent(code)}`,
      { signIn: routes.teamSignIn },
    ),
    serverApi<LeadPerson[]>("/team/leads/owners", {
      signIn: routes.teamSignIn,
    }),
  ]);
  return (
    <LeadPage lead={lead} owners={owners} meId={me.id} timeZone={me.timezone} />
  );
}
