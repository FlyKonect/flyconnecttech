import {
  ArrowRight,
  Check,
  Eye,
  FlaskConical,
  Plus,
  RotateCcw,
  Undo2,
  type LucideIcon,
} from "lucide-react";

import { initials } from "@/components/ui/avatar";
import { LabelPill } from "@/components/ui/pill";
import { addDays } from "@/lib/calendar";
import {
  movePhrase,
  todayIn,
  type Audience,
  type MoveKind,
} from "@/lib/module-story";
import type { StageChange } from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * What happened to modules, as a feed (both areas): a rail down the left
 * with the days on it (Today, Yesterday, Thursday 19 Nov); each step is a
 * card saying who did what to which module ("Emma Clarke moved Payments
 * on to Testing"), the stage it went from and to, the time, and the note
 * when there is one. The Timeline tab shows every module's; a module card
 * its own (`compact`).
 */

const KINDS: Record<
  MoveKind,
  { icon: LucideIcon; badge: string; card: string }
> = {
  added: {
    icon: Plus,
    badge: "bg-[#F1F5F9] text-[#475569]",
    card: "border-line-2",
  },
  forward: {
    icon: ArrowRight,
    badge: "bg-[#E3E9F5] text-[#0C3584]",
    card: "border-line-2",
  },
  back: {
    icon: Undo2,
    badge: "bg-[#F1F5F9] text-[#475569]",
    card: "border-line-2",
  },
  review: {
    icon: Eye,
    badge: "bg-[#FEF3C7] text-[#92400E]",
    card: "border-[#FDE68A]",
  },
  changes: {
    icon: RotateCcw,
    badge: "bg-[#FFEDD5] text-[#C2410C]",
    card: "border-[#FED7AA]",
  },
  retest: {
    icon: FlaskConical,
    badge: "bg-[#CCFBF1] text-[#0F766E]",
    card: "border-line-2",
  },
  done: {
    icon: Check,
    badge: "bg-[#DCFCE7] text-[#15803D]",
    card: "border-[#BBF7D0]",
  },
  reset: {
    icon: RotateCcw,
    badge: "bg-[#F1F5F9] text-[#475569]",
    card: "border-line-2",
  },
};

export type ActivityMove = StageChange & { module: string };

function dayLabel(day: string, today: string, when: string, zone: string) {
  const date = new Date(when).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: zone,
  });
  if (day === today) return `Today · ${date}`;
  if (day === addDays(today, -1)) return `Yesterday · ${date}`;
  return new Date(when).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: zone,
  });
}

export function ModuleActivity({
  moves,
  zone,
  audience,
  showModule = true,
  compact = false,
}: {
  /** Newest first. */
  moves: ActivityMove[];
  zone: string;
  audience: Audience;
  /** Names the module in each line (not inside its own card). */
  showModule?: boolean;
  compact?: boolean;
}) {
  if (!moves.length) {
    return <p className="text-sm text-muted-foreground">Nothing yet.</p>;
  }
  const today = todayIn(zone);
  const days: { day: string; label: string; moves: ActivityMove[] }[] = [];
  for (const move of moves) {
    const day = new Date(move.createdAt).toLocaleDateString("en-CA", {
      timeZone: zone,
    });
    const last = days[days.length - 1];
    if (last?.day === day) last.moves.push(move);
    else {
      days.push({
        day,
        label: dayLabel(day, today, move.createdAt, zone),
        moves: [move],
      });
    }
  }

  const rail = compact ? "left-[15px]" : "left-[19px]";
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={cn("absolute top-3 bottom-3 w-0.5 rounded bg-line-2", rail)}
      />
      <div className="relative flex flex-col gap-5">
        {days.map((group) => (
          <section key={group.day} aria-label={group.label}>
            <h4
              className={cn(
                "relative mb-3 inline-flex items-center rounded-full border border-line-2 bg-white px-3 py-1 text-[11.5px] font-bold text-navy shadow-[0_1px_2px_rgba(2,26,84,0.06)]",
                compact ? "ml-0" : "ml-0",
              )}
            >
              {group.label}
            </h4>
            <ol className="flex flex-col gap-3">
              {group.moves.map((move) => {
                const phrase = movePhrase(move, audience);
                const kind = KINDS[phrase.kind];
                const Icon = kind.icon;
                const who = move.by ?? "Someone";
                return (
                  <li key={move.id} className="relative flex gap-3.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-[1] inline-flex shrink-0 items-center justify-center rounded-full border-[3px] border-white font-bold shadow-[0_0_0_1px_rgba(2,26,84,0.08)]",
                        compact ? "size-8 text-[11px]" : "size-10 text-[13px]",
                        move.by ? "bg-navy text-white" : kind.badge,
                      )}
                    >
                      {move.by ? (
                        initials(move.by)
                      ) : (
                        <Icon className="size-4" />
                      )}
                      <span
                        className={cn(
                          "absolute -right-1 -bottom-1 inline-flex size-[18px] items-center justify-center rounded-full border-2 border-white",
                          kind.badge,
                        )}
                      >
                        <Icon className="size-2.5" strokeWidth={3} />
                      </span>
                    </span>
                    <div
                      className={cn(
                        "min-w-0 flex-1 rounded-[14px] border bg-white",
                        compact ? "px-3 py-2.5" : "px-4 py-3",
                        kind.card,
                      )}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                        <p
                          className={cn(
                            "min-w-0 leading-snug text-body",
                            compact ? "text-[13px]" : "text-sm",
                          )}
                        >
                          <strong className="font-bold text-navy">{who}</strong>{" "}
                          {phrase.before}{" "}
                          <strong className="font-bold text-navy">
                            {showModule ? move.module : "this module"}
                          </strong>
                          {phrase.after
                            ? phrase.after.startsWith(",")
                              ? phrase.after
                              : ` ${phrase.after}`
                            : ""}
                        </p>
                        <time
                          dateTime={move.createdAt}
                          className="shrink-0 text-xs font-semibold text-muted-foreground"
                        >
                          {new Date(move.createdAt).toLocaleTimeString(
                            "en-GB",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: zone,
                            },
                          )}
                        </time>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {move.from ? (
                          <>
                            <LabelPill group="moduleStage" value={move.from} />
                            <ArrowRight
                              aria-label="to"
                              className="size-3.5 text-muted-foreground"
                            />
                          </>
                        ) : null}
                        <LabelPill group="moduleStage" value={move.to} />
                      </div>
                      {move.note ? (
                        <blockquote className="mt-2.5 rounded-[10px] border-l-[3px] border-[#F59E0B] bg-[#FFFBEB] px-3 py-2 text-[13px] leading-relaxed text-[#78350F]">
                          “{move.note}”
                        </blockquote>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
