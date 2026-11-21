import { Suspense } from "react";
import type { Metadata } from "next";

import { PortalBoard } from "@/components/portal/portal-discussion-pages";
import { PageLoading } from "@/components/shell/page-loading";

export const metadata: Metadata = { title: "Discussions" };

/** The customer's discussions on one of their projects. */
async function Content({
  params,
  searchParams,
}: PageProps<"/portal/projects/[code]/discussions">) {
  const { code } = await params;
  const { status, page } = await searchParams;
  return (
    <PortalBoard
      code={code}
      status={status === "closed" ? "closed" : "open"}
      page={typeof page === "string" ? page : ""}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalDiscussionsPage(
  props: PageProps<"/portal/projects/[code]/discussions">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Content {...props} />
    </Suspense>
  );
}
