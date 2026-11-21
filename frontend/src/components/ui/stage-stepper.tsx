import { Check, RotateCcw } from "lucide-react";

import { moduleStages } from "@/lib/labels";
import { stepperSteps, type ProjectModule } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * Where a module has reached: Design · Development · Testing · Client
 * review · Done. Done steps are ticked with their day, the current one is
 * highlighted (with "Changes requested" or "Retest" and the round when it
 * is being reworked), later ones are grey. Across on wide screens, down on
 * phones.
 *
 *   <StageStepper module={module} />
 */
function StageStepper({
  module,
  className,
}: {
  module: Pick<ProjectModule, "name" | "stage" | "round" | "history">;
  className?: string;
}) {
  const steps = stepperSteps(module);
  return (
    <ol
      data-slot="stage-stepper"
      aria-label={`Stages of ${module.name}`}
      className={cn(
        "flex gap-0 max-app:flex-col max-app:gap-2.5 app:items-start",
        className,
      )}
    >
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.stage}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex min-w-0 flex-1 gap-2.5 app:flex-col app:items-center app:text-center"
          >
            {/* The line to the next step (wide screens). */}
            {last ? null : (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-[13px] left-[calc(50%+16px)] h-0.5 w-[calc(100%-32px)] max-app:hidden",
                  step.state === "done" ? "bg-[#16A34A]" : "bg-line-2",
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-[1] inline-flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                step.state === "done" &&
                  "border-[#16A34A] bg-[#16A34A] text-white",
                step.state === "current" &&
                  (step.rework
                    ? "border-[#EA580C] bg-[#FFF7ED] text-[#C2410C]"
                    : "border-navy bg-navy text-white"),
                step.state === "next" &&
                  "border-line-2 bg-white text-muted-foreground",
              )}
            >
              {step.state === "done" ? (
                <Check className="size-4" strokeWidth={3} />
              ) : step.rework ? (
                <RotateCcw className="size-3.5" strokeWidth={2.5} />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0 app:mt-1.5">
              <span
                className={cn(
                  "block text-[13px] font-bold",
                  step.state === "next" ? "text-muted-foreground" : "text-navy",
                )}
              >
                {moduleStages[step.stage].label}
              </span>
              {step.rework ? (
                <span className="block text-xs font-bold text-[#C2410C]">
                  {moduleStages[step.rework].label} · Round {module.round}
                </span>
              ) : null}
              {step.at ? (
                <span className="block text-xs text-muted-foreground">
                  {dayOf(step.at)}
                </span>
              ) : null}
              <span className="sr-only">
                {step.state === "done"
                  ? ", done"
                  : step.state === "current"
                    ? ", current stage"
                    : ", still to come"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "21 Nov" (the day only: the timeline below shows the full time). */
function dayOf(when: string): string {
  return new Date(when).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  });
}

export { StageStepper };
