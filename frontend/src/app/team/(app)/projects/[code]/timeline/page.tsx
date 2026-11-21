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
      {project.modules.length ? (
        <ProjectTimeline
          modules={project.modules}
          zone={me.timezone}
          audience="team"
          datesHint={
            project.can.manage
              ? "Set a target date on the Modules tab: ⋯ on the module, then Edit."
              : undefined
          }
        />
      ) : (
        <p className={`${projectCard} text-sm text-muted-foreground`}>
          No modules yet, so there is no timeline.
          {project.can.manage ? " Add them on the Modules tab." : ""}
        </p>
      )}
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
