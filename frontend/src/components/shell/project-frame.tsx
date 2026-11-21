import type * as React from "react";
import Link from "next/link";

import { projectCard } from "@/components/shell/project-parts";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { projectTypes } from "@/lib/labels";
import { modulesWords, type ProjectPage } from "@/lib/projects";
import { cn } from "@/lib/utils";

export type ProjectTab = { label: string; href: string; count?: number };

/**
 * A project's header and tabs, shared by the team panel and the client
 * portal: back links, code · type, the name and status, the progress
 * ("60% · 6 of 10 done", "2 of 5 modules done"), the area's buttons, then
 * the tabs (Overview, Modules, Timeline, Discussions, …) and the tab.
 */
export function ProjectFrame({
  project,
  subline,
  back,
  banner,
  status,
  actions,
  tabs,
  active,
  children,
}: {
  project: Pick<
    ProjectPage,
    "code" | "name" | "type" | "status" | "progress" | "modulesDone" | "modules"
  >;
  /** After code · type, for example the company. */
  subline?: string;
  back: React.ReactNode;
  /** For example "Deleted … Restore project". */
  banner?: React.ReactNode;
  /** The status dropdown (team); otherwise the pill shows. */
  status?: React.ReactNode;
  actions?: React.ReactNode;
  tabs: ProjectTab[];
  /** The address of the tab shown. */
  active: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-x-4">{back}</div>
      {banner}
      <section
        aria-label="Project"
        className={`${projectCard} flex flex-col gap-4`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              {project.code} · {projectTypes[project.type].label}
              {subline ? ` · ${subline}` : ""}
            </p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2.5 font-heading text-[22px] font-bold tracking-[-0.02em]">
              {project.name}
              {status ? null : (
                <LabelPill group="projectStatus" value={project.status} />
              )}
            </h1>
          </div>
          {status || actions ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {status}
              {actions}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <ProgressBar
            progress={project.progress}
            label={project.name}
            size="lg"
            className="max-w-[560px] min-w-[240px] flex-[1_1_320px]"
          />
          {project.modules.length ? (
            <span className="text-sm text-muted-foreground">
              {modulesWords(project.modulesDone, project.modules.length)}
            </span>
          ) : null}
        </div>
        <nav
          aria-label="Project sections"
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-line-3 px-1 pt-3"
        >
          {tabs.map((tab) => {
            const current = tab.href === active;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-[13px] font-bold whitespace-nowrap transition-colors",
                  current
                    ? "bg-navy text-white"
                    : "text-body hover:bg-soft hover:text-navy",
                )}
              >
                {tab.label}
                {tab.count ? (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                      current
                        ? "bg-white/20 text-white"
                        : "bg-soft text-navy-700",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </section>
      {children}
    </>
  );
}
