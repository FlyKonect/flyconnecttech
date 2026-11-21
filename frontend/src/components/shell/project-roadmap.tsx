import { Check, RotateCcw } from "lucide-react";

import { moduleStages, type ModuleStage } from "@/lib/labels";
import {
  dueWords,
  nowWords,
  pathIndex,
  type Audience,
  type Due,
} from "@/lib/module-story";
import { MAIN_PATH, formatDay, type ProjectModule } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * The roadmap (the Timeline tab, both areas), kept simple: one row per
 * module with its five steps as arrows, Design → Development → Testing →
 * Client review → Done. Green with a tick: done (and the day). Dark: the
 * step happening now (amber while it waits for the customer's review,
 * orange while it is being changed or retested). Grey: still to do. The
 * due date sits on the right.
 */

const DUE: Record<Due["state"], string> = {
  none: "text-muted-foreground",
  done: "text-[#15803D]",
  late: "text-[#B91C1C]",
  soon: "text-[#92400E]",
  ahead: "text-body",
};

type StepState = "done" | "now" | "next";

/** The day a step was last reached ("21 Nov"). */
function reachedOn(module: ProjectModule, stage: ModuleStage, zone: string) {
  const change = [...module.history].reverse().find((c) => c.to === stage);
  return change
    ? new Date(change.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: zone,
      })
    : null;
}

/** The arrow's shape: a notch on the left (not the first), a point on the right. */
function arrow(first: boolean, last: boolean) {
  const notch = first ? "0 50%" : "12px 50%";
  const point = last
    ? "100% 0, 100% 100%"
    : "calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%";
  return `polygon(0 0, ${point}, 0 100%, ${notch})`;
}

export function ProjectRoadmap({
  modules,
  today,
  zone,
  audience,
  datesHint,
}: {
  modules: ProjectModule[];
  /** Today where the person is ("2026-11-21"). */
  today: string;
  zone: string;
  audience: Audience;
  /** Under the list when a module has no target date (the team says how). */
  datesHint?: string;
}) {
  const noTarget = modules.some((m) => !m.targetDate && m.stage !== "DONE");
  return (
    <div>
      <ul aria-label="Roadmap" className="flex flex-col gap-3">
        {modules.map((module, index) => {
          const here = pathIndex(module.stage);
          const due = dueWords(module, today);
          const rework =
            module.stage === "CHANGES_REQUESTED" || module.stage === "RETEST";
          return (
            <li
              key={module.id}
              className="rounded-[18px] border border-line-2 bg-white p-4 max-app:p-3.5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                <p className="flex min-w-0 items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-soft text-xs font-bold text-navy"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-[15px] font-bold">
                        {module.name}
                      </span>
                      {module.round > 1 ? (
                        <span className="shrink-0 rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[11px] font-bold text-[#C2410C]">
                          Round {module.round}
                        </span>
                      ) : null}
                    </span>
                    <span className="block text-xs font-semibold text-muted-foreground">
                      {nowWords(module, audience)}
                    </span>
                  </span>
                </p>
                <p className="text-right max-app:pl-[38px] max-app:text-left">
                  <span
                    className={cn(
                      "block text-[13px] font-bold",
                      DUE[due.state],
                    )}
                  >
                    {due.words}
                  </span>
                  {module.targetDate && due.state !== "done" ? (
                    <span className="block text-xs text-muted-foreground">
                      Target {formatDay(module.targetDate)}
                    </span>
                  ) : null}
                </p>
              </div>

              <ol aria-label={`Steps of ${module.name}`} className="flex gap-1">
                {MAIN_PATH.map((stage, step) => {
                  const state: StepState =
                    module.stage === "DONE" || step < here
                      ? "done"
                      : step === here
                        ? "now"
                        : "next";
                  const day =
                    state === "next"
                      ? null
                      : reachedOn(
                          module,
                          state === "now" && rework ? module.stage : stage,
                          zone,
                        );
                  const nowTone =
                    state !== "now"
                      ? ""
                      : rework
                        ? "bg-[#C2410C] text-white"
                        : module.stage === "CLIENT_REVIEW"
                          ? "bg-[#B45309] text-white"
                          : "bg-navy text-white";
                  return (
                    <li
                      key={stage}
                      aria-current={state === "now" ? "step" : undefined}
                      className={cn(
                        "flex h-[52px] min-w-0 flex-1 flex-col justify-center pr-4 pl-5 max-app:h-3 max-app:p-0",
                        step === 0 && "rounded-l-[12px] pl-3.5 max-app:pl-0",
                        step === MAIN_PATH.length - 1 && "rounded-r-[12px]",
                        state === "done" && "bg-[#DCFCE7] text-[#166534]",
                        state === "next" && "bg-[#EEF2F8] text-[#475569]",
                        nowTone,
                      )}
                      style={{
                        clipPath: arrow(
                          step === 0,
                          step === MAIN_PATH.length - 1,
                        ),
                      }}
                    >
                      <span className="flex min-w-0 items-center gap-1 text-[13px] leading-tight font-bold max-app:sr-only">
                        {state === "done" ? (
                          <Check
                            aria-hidden="true"
                            className="size-3.5 shrink-0 max-app:hidden"
                            strokeWidth={3}
                          />
                        ) : state === "now" && rework ? (
                          <RotateCcw
                            aria-hidden="true"
                            className="size-3.5 shrink-0 max-app:hidden"
                            strokeWidth={2.6}
                          />
                        ) : null}
                        <span className="truncate">
                          {moduleStages[stage].label}
                        </span>
                      </span>
                      <span className="truncate text-[11px] leading-tight font-semibold max-app:sr-only">
                        {state === "now"
                          ? rework
                            ? `${module.stage === "RETEST" ? "Retest" : "Changes"} · round ${module.round}`
                            : "Now"
                          : state === "done"
                            ? (day ?? "Done")
                            : "To do"}
                      </span>
                      <span className="sr-only">
                        {state === "done"
                          ? ": done"
                          : state === "now"
                            ? ": happening now"
                            : ": still to do"}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-2.5 text-xs text-body app:hidden">
                {module.stage === "DONE" ? (
                  <span className="font-bold text-[#15803D]">
                    All five steps done
                  </span>
                ) : (
                  <>
                    <span className="font-bold text-navy">
                      {here < 0
                        ? "Not started"
                        : `Now: ${moduleStages[MAIN_PATH[here]].label}`}
                    </span>
                    {MAIN_PATH[here + 1]
                      ? ` · Next: ${moduleStages[MAIN_PATH[here + 1]].label}`
                      : ""}
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-body">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-5 rounded bg-[#DCFCE7]" />
          Done
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-5 rounded bg-navy" />
          Happening now
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-3 w-5 rounded bg-[#EEF2F8]" />
          Still to do
        </span>
        {noTarget && datesHint ? (
          <span className="font-normal text-muted-foreground">{datesHint}</span>
        ) : null}
      </p>
    </div>
  );
}
