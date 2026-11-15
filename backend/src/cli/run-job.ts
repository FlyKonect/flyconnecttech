// Runs one scheduled job. cPanel Cron runs these (docs/deploy.md,
// "Scheduled jobs"); the hosting has no background workers.
//
//   npm run job -- daily-digest
//   npm run job -- auto-close
//   npm run job -- weekly-summary
//
// Live (in the backend folder):
//   node dist/cli/run-job.js daily-digest
//
// Each run prints one line, with the time, for the cron log.
// First: settings from .env, before React loads (see load-env.ts).
import '../config/load-env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { JobsService, type JobResult } from '../jobs/jobs.service.js';

const JOBS: Record<string, (jobs: JobsService) => Promise<JobResult>> = {
  'daily-digest': (jobs) => jobs.dailyDigest(),
  'auto-close': (jobs) => jobs.autoClose(),
  'weekly-summary': (jobs) => jobs.weeklySummary(),
};

const name = process.argv[2] ?? '';
const job = JOBS[name];
if (!job) {
  console.error(
    `Usage: npm run job -- <job>\nJobs: ${Object.keys(JOBS).join(', ')}`,
  );
  process.exit(1);
}

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});

try {
  const result = await job(app.get(JobsService));
  console.log(`${new Date().toISOString()} ${name}: ${result.done}`);
} catch (error) {
  console.error(
    `${new Date().toISOString()} ${name} failed: ${(error as Error).message}`,
  );
  process.exitCode = 1;
} finally {
  await app.close();
}
