import { Suspense } from "react";
import type { Metadata } from "next";

import { MyProjects } from "@/components/portal/my-projects";
import { PageLoading } from "@/components/shell/page-loading";
import { serverApi } from "@/lib/api-server";
import type { PortalProject } from "@/lib/portal/types";

export const metadata: Metadata = { title: "My Projects" };

/** My Projects: the customer's own projects and how far each one is. */
async function MyProjectsContent() {
  const projects = await serverApi<PortalProject[]>("/portal/projects");
  return (
    <>
      <p className="text-[15px] text-muted-foreground">
        What each project includes and how far it is. Our team updates them as
        the work goes on.
      </p>
      <MyProjects projects={projects} />
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function MyProjectsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <MyProjectsContent />
    </Suspense>
  );
}
