import type * as React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import { LabelPill } from "@/components/ui/pill";
import { moduleStages, projectTypes } from "@/lib/labels";
import { daysBetween, todayIn } from "@/lib/module-story";
import {
  formatDay,
  progressWords,
  type ProjectModule,
  type ProjectPage,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

export type ProjectTab = {
  label: string;
  href: string;
  icon: LucideIcon;
  count?: number;
  /** A gold badge instead of the count: "1 to review". */
  badge?: string;
};

/**
 * A project's header and tabs, shared by the team panel and the client
 * portal: back links, the name with its code, type and status, the
 * area's buttons; three numbers (items done, modules done with a strip
 * coloured by stage, the target date and how far off it is); then the
 * tabs (Overview, Modules, Timeline, Discussions, …) and the tab.
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
  zone = "Europe/London",
  children,
}: {
  project: Pick<
    ProjectPage,
    | "code"
    | "name"
    | "type"
    | "status"
    | "progress"
    | "modulesDone"
    | "modules"
    | "targetDate"
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
  /** For "in 12 days" against the target date. */
  zone?: string;
  children: React.ReactNode;
}) {
  const initials = project.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
  const today = todayIn(zone);
  const left = project.targetDate
    ? daysBetween(today, project.targetDate)
    : null;
  const percent = project.progress.percent;

  return (
    <>
      <div className="flex flex-wrap gap-x-4">{back}</div>
      {banner}
      <section
        aria-label="Project"
        className={cn(projectCard, "flex flex-col gap-5 pb-0 max-app:pb-0")}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-[54px] shrink-0 items-center justify-center rounded-[16px] bg-navy font-heading text-lg font-bold tracking-wide text-gold max-app:size-11 max-app:text-base"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted-foreground">
                {project.code} · {projectTypes[project.type].label}
                {subline ? ` · ${subline}` : ""}
              </p>
              <h1 className="mt-0.5 flex flex-wrap items-center gap-2.5 font-heading text-[24px] leading-tight font-bold tracking-[-0.02em] max-app:text-[20px]">
                {project.name}
                {status ? null : (
                  <LabelPill group="projectStatus" value={project.status} />
                )}
              </h1>
            </div>
          </div>
          {status || actions ? (
            <div className="flex flex-wrap items-center gap-2.5">
              {status}
              {actions}
            </div>
          ) : null}
        </div>

        <dl className="grid grid-cols-3 overflow-hidden rounded-[18px] border border-line-2 bg-[#F8FAFD]">
          <Stat label="Items done">
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-[22px] font-bold whitespace-nowrap max-app:text-[16px]">
                {percent === null ? "–" : `${percent}%`}
              </span>
              <span className="text-[13px] text-muted-foreground max-[1100px]:hidden">
                {progressWords(project.progress)}
              </span>
            </span>
            <span
              role="progressbar"
              aria-label={`Progress of ${project.name}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent ?? 0}
              aria-valuetext={
                percent === null
                  ? progressWords(project.progress)
                  : `${percent}%, ${progressWords(project.progress)}`
              }
              className="mt-2 block h-2 overflow-hidden rounded-full bg-[#E3E9F5]"
            >
              <span
                className={cn(
                  "block h-full rounded-full",
                  percent === 100 ? "bg-[#16A34A]" : "bg-navy",
                )}
                style={{ width: `${percent ?? 0}%` }}
              />
            </span>
          </Stat>
          <Stat label="Modules done">
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-[22px] font-bold whitespace-nowrap max-app:text-[16px]">
                {project.modulesDone} of {project.modules.length}
              </span>
              <span className="text-[13px] text-muted-foreground max-[1100px]:hidden">
                {project.modules.length ? "modules" : "No modules yet"}
              </span>
            </span>
            <ModuleStrip modules={project.modules} />
          </Stat>
          <Stat label="Target date">
            <span className="flex items-baseline gap-2">
              <span className="font-heading text-[22px] font-bold whitespace-nowrap max-app:text-[16px]">
                {project.targetDate ? formatDay(project.targetDate) : "Not set"}
              </span>
            </span>
            <span
              className={cn(
                "mt-1.5 block text-[13px] font-semibold max-app:text-[11px]",
                left === null ||
                  project.status === "COMPLETED" ||
                  project.status === "LIVE"
                  ? "text-muted-foreground"
                  : left < 0
                    ? "text-[#B91C1C]"
                    : left <= 7
                      ? "text-[#92400E]"
                      : "text-muted-foreground",
              )}
            >
              {left === null
                ? "No target date yet"
                : project.status === "COMPLETED" || project.status === "LIVE"
                  ? projectStatusWords(project.status)
                  : left < 0
                    ? `${-left} day${left === -1 ? "" : "s"} past the target`
                    : left === 0
                      ? "Due today"
                      : `${left} day${left === 1 ? "" : "s"} to go`}
            </span>
          </Stat>
        </dl>

        <nav
          aria-label="Project sections"
          className="-mx-6 flex gap-1 overflow-x-auto border-t border-line-3 px-4 max-app:-mx-5 max-app:px-3"
        >
          {tabs.map((tab) => {
            const current = tab.href === active;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-[52px] shrink-0 items-center gap-2 px-3 text-[13.5px] font-bold whitespace-nowrap transition-colors",
                  "after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-colors",
                  current
                    ? "text-navy after:bg-gold"
                    : "text-muted-foreground after:bg-transparent hover:text-navy hover:after:bg-line-2",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-[17px]",
                    current ? "text-navy" : "text-[#8A96AD]",
                  )}
                />
                {tab.label}
                {tab.badge ? (
                  <span className="inline-flex h-5 items-center rounded-full bg-[#FEF3C7] px-2 text-[11px] font-bold text-[#92400E]">
                    {tab.badge}
                  </span>
                ) : tab.count ? (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                      current ? "bg-navy text-white" : "bg-soft text-navy-700",
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

function projectStatusWords(status: ProjectPage["status"]) {
  return status === "LIVE" ? "The project is live" : "The project is completed";
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 border-line-2 px-5 py-4 not-last:border-r max-app:px-3 max-app:py-3">
      <dt className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase max-app:text-[10px] max-app:tracking-[0.04em]">
        {label}
      </dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}

const STRIP: Partial<Record<ProjectModule["stage"], string>> = {
  DONE: "#16A34A",
  CLIENT_REVIEW: "#F59E0B",
  CHANGES_REQUESTED: "#F97316",
  RETEST: "#F97316",
  NOT_STARTED: "#D5DDEA",
};

/** One small block a module, in its stage's colour (with a key on hover). */
function ModuleStrip({ modules }: { modules: ProjectModule[] }) {
  if (!modules.length) {
    return <span className="mt-2 block h-2 rounded-full bg-[#E3E9F5]" />;
  }
  return (
    <span className="mt-2 flex h-2 gap-1" aria-hidden="true">
      {modules.map((module) => (
        <span
          key={module.id}
          title={`${module.name}: ${moduleStages[module.stage].label}`}
          className="h-full flex-1 rounded-full"
          style={{ background: STRIP[module.stage] ?? "#021A54" }}
        />
      ))}
    </span>
  );
}
