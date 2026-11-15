import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadDetailContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Quote request" };

/** One quote request. Its data loads inside Suspense. */
export default function QuotesDetailPage(
  props: PageProps<"/team/leads/quotes/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadDetailContent kind="quote" params={props.params} />
    </Suspense>
  );
}
