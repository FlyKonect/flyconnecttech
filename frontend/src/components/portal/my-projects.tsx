import Link from "next/link";

import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { projectTypes } from "@/lib/labels";
import type { PortalProject } from "@/lib/portal/types";
import { formatDay, modulesWords } from "@/lib/projects";
import { routes } from "@/lib/routes";

/** My Projects: a card per project, with its status and progress. */
export function MyProjects({ projects }: { projects: PortalProject[] }) {
  if (!projects.length) {
    return (
      <p className="rounded-[22px] border border-line-2 bg-white p-6 text-muted-foreground">
        No projects yet. They appear here once our team sets them up.
      </p>
    );
  }
  return (
    <ul
      aria-label="My projects"
      className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 max-app:grid-cols-1"
    >
      {projects.map((project) => (
        <li key={project.id}>
          <Link
            href={routes.portalProject(project.code)}
            className="flex h-full flex-col gap-3 rounded-[22px] border border-line-2 bg-white p-5 shadow-[0_1px_2px_rgba(2,26,84,0.04)] transition-colors hover:border-[#CBD5E4] hover:bg-[#F9FBFE]"
          >
            <span className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="block text-xs font-bold text-muted-foreground">
                  {project.code} · {projectTypes[project.type].label}
                </span>
                <span className="mt-0.5 block text-[17px] font-bold">
                  {project.name}
                </span>
              </span>
              <LabelPill group="projectStatus" value={project.status} />
            </span>
            {project.description ? (
              <span className="line-clamp-2 text-sm text-body">
                {project.description}
              </span>
            ) : null}
            <ProgressBar progress={project.progress} label={project.name} />
            {project.modules.total ? (
              <span className="flex flex-wrap items-center gap-2 text-[13px] text-body">
                {modulesWords(project.modules.done, project.modules.total)}
                {project.modules.inReview ? (
                  <LabelPill group="moduleFlag" value="REVIEW_WAITING" />
                ) : null}
              </span>
            ) : null}
            <span className="mt-auto flex flex-wrap justify-between gap-2 text-[13px] text-muted-foreground">
              <span>
                {project.targetDate
                  ? `Target ${formatDay(project.targetDate)}`
                  : "No target date yet"}
              </span>
              {project.lead ? <span>Lead: {project.lead}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
