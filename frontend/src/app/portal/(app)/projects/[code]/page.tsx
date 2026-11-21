import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  loadPortalProject,
  PortalProjectFrame,
} from "@/components/portal/portal-project-frame";
import { PageLoading } from "@/components/shell/page-loading";
import {
  AttentionCard,
  ModulesGlance,
  OverviewCard,
} from "@/components/shell/project-overview";
import { ProjectFacts, UpdatesList } from "@/components/shell/project-parts";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/env";
import { modulesWords } from "@/lib/projects";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Project" };

/**
 * One of the customer's projects: what waits for them, its modules at a
 * glance and the latest update; on the side the details and their
 * support requests.
 */
async function PortalOverviewContent({
  params,
}: PageProps<"/portal/projects/[code]">) {
  const { code } = await params;
  const { me, project } = await loadPortalProject(code);
  const tab = (name: string) => routes.portalProjectTab(project.code, name);

  return (
    <PortalProjectFrame project={project} tab="" zone={me.timezone}>
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-5">
          <AttentionCard
            modules={project.modules}
            zone={me.timezone}
            audience="customer"
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
                zone={me.timezone}
                audience="customer"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Our team hasn&apos;t set up the modules yet.
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
              zone={me.timezone}
              fileHref={(id) =>
                `${env.NEXT_PUBLIC_API_URL}/portal/projects/${encodeURIComponent(project.code)}/files/${id}`
              }
              empty="No updates yet. We post one here, and email you, when there is progress to share."
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
                href={routes.portalRequests}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3 w-full`}
              >
                View my requests
              </Link>
            ) : null}
          </OverviewCard>
        </div>
      </div>
    </PortalProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalProjectPage(
  props: PageProps<"/portal/projects/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalOverviewContent {...props} />
    </Suspense>
  );
}
