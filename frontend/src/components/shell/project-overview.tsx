import type * as React from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  CheckCircle2,
  Eye,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import {
  dueWords,
  nowWords,
  pathIndex,
  todayIn,
  type Audience,
} from "@/lib/module-story";
import { MAIN_PATH, formatDay, type ProjectModule } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * The Overview tab's parts that both areas share: the card frame with its
 * heading and link, "Needs attention" (what waits for review, is being
 * changed or is late) and the modules at a glance.
 */

/** A card with a heading, an optional line under it and a link at the right. */
export function OverviewCard({
  id,
  title,
  note,
  link,
  className,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  link?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={cn(projectCard, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={id} className="text-[17px] font-bold">
            {title}
          </h2>
          {note ? (
            <p className="mt-0.5 text-[13px] text-muted-foreground">{note}</p>
          ) : null}
        </div>
        {link ? (
          <Link
            href={link.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-bold text-gold-text transition-colors hover:bg-[#FBF6E6]"
          >
            {link.label}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Alert = {
  key: string;
  icon: LucideIcon;
  tone: string;
  title: React.ReactNode;
  text: string;
  action?: { href: string; label: string };
};

/**
 * What needs someone now: modules waiting for review, being changed, or
 * past their target. Shows "All on track" when nothing does.
 */
export function AttentionCard({
  modules,
  zone,
  audience,
  modulesHref,
}: {
  modules: ProjectModule[];
  zone: string;
  audience: Audience;
  modulesHref: string;
}) {
  if (!modules.length) return null;
  const today = todayIn(zone);
  const alerts: Alert[] = [];
  for (const part of modules) {
    if (part.stage === "CLIENT_REVIEW") {
      alerts.push({
        key: `${part.id}-review`,
        icon: Eye,
        tone: "bg-[#FEF3C7] text-[#92400E]",
        title: <strong className="font-bold">{part.name}</strong>,
        text:
          audience === "customer"
            ? "is ready for your review. Approve it, or tell us what should change."
            : "is with the customer for review.",
        action:
          audience === "customer"
            ? { href: modulesHref, label: "Review now" }
            : undefined,
      });
    }
    if (part.stage === "CHANGES_REQUESTED" || part.stage === "RETEST") {
      alerts.push({
        key: `${part.id}-changes`,
        icon: RotateCcw,
        tone: "bg-[#FFEDD5] text-[#C2410C]",
        title: <strong className="font-bold">{part.name}</strong>,
        text:
          part.stage === "RETEST"
            ? `is being tested again after changes (round ${part.round}).`
            : `is being changed (round ${part.round}).`,
      });
    }
    const due = dueWords(part, today);
    if (due.state === "late") {
      alerts.push({
        key: `${part.id}-late`,
        icon: AlarmClock,
        tone: "bg-[#FEE2E2] text-[#B91C1C]",
        title: <strong className="font-bold">{part.name}</strong>,
        text: `is ${due.words}: its target was ${formatDay(part.targetDate)}.`,
      });
    }
  }

  return (
    <OverviewCard
      id="attention-heading"
      title="Needs attention"
      note={
        alerts.length
          ? `${alerts.length} thing${alerts.length === 1 ? "" : "s"} to look at`
          : undefined
      }
    >
      {alerts.length ? (
        <ul className="flex flex-col gap-2.5">
          {alerts.map((alert) => (
            <li
              key={alert.key}
              className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line-2 px-3.5 py-3"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-9 shrink-0 items-center justify-center rounded-[11px]",
                  alert.tone,
                )}
              >
                <alert.icon className="size-[18px]" />
              </span>
              <p className="min-w-0 flex-[1_1_220px] text-sm leading-snug text-body">
                {alert.title} {alert.text}
              </p>
              {alert.action ? (
                <Link
                  href={alert.action.href}
                  className="inline-flex h-9 items-center rounded-[10px] bg-navy px-3.5 text-[13px] font-bold text-white hover:bg-navy/90"
                >
                  {alert.action.label}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2.5 rounded-[14px] bg-[#F0FDF4] px-3.5 py-3 text-sm font-semibold text-[#15803D]">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          All on track: nothing is late or waiting.
        </p>
      )}
    </OverviewCard>
  );
}

const DOT: Partial<Record<ProjectModule["stage"], string>> = {
  DONE: "bg-[#22C55E]",
  CLIENT_REVIEW: "bg-[#F59E0B]",
  CHANGES_REQUESTED: "bg-[#F97316]",
  RETEST: "bg-[#F97316]",
};

/** Each module on one line: where it is, a five-dot track, the target. */
export function ModulesGlance({
  modules,
  zone,
  audience,
}: {
  modules: ProjectModule[];
  zone: string;
  audience: Audience;
}) {
  const today = todayIn(zone);
  return (
    <ul className="flex flex-col">
      {modules.map((module, index) => {
        const here = pathIndex(module.stage);
        const due = dueWords(module, today);
        return (
          <li
            key={module.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-1 border-t border-line-3 py-3.5 first:border-t-0 first:pt-0 last:pb-0"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-[10px] bg-soft text-[13px] font-bold text-navy"
            >
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold">
                {module.name}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {module.stage === "DONE"
                  ? null
                  : `${nowWords(module, audience)} · `}
                <span
                  className={cn(
                    due.state === "late" && "font-semibold text-[#B91C1C]",
                    due.state === "done" && "font-semibold text-[#15803D]",
                  )}
                >
                  {due.words}
                </span>
              </span>
            </span>
            <span className="flex flex-col items-end gap-1.5">
              <span aria-hidden="true" className="flex gap-1">
                {MAIN_PATH.map((stage, step) => (
                  <span
                    key={stage}
                    className={cn(
                      "h-2 w-5 rounded-full max-app:w-3.5",
                      module.stage === "DONE" || step < here
                        ? "bg-[#22C55E]"
                        : step === here
                          ? (DOT[module.stage] ?? "bg-navy")
                          : "bg-[#E3E9F5]",
                    )}
                  />
                ))}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {module.progress.percent === null
                  ? "No items"
                  : `${module.progress.percent}% of items`}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
