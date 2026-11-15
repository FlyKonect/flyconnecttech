import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/portal/page-loading";
import { MyRequests } from "@/components/portal/my-requests";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import type { PortalTab, RequestList } from "@/lib/portal/types";

export const metadata: Metadata = { title: "My Requests" };

const TABS: PortalTab[] = ["all", "open", "waiting", "resolved"];

/**
 * My requests (screen 12). `?q=` comes from the search box in the header,
 * `?tab=` opens a tab (for example from the Overview).
 */
async function MyRequestsPageContent({
  searchParams,
}: PageProps<"/portal/requests">) {
  const { q, tab } = await searchParams;
  const search = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const initialTab = TABS.find((t) => t === tab) ?? "all";

  const me = await requireCustomer();
  const list = await serverApi<RequestList>(
    `/portal/requests${search ? `?q=${encodeURIComponent(search)}` : ""}`,
  );

  return (
    <MyRequests
      // A new search starts again on its first tab.
      key={`${search}-${initialTab}`}
      rows={list.rows}
      initialTab={initialTab}
      search={search}
      timeZone={me.timezone}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function MyRequestsPage(props: PageProps<"/portal/requests">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <MyRequestsPageContent {...props} />
    </Suspense>
  );
}
