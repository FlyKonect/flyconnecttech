import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { TeamBoard } from "@/components/team/team-discussion-pages";

export const metadata: Metadata = { title: "Discussions" };

/** A project's discussions with the customer (team panel). */
async function Content({
  params,
  searchParams,
}: PageProps<"/team/projects/[code]/discussions">) {
  const { code } = await params;
  const { status, page } = await searchParams;
  return (
    <TeamBoard
      code={code}
      board="customer"
      status={status === "closed" ? "closed" : "open"}
      page={typeof page === "string" ? page : ""}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function DiscussionsPage(
  props: PageProps<"/team/projects/[code]/discussions">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
