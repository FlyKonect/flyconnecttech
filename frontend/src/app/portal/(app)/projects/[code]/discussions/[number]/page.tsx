import { Suspense } from "react";
import type { Metadata } from "next";

import { PortalTopic } from "@/components/portal/portal-discussion-pages";
import { PageLoading } from "@/components/shell/page-loading";

export const metadata: Metadata = { title: "Discussion" };

/** One of the customer's discussions. */
async function Content({
  params,
}: PageProps<"/portal/projects/[code]/discussions/[number]">) {
  const { code, number } = await params;
  return <PortalTopic code={code} number={number} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalDiscussionPage(
  props: PageProps<"/portal/projects/[code]/discussions/[number]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
