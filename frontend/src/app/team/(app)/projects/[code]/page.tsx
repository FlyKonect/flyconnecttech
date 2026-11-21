import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";

import { PageLoading } from "@/components/shell/page-loading";
import {
  AttentionCard,
  ModulesGlance,
  OverviewCard,
} from "@/components/shell/project-overview";
import { ProjectFacts, UpdatesList } from "@/components/shell/project-parts";
import { ProjectTeamBox } from "@/components/team/module-actions";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/env";
import { modulesWords } from "@/lib/projects";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Project" };

/**
 * A project's Overview (team panel): what needs attention, its modules at
 * a glance and the latest update; on the side the details, the project
 * team, team notes and support requests.
 */
async function OverviewContent({ params }: PageProps<"/team/projects/[code]">) {
  const { code } = await params;
  const { me, project } = await loadTeamProject(code);
  const zone = me.timezone;
  const tab = (name: string) => routes.teamProjectTab(project.code, name);

  return (
    <TeamProjectFrame me={me} project={project} tab="">
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-5">
          <AttentionCard
            modules={project.modules}
            zone={zone}
            audience="team"
            modulesHref={tab("modules")}
          />

          <OverviewCard
            id="modules-heading"
            title="Modules at a glance"
            note={
              project.modules.length
                ? modulesWords(project.modulesDone, project.modules.length)
                : undefined
            }
            link={{ href: tab("modules"), label: "Open modules" }}
          >
            {project.modules.length ? (
              <ModulesGlance
                modules={project.modules}
                zone={zone}
                audience="team"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                No modules yet.
                {project.can.manage ? " Add them on the Modules tab." : ""}
              </p>
            )}
          </OverviewCard>

          <OverviewCard
            id="latest-heading"
            title="Latest update"
            link={{ href: tab("updates"), label: "All updates" }}
          >
            <UpdatesList
              updates={project.updates.slice(0, 1)}
              zone={zone}
              fileHref={(id) =>
                `${env.NEXT_PUBLIC_API_URL}/team/projects/${encodeURIComponent(project.code)}/files/${id}`
              }
              empty="No updates yet. Post one on the Updates tab: the customer gets it by email."
            />
          </OverviewCard>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5">
          <OverviewCard id="details-heading" title="About the project">
            {project.description ? (
              <p className="mb-4 text-[15px] leading-[1.6] whitespace-pre-line text-body">
                {project.description}
              </p>
            ) : null}
            <ProjectFacts project={project} lead={project.lead} />
          </OverviewCard>

          <OverviewCard
            id="team-heading"
            title="Project team"
            note="They see the project and take part in its discussions."
          >
            <ProjectTeamBox
              code={project.code}
              members={project.members}
              choices={project.memberChoices}
              manage={project.can.manage}
            />
          </OverviewCard>

          <section
            aria-labelledby="notes-heading"
            className="rounded-[22px] border border-[#FCD34D] bg-[#FFFBEB] p-6 max-app:p-5"
          >
            <h2
              id="notes-heading"
              className="flex items-center gap-2 text-[15px] font-bold"
            >
              <LockKeyhole
                aria-hidden="true"
                className="size-4 text-[#B45309]"
              />
              Team notes
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#92400E]">
              Only the team sees this
            </p>
            <p className="mt-2.5 text-sm leading-[1.6] whitespace-pre-line text-body">
              {project.teamNotes ||
                (project.can.manage
                  ? "None yet. Add them with Edit details."
                  : "None.")}
            </p>
          </section>

          <OverviewCard id="requests-heading" title="Support requests">
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] bg-[#F8FAFD] px-4 py-3">
                <dt className="text-xs text-muted-foreground">Open</dt>
                <dd className="font-heading text-[22px] font-bold">
                  {project.requests.open}
                </dd>
              </div>
              <div className="rounded-[14px] bg-[#F8FAFD] px-4 py-3">
                <dt className="text-xs text-muted-foreground">In all</dt>
                <dd className="font-heading text-[22px] font-bold">
                  {project.requests.total}
                </dd>
              </div>
            </dl>
            {project.requests.total ? (
              <Link
                href={`${routes.teamRequests}?project=${project.id}`}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3 w-full`}
              >
                View its requests
              </Link>
            ) : null}
          </OverviewCard>
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
