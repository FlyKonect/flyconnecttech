import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { ProjectsList } from "@/components/team/projects-list";
import { serverApi } from "@/lib/api-server";
import { pagingQuery } from "@/lib/paging";
import { routes } from "@/lib/routes";
import { PROJECT_TABS } from "@/lib/team/projects";
import type { ProjectList } from "@/lib/team/types";

export const metadata: Metadata = { title: "Projects" };

/** Projects: every customer's projects. Developers get "not found". */
async function ProjectsContent({ searchParams }: PageProps<"/team/projects">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const wanted = typeof params.status === "string" ? params.status : "";
  const status = PROJECT_TABS.some((tab) => tab.status === wanted)
    ? wanted
    : "";
  const apiQuery = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...pagingQuery(params),
  }).toString();
  const list = await serverApi<ProjectList>(
    `/team/projects${apiQuery ? `?${apiQuery}` : ""}`,
    { signIn: routes.teamSignIn },
  );
  // A new search or tab starts with its own search text.
  return (
    <ProjectsList key={`${status}:${q}`} list={list} filters={{ q, status }} />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ProjectsPage(props: PageProps<"/team/projects">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProjectsContent {...props} />
    </Suspense>
  );
}
