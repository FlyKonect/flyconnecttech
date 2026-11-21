import type * as React from "react";
import { CalendarDays, History, ListChecks } from "lucide-react";

import { ModuleActivity } from "@/components/shell/module-activity";
import { ItemRow, projectCard } from "@/components/shell/project-parts";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StageStepper } from "@/components/ui/stage-stepper";
import { dueWords, todayIn, type Audience } from "@/lib/module-story";
import {
  formatDay,
  type ProjectItem,
  type ProjectModule,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

/** The number badge's colour: where the module is. */
const BADGE: Partial<Record<ProjectModule["stage"], string>> = {
  NOT_STARTED: "bg-[#EEF2F8] text-[#475569]",
  DONE: "bg-[#DCFCE7] text-[#15803D]",
  CLIENT_REVIEW: "bg-[#FEF3C7] text-[#92400E]",
  CHANGES_REQUESTED: "bg-[#FFEDD5] text-[#C2410C]",
  RETEST: "bg-[#FFEDD5] text-[#C2410C]",
};

const DUE: Record<ReturnType<typeof dueWords>["state"], string> = {
  none: "text-muted-foreground",
  done: "text-[#15803D]",
  late: "text-[#B91C1C]",
  soon: "text-[#92400E]",
  ahead: "text-muted-foreground",
};

/**
 * One module (both areas): its number, name, stage and dates, the
 * stepper, "What's included" with its progress, and its activity. The
 * team adds its controls through the slots; the portal adds the client
 * review box.
 */
export function ModuleCard({
  module,
  number,
  zone,
  audience,
  actions,
  review,
  itemControls,
  addItems,
}: {
  module: ProjectModule;
  /** Its place in the project (1, 2, …). */
  number: number;
  zone: string;
  audience: Audience;
  /** "Move to…" and the "⋯" (team). */
  actions?: React.ReactNode;
  /** "Ready for your review" with Approve / Request changes (portal). */
  review?: React.ReactNode;
  itemControls?: (item: ProjectItem, index: number) => React.ReactNode;
  addItems?: React.ReactNode;
}) {
  const headingId = `module-${module.id}`;
  const due = dueWords(module, todayIn(zone));
  const moves = [...module.history]
    .reverse()
    .map((change) => ({ ...change, module: module.name }));

  return (
    <section
      aria-labelledby={headingId}
      className={cn(projectCard, "flex flex-col gap-5")}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3.5">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] font-heading text-[15px] font-bold",
              BADGE[module.stage] ?? "bg-navy text-white",
            )}
          >
            {number}
          </span>
          <div className="min-w-0">
            <h3
              id={headingId}
              className="flex flex-wrap items-center gap-2 text-[18px] leading-tight font-bold"
            >
              {module.name}
              <LabelPill group="moduleStage" value={module.stage} />
              {module.round > 1 ? (
                <span className="rounded-full bg-[#FFF7ED] px-2.5 py-1 text-xs font-bold text-[#C2410C]">
                  Round {module.round}
                </span>
              ) : null}
              {module.late ? (
                <LabelPill group="moduleFlag" value="LATE" />
              ) : null}
            </h3>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {module.startDate || module.targetDate
                  ? `${module.startDate ? formatDay(module.startDate) : "No start"} → ${
                      module.targetDate
                        ? formatDay(module.targetDate)
                        : "no target"
                    }`
                  : "No dates yet"}
              </span>
              <span className={cn("font-semibold", DUE[due.state])}>
                {due.words}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListChecks aria-hidden="true" className="size-3.5" />
                {module.progress.total
                  ? `${module.progress.done} of ${module.progress.total} items done`
                  : "No items yet"}
              </span>
            </p>
            {module.description ? (
              <p className="mt-2 max-w-[72ch] text-sm leading-[1.6] whitespace-pre-line text-body">
                {module.description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex items-center gap-1.5">{actions}</div>
        ) : null}
      </div>

      {review}

      <div className="rounded-[18px] border border-line-3 bg-[#F8FAFD] px-4 pt-4 pb-3.5">
        <StageStepper module={module} />
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h4 className="text-[15px] font-bold">What&apos;s included</h4>
          <ProgressBar
            progress={module.progress}
            label={module.name}
            className="w-[260px] max-app:w-full"
          />
        </div>
        <div className="mt-3 overflow-hidden rounded-[16px] border border-line-2">
          {module.items.length ? (
            <ul aria-label={`What ${module.name} includes`}>
              {module.items.map((item, index) => (
                <ItemRow key={item.id} item={item} zone={zone}>
                  {itemControls?.(item, index)}
                </ItemRow>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-5 text-center text-sm text-muted-foreground">
              Nothing listed in this module yet.
            </p>
          )}
          {addItems ? (
            <div className="border-t border-line-3">{addItems}</div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line-3 pt-4">
        <details className="group">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-1 text-sm font-bold text-navy-700 hover:text-navy [&::-webkit-details-marker]:hidden">
            <History
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <span className="group-open:hidden">
              Show activity ({moves.length})
            </span>
            <span className="hidden group-open:inline">
              Hide activity ({moves.length})
            </span>
          </summary>
          <div className="mt-4 rounded-[16px] bg-[#F8FAFD] p-4">
            <ModuleActivity
              moves={moves}
              zone={zone}
              audience={audience}
              showModule={false}
              compact
            />
          </div>
        </details>
      </div>
    </section>
  );
}

/** "4 modules", what they are, and the team's "+ Add module". */
export function ModulesIntro({
  count,
  text,
  action,
}: {
  count: number;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-1">
      <div className="max-w-[760px] min-w-0">
        <h2 className="text-[19px] font-bold">
          {count} module{count === 1 ? "" : "s"}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {text}
        </p>
      </div>
      {action}
    </div>
  );
}
