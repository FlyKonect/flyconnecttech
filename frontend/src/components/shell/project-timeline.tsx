import { ArrowRight } from "lucide-react";

import { LabelPill } from "@/components/ui/pill";
import { formatMessageTime } from "@/lib/format-time";
import { moduleStages } from "@/lib/labels";
import { formatDay, type ProjectModule } from "@/lib/projects";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

const dayNumber = (day: string) =>
  Date.UTC(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10)),
  ) / DAY;

const todayIn = (zone: string) =>
  new Date().toLocaleDateString("en-CA", { timeZone: zone });

/**
 * A project's timeline (both areas): each module as a row with its bar
 * from start to target, a line for today and its stage; then every stage
 * move, newest first. Modules without dates show their stage only.
 */
export function ProjectTimeline({
  modules,
  zone,
}: {
  modules: ProjectModule[];
  zone: string;
}) {
  const today = todayIn(zone);
  const starts = (module: ProjectModule) =>
    module.startDate ?? module.history[0]?.createdAt.slice(0, 10) ?? null;
  const dated = modules.filter((m) => m.targetDate || m.startDate);
  const days = dated.flatMap((m) =>
    [starts(m), m.targetDate].filter((d): d is string => Boolean(d)),
  );
  const first = days.length ? Math.min(...days.map(dayNumber)) : 0;
  const last = days.length
    ? Math.max(...days.map(dayNumber), dayNumber(today))
    : 0;
  const span = Math.max(1, last - first);
  const at = (day: string) =>
    Math.min(100, Math.max(0, ((dayNumber(day) - first) / span) * 100));

  const moves = modules
    .flatMap((module) =>
      module.history.map((change) => ({ ...change, module: module.name })),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <ul aria-label="Modules over time" className="flex flex-col">
        {modules.map((module) => {
          const start = starts(module);
          const end = module.targetDate ?? today;
          const hasBar = Boolean(dated.length && start);
          return (
            <li
              key={module.id}
              className="grid grid-cols-[minmax(160px,220px)_1fr] items-center gap-x-4 gap-y-1.5 border-t border-line-3 py-3 first:border-t-0 max-app:grid-cols-1"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {module.name}
                </span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  <LabelPill group="moduleStage" value={module.stage} />
                  {module.late ? (
                    <LabelPill group="moduleFlag" value="LATE" />
                  ) : null}
                </span>
              </span>
              <span className="min-w-0">
                {hasBar && start ? (
                  <span
                    aria-hidden="true"
                    className="relative block h-3 rounded-full bg-soft"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 rounded-full",
                        module.stage === "DONE"
                          ? "bg-[#16A34A]"
                          : module.late
                            ? "bg-[#DC2626]"
                            : "bg-navy",
                        !module.targetDate && "opacity-50",
                      )}
                      style={{
                        left: `${at(start)}%`,
                        width: `${Math.max(2, at(end) - at(start))}%`,
                      }}
                    />
                    <span
                      className="absolute -inset-y-1 w-0.5 rounded bg-gold"
                      style={{ left: `${at(today)}%` }}
                    />
                  </span>
                ) : null}
                <span className="mt-1 block text-xs text-muted-foreground">
                  {[
                    start ? `Started ${formatDay(start)}` : "Not started yet",
                    module.targetDate
                      ? `target ${formatDay(module.targetDate)}`
                      : "no target date",
                    module.doneAt
                      ? `done ${formatDay(module.doneAt.slice(0, 10))}`
                      : null,
                    module.round > 1 ? `round ${module.round}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {dated.length ? (
        <p className="-mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span aria-hidden="true" className="h-3 w-0.5 rounded bg-gold" />
          Today, {formatDay(today)}
        </p>
      ) : null}

      <section aria-labelledby="timeline-moves">
        <h3 id="timeline-moves" className="text-[15px] font-bold">
          Every move
        </h3>
        {moves.length ? (
          <ol className="mt-2 flex flex-col">
            {moves.map((move) => (
              <li
                key={move.id}
                className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-line-3 py-2.5 text-sm first:border-t-0"
              >
                <span className="w-[130px] shrink-0 text-xs text-muted-foreground">
                  {formatMessageTime(move.createdAt, zone)}
                </span>
                <span className="font-bold">{move.module}</span>
                <span className="inline-flex items-center gap-1.5 text-body">
                  {move.from ? (
                    <>
                      {moduleStages[move.from].label}
                      <ArrowRight
                        aria-label="to"
                        className="size-3.5 text-muted-foreground"
                      />
                    </>
                  ) : null}
                  <strong className="font-bold text-navy">
                    {moduleStages[move.to].label}
                  </strong>
                  {move.round > 1 ? (
                    <span className="text-xs">(round {move.round})</span>
                  ) : null}
                </span>
                {move.by ? (
                  <span className="text-xs text-muted-foreground">
                    by {move.by}
                  </span>
                ) : null}
                {move.note ? (
                  <span className="basis-full pl-[140px] text-[13px] text-body max-app:pl-0">
                    “{move.note}”
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No moves yet.</p>
        )}
      </section>
    </div>
  );
}
