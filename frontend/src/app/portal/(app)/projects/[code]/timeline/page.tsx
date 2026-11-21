import { Suspense } from "react";
import type { Metadata } from "next";

import {
  loadPortalProject,
  PortalProjectFrame,
} from "@/components/portal/portal-project-frame";
import { PageLoading } from "@/components/shell/page-loading";
import { projectCard } from "@/components/shell/project-parts";
import { ProjectTimeline } from "@/components/shell/project-timeline";

export const metadata: Metadata = { title: "Timeline" };

/** The customer's timeline: where each module has reached, every move. */
async function PortalTimelineContent({
  params,
}: PageProps<"/portal/projects/[code]/timeline">) {
  const { code } = await params;
  const { me, project } = await loadPortalProject(code);
  return (
    <PortalProjectFrame project={project} tab="timeline">
      <section aria-labelledby="timeline-heading" className={projectCard}>
        <h2 id="timeline-heading" className="text-[17px] font-bold">
          Timeline
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Where each part of your project has reached and what remains.
        </p>
        {project.modules.length ? (
          <ProjectTimeline modules={project.modules} zone={me.timezone} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Our team hasn&apos;t set up the modules yet.
          </p>
        )}
      </section>
    </PortalProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalTimelinePage(
  props: PageProps<"/portal/projects/[code]/timeline">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalTimelineContent {...props} />
    </Suspense>
  );
}
