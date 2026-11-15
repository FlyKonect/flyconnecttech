import { Module } from '@nestjs/common';
import { RequestsModule } from '../requests/requests.module.js';
import { JobsService } from './jobs.service.js';

/** The scheduled jobs, run by cPanel Cron (src/cli/run-job.ts). */
@Module({
  imports: [RequestsModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
