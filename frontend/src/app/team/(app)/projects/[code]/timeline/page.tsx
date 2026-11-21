import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { projectCard } from "@/components/shell/project-parts";
import { ProjectTimeline } from "@/components/shell/project-timeline";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";

export const metadata: Metadata = { title: "Timeline" };

/** A project's Timeline (team panel): modules over time, every move. */
async function TimelineContent({
  params,
}: PageProps<"/team/projects/[code]/timeline">) {
  const { code } = await params;
  const { me, project } = await loadTeamProject(code);
  return (
    <TeamProjectFrame me={me} project={project} tab="timeline">
      <section aria-labelledby="timeline-heading" className={projectCard}>
        <h2 id="timeline-heading" className="text-[17px] font-bold">
          Timeline
        </h2>
        <p className="mt-1 mb-3 text-sm text-muted-foreground">
          Where each module has reached and what remains. Bars run from the
          start to the target date; red ones are late.
        </p>
        {project.modules.length ? (
          <ProjectTimeline modules={project.modules} zone={me.timezone} />
        ) : (
          <p className="text-sm text-muted-foreground">No modules yet.</p>
        )}
      </section>
    </TeamProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TimelinePage(
  props: PageProps<"/team/projects/[code]/timeline">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TimelineContent {...props} />
    </Suspense>
  );
}
