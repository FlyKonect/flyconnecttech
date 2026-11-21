import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import {
  ItemRow,
  ProjectFacts,
  projectCard,
  UpdatesList,
} from "@/components/shell/project-parts";
import {
  AddItemsForm,
  DeleteProjectButton,
  EditDetailsButton,
  ItemControls,
  ProjectStatusChooser,
  RestoreProjectButton,
  UpdateComposer,
  UpdateMenu,
} from "@/components/team/project-actions";
import { TeamPageTitle } from "@/components/team/team-shell";
import { Banner } from "@/components/ui/banner";
import { buttonVariants } from "@/components/ui/button";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { env } from "@/env";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { formatDate } from "@/lib/format-time";
import { projectTypes } from "@/lib/labels";
import { plural } from "@/lib/plural";
import { routes } from "@/lib/routes";
import type { TeamProjectPage } from "@/lib/team/types";

export const metadata: Metadata = { title: "Project" };

/**
 * One project (team panel): its details, what it includes with each
 * item's status, the progress and the updates. Super admins and admins
 * change them; managers look. Deleted projects show with Restore.
 */
async function ProjectContent({ params }: PageProps<"/team/projects/[code]">) {
  const { code } = await params;
  const me = await requireTeamMember();
  const project = await serverApi<TeamProjectPage>(
    `/team/projects/${encodeURIComponent(code)}`,
    { signIn: routes.teamSignIn },
  );
  const zone = me.timezone;
  const manage = project.can.manage;
  const fileHref = (id: string) =>
    `${env.NEXT_PUBLIC_API_URL}/team/projects/${encodeURIComponent(project.code)}/files/${id}`;

  return (
    <>
      <TeamPageTitle title={`Project ${project.code}`} />
      <div className="flex flex-wrap gap-x-4">
        <Link
          href={routes.teamProjects}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← Projects
        </Link>
        <Link
          href={routes.teamCustomer(project.customer.id)}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          {project.customer.company} →
        </Link>
      </div>

      {project.deletedAt ? (
        <Banner
          variant="muted"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <span>
            Deleted {formatDate(project.deletedAt, zone)}
            {project.deletedBy ? ` by ${project.deletedBy}` : ""}. It is hidden
            from the lists and the customer&apos;s portal; its history is kept.
          </span>
          {project.can.delete ? (
            <RestoreProjectButton code={project.code} />
          ) : null}
        </Banner>
      ) : null}

      <section
        aria-label="Project"
        className={`${projectCard} flex flex-col gap-4`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              {project.code} · {projectTypes[project.type].label} ·{" "}
              {project.customer.company}
            </p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2.5 font-heading text-[22px] font-bold tracking-[-0.02em]">
              {project.name}
              {manage ? null : (
                <LabelPill group="projectStatus" value={project.status} />
              )}
            </h1>
          </div>
          {manage || (project.can.delete && !project.deletedAt) ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {manage ? (
                <>
                  <ProjectStatusChooser
                    code={project.code}
                    status={project.status}
                  />
                  <EditDetailsButton project={project} />
                </>
              ) : null}
              {project.can.delete && !project.deletedAt ? (
                <DeleteProjectButton project={project} />
              ) : null}
            </div>
          ) : null}
        </div>
        <ProgressBar
          progress={project.progress}
          label={project.name}
          size="lg"
          className="max-w-[560px]"
        />
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-4">
          <section aria-labelledby="included-heading" className={projectCard}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="included-heading" className="text-[17px] font-bold">
                What&apos;s included · {project.items.length}
              </h2>
              <span className="text-[13px] text-muted-foreground">
                The customer sees each item&apos;s status
              </span>
            </div>
            {project.items.length ? (
              <ul className="mt-2">
                {project.items.map((item, index) => (
                  <ItemRow key={item.id} item={item} zone={zone}>
                    {manage ? (
                      <ItemControls
                        code={project.code}
                        item={item}
                        first={index === 0}
                        last={index === project.items.length - 1}
                      />
                    ) : undefined}
                  </ItemRow>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing listed yet.
                {manage ? " Add what this project includes." : ""}
              </p>
            )}
            {manage ? <AddItemsForm code={project.code} /> : null}
          </section>

          <section aria-labelledby="updates-heading" className={projectCard}>
            <h2 id="updates-heading" className="text-[17px] font-bold">
              Updates · {project.updates.length}
            </h2>
            {manage ? <UpdateComposer code={project.code} /> : null}
            <UpdatesList
              updates={project.updates}
              zone={zone}
              fileHref={fileHref}
              menu={
                manage
                  ? (update) => (
                      <UpdateMenu code={project.code} update={update} />
                    )
                  : undefined
              }
              empty="No updates yet. Post one when there is progress to share."
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
                (manage ? "None yet. Add them with Edit details." : "None.")}
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
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ProjectPage(props: PageProps<"/team/projects/[code]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProjectContent {...props} />
    </Suspense>
  );
}
