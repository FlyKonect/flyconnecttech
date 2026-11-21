import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ProjectFacts,
  projectCard,
  UpdatesList,
} from "@/components/shell/project-parts";
import { ProjectTeamBox } from "@/components/team/module-actions";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";
import { buttonVariants, TextLink } from "@/components/ui/button";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { env } from "@/env";
import { plural } from "@/lib/plural";
import { formatDay } from "@/lib/projects";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Project" };

/**
 * A project's Overview (team panel): its modules at a glance, details,
 * team notes, the project team, support requests and the latest update.
 */
async function OverviewContent({ params }: PageProps<"/team/projects/[code]">) {
  const { code } = await params;
  const { me, project } = await loadTeamProject(code);
  const zone = me.timezone;
  const latest = project.updates.slice(0, 1);
  const tab = (name: string) => routes.teamProjectTab(project.code, name);

  return (
    <TeamProjectFrame me={me} project={project} tab="">
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-4">
          <section aria-labelledby="modules-heading" className={projectCard}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="modules-heading" className="text-[17px] font-bold">
                Modules · {project.modules.length}
              </h2>
              <TextLink href={tab("modules")} className="font-bold">
                Open modules
              </TextLink>
            </div>
            {project.modules.length ? (
              <ul className="mt-2">
                {project.modules.map((module) => (
                  <li
                    key={module.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-3 py-3 first:border-t-0"
                  >
                    <span className="min-w-0 flex-[1_1_200px]">
                      <span className="block text-[15px] font-bold">
                        {module.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {module.targetDate
                          ? `Target ${formatDay(module.targetDate)}`
                          : "No target date"}
                        {module.round > 1 ? ` · round ${module.round}` : ""}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <LabelPill group="moduleStage" value={module.stage} />
                      {module.late ? (
                        <LabelPill group="moduleFlag" value="LATE" />
                      ) : null}
                    </span>
                    <ProgressBar
                      progress={module.progress}
                      label={module.name}
                      className="w-[200px] max-app:w-full"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No modules yet.
                {project.can.manage ? " Add them on the Modules tab." : ""}
              </p>
            )}
          </section>

          <section aria-labelledby="latest-heading" className={projectCard}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="latest-heading" className="text-[17px] font-bold">
                Latest update
              </h2>
              <TextLink href={tab("updates")} className="font-bold">
                All updates
              </TextLink>
            </div>
            <UpdatesList
              updates={latest}
              zone={zone}
              fileHref={(id) =>
                `${env.NEXT_PUBLIC_API_URL}/team/projects/${encodeURIComponent(project.code)}/files/${id}`
              }
              empty="No updates yet."
            />
          </section>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <section aria-labelledby="details-heading" className={projectCard}>
            <h2 id="details-heading" className="text-[17px] font-bold">
              Details
            </h2>
            {project.description ? (
              <p className="mt-2 text-[15px] leading-[1.6] whitespace-pre-line text-body">
                {project.description}
              </p>
            ) : null}
            <ProjectFacts project={project} lead={project.lead} />
          </section>

          <section aria-labelledby="team-heading" className={projectCard}>
            <h2 id="team-heading" className="text-[17px] font-bold">
              Project team
            </h2>
            <ProjectTeamBox
              code={project.code}
              members={project.members}
              choices={project.memberChoices}
              manage={project.can.manage}
            />
          </section>

          <section
            aria-labelledby="notes-heading"
            className="rounded-[22px] border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] p-6 max-app:p-5"
          >
            <h2 id="notes-heading" className="text-[15px] font-bold">
              Team notes
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#92400E]">
              Only the team sees this
            </p>
            <p className="mt-2 text-sm leading-[1.6] whitespace-pre-line text-body">
              {project.teamNotes ||
                (project.can.manage
                  ? "None yet. Add them with Edit details."
                  : "None.")}
            </p>
          </section>

          <section aria-labelledby="requests-heading" className={projectCard}>
            <h2 id="requests-heading" className="text-[17px] font-bold">
              Support requests
            </h2>
            <p className="mt-2 text-sm text-body">
              {plural(project.requests.open, "open request")} ·{" "}
              {project.requests.total} in all
            </p>
            {project.requests.total ? (
              <Link
                href={`${routes.teamRequests}?project=${project.id}`}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3`}
              >
                View its requests
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </TeamProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ProjectOverviewPage(
  props: PageProps<"/team/projects/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <OverviewContent {...props} />
    </Suspense>
  );
}
