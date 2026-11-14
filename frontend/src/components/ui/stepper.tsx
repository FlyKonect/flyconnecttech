import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The step bar at the top of a multi-step form (New request).
 * Finished steps show a tick, the current step is outlined in navy.
 *
 *   <Stepper steps={["Project", "Request type", "Details", "Review"]} current={2} />
 *
 * `current` counts from 1.
 */
function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol
      data-slot="stepper"
      className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}
    >
      {steps.map((label, index) => {
        const number = index + 1;
        const state =
          number < current ? "done" : number === current ? "current" : "todo";

        return (
          <li
            key={label}
            aria-current={state === "current" ? "step" : undefined}
            className="flex items-center gap-3"
          >
            <span
              aria-hidden="true"
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-[13px] font-bold",
                state === "done" && "border-navy bg-navy text-white",
                state === "current" && "border-navy bg-white text-navy",
                state === "todo" &&
                  "border-stroke bg-white text-muted-foreground",
              )}
            >
              {state === "done" ? <Check className="size-4" /> : number}
            </span>
            <span
              className={cn(
                "text-sm font-bold",
                state === "todo" ? "text-muted-foreground" : "text-navy",
                // On phones only the current step keeps its name.
                state !== "current" && "max-app:sr-only",
              )}
            >
              <span className="sr-only">
                {state === "done" ? "Done: " : `Step ${number}: `}
              </span>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
