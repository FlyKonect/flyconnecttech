import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadListContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Messages" };

/** Messages from the website. Its data loads inside Suspense. */
export default function MessagesPage(props: PageProps<"/team/leads/messages">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadListContent kind="message" searchParams={props.searchParams} />
    </Suspense>
  );
}
