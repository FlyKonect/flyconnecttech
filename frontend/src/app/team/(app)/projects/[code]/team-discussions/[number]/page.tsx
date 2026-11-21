import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { TeamTopic } from "@/components/team/team-discussion-pages";

export const metadata: Metadata = { title: "Team discussion" };

/** One team discussion (internal). */
async function Content({
  params,
}: PageProps<"/team/projects/[code]/team-discussions/[number]">) {
  const { code, number } = await params;
  return <TeamTopic code={code} board="team" number={number} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamDiscussionPage(
  props: PageProps<"/team/projects/[code]/team-discussions/[number]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
