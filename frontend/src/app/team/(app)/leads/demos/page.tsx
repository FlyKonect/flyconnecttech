import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadListContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Demo requests" };

/** Demo requests from the website. Its data loads inside Suspense. */
export default function DemosPage(props: PageProps<"/team/leads/demos">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadListContent kind="demo" searchParams={props.searchParams} />
    </Suspense>
  );
}
