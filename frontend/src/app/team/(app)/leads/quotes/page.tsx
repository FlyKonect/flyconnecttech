import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadListContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Quote requests" };

/** Quote requests from the website. Its data loads inside Suspense. */
export default function QuotesPage(props: PageProps<"/team/leads/quotes">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadListContent kind="quote" searchParams={props.searchParams} />
    </Suspense>
  );
}
