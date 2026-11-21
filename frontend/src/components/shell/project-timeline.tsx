import {
  AlarmClock,
  CheckCircle2,
  Eye,
  Hammer,
  type LucideIcon,
} from "lucide-react";

import { ModuleActivity } from "@/components/shell/module-activity";
import { projectCard } from "@/components/shell/project-parts";
import { ProjectRoadmap } from "@/components/shell/project-roadmap";
import { dueWords, todayIn, type Audience } from "@/lib/module-story";
import type { ProjectModule } from "@/lib/projects";
import { cn } from "@/lib/utils";

/** The latest steps shown at once; the rest open with "Show … earlier". */
const RECENT = 8;

/**
 * A project's Timeline tab (both areas):
 *  1. the numbers: modules done, being worked on, waiting for review, late;
 *  2. the roadmap: each module on a calendar, its bar cut into the stages
 *     it went through (as long as each took), the plan, what is still to
 *     do and today (project-roadmap.tsx);
 *  3. what happened, day by day, in plain words.
 */
export function ProjectTimeline({
  modules,
  zone,
  audience,
  datesHint,
}: {
  modules: ProjectModule[];
  zone: string;
  audience: Audience;
  /** Under the roadmap when some modules have no dates (the team says how). */
  datesHint?: string;
}) {
  const today = todayIn(zone);
  const moves = modules
    .flatMap((module) =>
      module.history.map((change) => ({ ...change, module: module.name })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col gap-5">
      <Summary modules={modules} today={today} audience={audience} />

      <section aria-labelledby="roadmap-heading" className={projectCard}>
        <div className="mb-5">
          <h2 id="roadmap-heading" className="text-[17px] font-bold">
            Roadmap
          </h2>
          <p className="mt-1 max-w-[760px] text-sm text-muted-foreground">
            Where each module has reached, step by step, and what is still to
            do.
          </p>
        </div>
        <ProjectRoadmap
          modules={modules}
          today={today}
          zone={zone}
          audience={audience}
          datesHint={datesHint}
        />
      </section>

      <section aria-labelledby="happened-heading" className={projectCard}>
        <h2 id="happened-heading" className="text-[17px] font-bold">
          What happened
        </h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">
          Every step each module took, newest first.
        </p>
        <ModuleActivity
          moves={moves.slice(0, RECENT)}
          zone={zone}
          audience={audience}
        />
        {moves.length > RECENT ? (
          <details className="group mt-5 border-t border-line-3 pt-4">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full bg-soft px-3.5 py-2 text-[13px] font-bold text-navy hover:bg-tint [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">
                Show {moves.length - RECENT} earlier steps
              </span>
              <span className="hidden group-open:inline">Earlier steps</span>
            </summary>
            <div className="mt-4">
              <ModuleActivity
                moves={moves.slice(RECENT)}
                zone={zone}
                audience={audience}
              />
            </div>
          </details>
        ) : null}
      </section>
    </div>
  );
}

function Summary({
  modules,
  today,
  audience,
}: {
  modules: ProjectModule[];
  today: string;
  audience: Audience;
}) {
  const done = modules.filter((m) => m.stage === "DONE").length;
  const review = modules.filter((m) => m.stage === "CLIENT_REVIEW").length;
  const working = modules.filter(
    (m) => !["NOT_STARTED", "DONE", "CLIENT_REVIEW"].includes(m.stage),
  ).length;
  const late = modules.filter(
    (m) => dueWords(m, today).state === "late",
  ).length;

  const tiles: {
    label: string;
    value: string;
    note: string;
    icon: LucideIcon;
    tone: string;
  }[] = [
    {
      label: "Modules done",
      value: `${done} of ${modules.length}`,
      note: modules.length
        ? `${Math.round((done / modules.length) * 100)}% of the modules`
        : "",
      icon: CheckCircle2,
      tone: "bg-[#DCFCE7] text-[#15803D]",
    },
    {
      label: "Being worked on",
      value: String(working),
      note: "In progress now",
      icon: Hammer,
      tone: "bg-[#E3E9F5] text-[#0C3584]",
    },
    {
      label: audience === "customer" ? "Waiting for you" : "Waiting for review",
      value: String(review),
      note: audience === "customer" ? "Ready to approve" : "With the customer",
      icon: Eye,
      tone: "bg-[#FEF3C7] text-[#92400E]",
    },
    {
      label: "Late",
      value: String(late),
      note: late ? "Past the target date" : "All on time",
      icon: AlarmClock,
      tone: late
        ? "bg-[#FEE2E2] text-[#B91C1C]"
        : "bg-[#F1F5F9] text-[#475569]",
    },
  ];

  return (
    <ul
      aria-label="Modules in numbers"
      className="grid grid-cols-4 gap-3 max-[1100px]:grid-cols-2"
    >
      {tiles.map((tile) => (
        <li
          key={tile.label}
          className="flex items-center gap-3.5 rounded-[18px] border border-line-2 bg-white p-4 max-app:gap-2.5 max-app:p-3"
        >
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] max-app:size-9 max-app:rounded-[11px]",
              tile.tone,
            )}
          >
            <tile.icon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold text-muted-foreground">
              {tile.label}
            </span>
            <span className="block font-heading text-[22px] leading-tight font-bold max-app:text-[18px]">
              {tile.value}
            </span>
            {tile.note ? (
              <span className="block text-xs text-muted-foreground max-app:hidden">
                {tile.note}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
