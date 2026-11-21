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
import { buttonVariants } from "@/components/ui/button";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { env } from "@/env";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import { projectTypes } from "@/lib/labels";
import type { PortalProjectPage } from "@/lib/portal/types";
import { plural } from "@/lib/plural";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Project" };

/** One of the customer's projects: details, what's included, updates. */
async function PortalProjectContent({
  params,
}: PageProps<"/portal/projects/[code]">) {
  const { code } = await params;
  const me = await requireCustomer();
  const project = await serverApi<PortalProjectPage>(
    `/portal/projects/${encodeURIComponent(code)}`,
  );
  const zone = me.timezone;
  const fileHref = (id: string) =>
    `${env.NEXT_PUBLIC_API_URL}/portal/projects/${encodeURIComponent(project.code)}/files/${id}`;

  return (
    <>
      <div>
        <Link
          href={routes.portalProjects}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← My Projects
        </Link>
      </div>

      <section
        aria-label="Project"
        className={`${projectCard} flex flex-col gap-4`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              {project.code} · {projectTypes[project.type].label}
            </p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2.5 font-heading text-[22px] font-bold tracking-[-0.02em]">
              {project.name}
              <LabelPill group="projectStatus" value={project.status} />
            </h1>
          </div>
          <Link
            href={`${routes.portalNewRequest}?project=${encodeURIComponent(project.code)}`}
            className={buttonVariants()}
          >
            Create support request for this project
          </Link>
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
            <h2 id="included-heading" className="text-[17px] font-bold">
              What&apos;s included · {project.items.length}
            </h2>
            {project.items.length ? (
              <ul className="mt-2">
                {project.items.map((item) => (
                  <ItemRow key={item.id} item={item} zone={zone} />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Our team hasn&apos;t listed what this project includes yet.
              </p>
            )}
          </section>

          <section aria-labelledby="updates-heading" className={projectCard}>
            <h2 id="updates-heading" className="text-[17px] font-bold">
              Updates · {project.updates.length}
            </h2>
            <UpdatesList
              updates={project.updates}
              zone={zone}
              fileHref={fileHref}
              empty="No updates yet. We post one here, and email you, when there is progress to share."
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
                href={routes.portalRequests}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3`}
              >
                View my requests
              </Link>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalProjectPage(
  props: PageProps<"/portal/projects/[code]">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalProjectContent {...props} />
    </Suspense>
  );
}
