import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { TeamTopic } from "@/components/team/team-discussion-pages";

export const metadata: Metadata = { title: "Discussion" };

/** One discussion with the customer (team panel). */
async function Content({
  params,
}: PageProps<"/team/projects/[code]/discussions/[number]">) {
  const { code, number } = await params;
  return <TeamTopic code={code} board="customer" number={number} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function DiscussionPage(
  props: PageProps<"/team/projects/[code]/discussions/[number]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
