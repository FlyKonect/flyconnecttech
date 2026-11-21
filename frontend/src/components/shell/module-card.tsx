import type * as React from "react";

import { ItemRow, projectCard } from "@/components/shell/project-parts";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StageStepper } from "@/components/ui/stage-stepper";
import { formatMessageTime } from "@/lib/format-time";
import { moduleStages } from "@/lib/labels";
import {
  formatDay,
  type ProjectItem,
  type ProjectModule,
} from "@/lib/projects";

/**
 * One module (both areas): its name, stage, round, target, the stepper,
 * its progress and items, and "Show history". The team adds its controls
 * through the slots; the portal adds the client review box.
 */
export function ModuleCard({
  module,
  zone,
  actions,
  review,
  itemControls,
  addItems,
}: {
  module: ProjectModule;
  zone: string;
  /** "Move to…" and the "⋯" (team). */
  actions?: React.ReactNode;
  /** "Ready for your review" with Approve / Request changes (portal). */
  review?: React.ReactNode;
  itemControls?: (item: ProjectItem, index: number) => React.ReactNode;
  addItems?: React.ReactNode;
}) {
  const headingId = `module-${module.id}`;
  return (
    <section
      aria-labelledby={headingId}
      className={`${projectCard} flex flex-col gap-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="flex flex-wrap items-center gap-2 text-[17px] font-bold"
          >
            {module.name}
            <LabelPill group="moduleStage" value={module.stage} />
            {module.round > 1 ? (
              <span className="rounded-full bg-[#FFF7ED] px-2.5 py-1 text-xs font-bold text-[#C2410C]">
                Round {module.round}
              </span>
            ) : null}
            {module.late ? <LabelPill group="moduleFlag" value="LATE" /> : null}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {[
              module.startDate ? `Start ${formatDay(module.startDate)}` : null,
              module.targetDate
                ? `Target ${formatDay(module.targetDate)}`
                : "No target date",
              module.doneAt
                ? `Done ${formatDay(module.doneAt.slice(0, 10))}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {module.description ? (
            <p className="mt-1.5 text-sm leading-[1.6] whitespace-pre-line text-body">
              {module.description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-1.5">{actions}</div>
        ) : null}
      </div>

      {review}

      <StageStepper module={module} />
      <ProgressBar
        progress={module.progress}
        label={module.name}
        className="max-w-[420px]"
      />

      {module.items.length ? (
        <ul aria-label={`What ${module.name} includes`}>
          {module.items.map((item, index) => (
            <ItemRow key={item.id} item={item} zone={zone}>
              {itemControls?.(item, index)}
            </ItemRow>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing listed in this module yet.
        </p>
      )}
      {addItems}

      <details className="group rounded-2xl bg-[#F6F8FC] px-4 py-3">
        <summary className="cursor-pointer text-sm font-bold text-navy-700 marker:text-muted-foreground">
          Show history ({module.history.length})
        </summary>
        <ol className="mt-2 flex flex-col gap-2">
          {[...module.history].reverse().map((change) => (
            <li key={change.id} className="text-[13px] text-body">
              <span className="text-muted-foreground">
                {formatMessageTime(change.createdAt, zone)}
              </span>{" "}
              ·{" "}
              <strong className="font-bold text-navy">
                {moduleStages[change.to].label}
              </strong>
              {change.round > 1 ? ` (round ${change.round})` : ""}
              {change.by ? ` · ${change.by}` : ""}
              {change.note ? (
                <span className="block pl-3 text-muted-foreground">
                  “{change.note}”
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
