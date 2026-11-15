import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { LeadDetailContent } from "@/components/team/lead-routes";

export const metadata: Metadata = { title: "Message" };

/** One message. Its data loads inside Suspense. */
export default function MessagesDetailPage(
  props: PageProps<"/team/leads/messages/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeadDetailContent kind="message" params={props.params} />
    </Suspense>
  );
}
