import { CalendarClock } from "lucide-react";

import { LabelPill } from "@/components/ui/pill";
import { formatWhen } from "@/lib/format-time";
import type { JobState } from "@/lib/labels";

const stateOf = (job: JobHealth): JobState =>
  job.ok === false
    ? "failed"
    : job.late
      ? job.lastRun
        ? "late"
        : "never"
      : "onTime";

export type JobHealth = {
  name: string;
  every: string;
  lastRun: string | null;
  ok: boolean | null;
  done: string | null;
  late: boolean;
};

/**
 * Settings: the scheduled jobs (cPanel Cron), when each last ran, and a
 * warning when one has stopped or failed: usually a missing or broken cron
 * line (docs/deploy.md, Step 15).
 */
export function ScheduledJobs({
  jobs,
  timeZone,
}: {
  jobs: JobHealth[];
  timeZone: string;
}) {
  const trouble = jobs.some((job) => job.late || job.ok === false);
  return (
    <section
      aria-labelledby="scheduled-jobs"
      className="rounded-[22px] border border-line-2 bg-white p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-navy-700"
        >
          <CalendarClock className="size-[21px]" strokeWidth={1.9} />
        </span>
        <div>
          <h2 id="scheduled-jobs" className="text-[17px] font-bold">
            Scheduled jobs
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {trouble
              ? "A job has not run when it should, or its last run failed. Check its line in cPanel > Cron Jobs (docs/deploy.md, Step 15)."
              : "Every job ran on time."}
          </p>
        </div>
      </div>
      <ul className="mt-4 flex flex-col">
        {jobs.map((job) => (
          <li
            key={job.name}
            className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-t border-line-3 py-3 first:border-t-0"
          >
            <span className="min-w-0">
              <span className="block font-bold">{job.name}</span>
              <span className="block text-xs text-muted-foreground">
                {job.every}
              </span>
              {job.done ? (
                <span className="mt-0.5 block text-xs break-words text-body">
                  {job.done}
                </span>
              ) : null}
            </span>
            <span className="flex flex-col items-end gap-1 text-right">
              <LabelPill group="jobState" value={stateOf(job)} />
              <span className="text-xs text-muted-foreground">
                {job.lastRun
                  ? `Last run ${formatWhen(job.lastRun, timeZone)}`
                  : "No run recorded yet"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
