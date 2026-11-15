import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadDetailContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Demo request" };

/** One demo request. Its data loads inside Suspense. */
export default function DemosDetailPage(
  props: PageProps<"/team/leads/demos/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadDetailContent kind="demo" params={props.params} />
    </Suspense>
  );
}
