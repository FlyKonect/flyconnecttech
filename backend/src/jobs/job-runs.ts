import type { PrismaClient } from '../generated/prisma/client.js';

/**
 * Cron health: each run of a scheduled job is noted in the settings table
 * (key "job:<name>"), so the Settings screen can show when each one last
 * ran and warn when one has stopped (a missing or broken cron line).
 */

const KEY = 'job:';
const HOUR = 60 * 60 * 1000;

/** Each job, when it should run, and how long before it counts as late. */
export const JOB_SCHEDULE = [
  { name: 'daily-digest', every: 'Every day, 08:00', lateAfter: 26 * HOUR },
  {
    name: 'auto-close',
    every: 'Every day, 02:00 (and the clean-up of old data)',
    lateAfter: 26 * HOUR,
  },
  { name: 'weekly-summary', every: 'Mondays, 08:00', lateAfter: 8 * 24 * HOUR },
  { name: 'send-emails', every: 'Every 5 minutes', lateAfter: HOUR / 2 },
] as const;

export type JobRun = { at: string; ok: boolean; done: string };

export async function noteRun(
  prisma: Pick<PrismaClient, 'setting'>,
  name: string,
  run: JobRun,
): Promise<void> {
  const key = `${KEY}${name}`;
  const value = { ...run, done: run.done.slice(0, 300) };
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

/** For the Settings screen: each job's last run, and whether it is late. */
export async function jobHealth(
  prisma: Pick<PrismaClient, 'setting'>,
  now = new Date(),
) {
  const rows = await prisma.setting.findMany({
    where: { key: { startsWith: KEY } },
  });
  return JOB_SCHEDULE.map((job) => {
    const row = rows.find((r) => r.key === `${KEY}${job.name}`);
    const last = (row?.value ?? null) as JobRun | null;
    const late =
      !last || now.getTime() - new Date(last.at).getTime() > job.lateAfter;
    return {
      name: job.name,
      every: job.every,
      lastRun: last?.at ?? null,
      ok: last?.ok ?? null,
      done: last?.done ?? null,
      late,
    };
  });
}
