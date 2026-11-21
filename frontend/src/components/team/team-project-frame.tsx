import type * as React from "react";
import Link from "next/link";

import { ProjectFrame } from "@/components/shell/project-frame";
import {
  DeleteProjectButton,
  EditDetailsButton,
  ProjectStatusChooser,
  RestoreProjectButton,
} from "@/components/team/project-actions";
import { TeamPageTitle } from "@/components/team/team-shell";
import { Banner } from "@/components/ui/banner";
import { serverApi } from "@/lib/api-server";
import type { Me } from "@/lib/auth/me";
import { requireTeamMember } from "@/lib/auth/server";
import { formatDate } from "@/lib/format-time";
import { routes } from "@/lib/routes";
import type { TeamProjectPage } from "@/lib/team/types";

/** The tabs of a project's page in the team panel. */
export type TeamProjectTab = "" | "modules" | "timeline" | "updates";

/** Who is signed in, and the project (only within their scope). */
export async function loadTeamProject(
  code: string,
): Promise<{ me: Me; project: TeamProjectPage }> {
  const me = await requireTeamMember();
  const project = await serverApi<TeamProjectPage>(
    `/team/projects/${encodeURIComponent(code)}`,
    { signIn: routes.teamSignIn },
  );
  return { me, project };
}

const link =
  "inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline";

/**
 * A project's header and tabs in the team panel, with the admins' buttons
 * (status, Edit details, Delete) and the deleted banner with Restore.
 */
export function TeamProjectFrame({
  me,
  project,
  tab,
  children,
}: {
  me: Me;
  project: TeamProjectPage;
  tab: TeamProjectTab;
  children: React.ReactNode;
}) {
  const href = (name: TeamProjectTab) =>
    name
      ? routes.teamProjectTab(project.code, name)
      : routes.teamProject(project.code);
  const manage = project.can.manage;
  return (
    <>
      <TeamPageTitle title={`Project ${project.code}`} />
      <ProjectFrame
        project={project}
        subline={project.customer.company}
        back={
          <>
            <Link href={routes.teamProjects} className={link}>
              ← Projects
            </Link>
            {project.can.viewCustomer ? (
              <Link
                href={routes.teamCustomer(project.customer.id)}
                className={link}
              >
                {project.customer.company} →
              </Link>
            ) : null}
          </>
        }
        banner={
          project.deletedAt ? (
            <Banner
              variant="muted"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span>
                Deleted {formatDate(project.deletedAt, me.timezone)}
                {project.deletedBy ? ` by ${project.deletedBy}` : ""}. It is
                hidden from the lists and the customer&apos;s portal; its
                history is kept.
              </span>
              {project.can.delete ? (
                <RestoreProjectButton code={project.code} />
              ) : null}
            </Banner>
          ) : null
        }
        status={
          manage ? (
            <ProjectStatusChooser code={project.code} status={project.status} />
          ) : null
        }
        actions={
          manage || (project.can.delete && !project.deletedAt) ? (
            <>
              {manage ? <EditDetailsButton project={project} /> : null}
              {project.can.delete && !project.deletedAt ? (
                <DeleteProjectButton project={project} />
              ) : null}
            </>
          ) : null
        }
        tabs={[
          { label: "Overview", href: href("") },
          {
            label: "Modules",
            href: href("modules"),
            count: project.modules.length,
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
    </>
  );
}
