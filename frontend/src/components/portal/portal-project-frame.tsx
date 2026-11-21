import type * as React from "react";
import Link from "next/link";

import { ProjectFrame } from "@/components/shell/project-frame";
import { buttonVariants } from "@/components/ui/button";
import { serverApi } from "@/lib/api-server";
import type { Me } from "@/lib/auth/me";
import { requireCustomer } from "@/lib/auth/server";
import type { PortalProjectPage } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

/** The tabs of a project's page in the client portal. */
export type PortalProjectTab = "" | "modules" | "timeline" | "updates";

/** The signed-in customer and one of their own projects. */
export async function loadPortalProject(
  code: string,
): Promise<{ me: Me; project: PortalProjectPage }> {
  const me = await requireCustomer();
  const project = await serverApi<PortalProjectPage>(
    `/portal/projects/${encodeURIComponent(code)}`,
  );
  return { me, project };
}

/** A project's header and tabs in the client portal. */
export function PortalProjectFrame({
  project,
  tab,
  children,
}: {
  project: PortalProjectPage;
  tab: PortalProjectTab;
  children: React.ReactNode;
}) {
  const href = (name: PortalProjectTab) =>
    name
      ? routes.portalProjectTab(project.code, name)
      : routes.portalProject(project.code);
  const inReview = project.modules.filter(
    (module) => module.stage === "CLIENT_REVIEW",
  ).length;
  return (
    <ProjectFrame
      project={project}
      back={
        <Link
          href={routes.portalProjects}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← My Projects
        </Link>
      }
      actions={
        <Link
          href={`${routes.portalNewRequest}?project=${encodeURIComponent(project.code)}`}
          className={buttonVariants()}
        >
          Create support request for this project
        </Link>
      }
      tabs={[
        { label: "Overview", href: href("") },
        {
          label: inReview ? "Modules · waiting for you" : "Modules",
          href: href("modules"),
          count: inReview || project.modules.length,
        },
        { label: "Timeline", href: href("timeline") },
        {
          label: "Updates",
          href: href("updates"),
          count: project.updates.length,
        },
      ]}
      active={href(tab)}
    >
      {children}
    </ProjectFrame>
  );
}
