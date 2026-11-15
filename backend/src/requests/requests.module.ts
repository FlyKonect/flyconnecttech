import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MulterModule,
  type MulterModuleOptions,
} from '@nestjs/platform-express';
import type { Env } from '../config/env.js';
import { uploadTempDir } from '../uploads/file-storage.service.js';
import { MAX_FILE_BYTES, MAX_FILES } from '../uploads/upload-rules.js';
import { PortalRequestsController } from './portal-requests.controller.js';
import { RequestEventsService } from './request-events.service.js';
import { RequestsService } from './requests.service.js';
import { TeamDashboardService } from './team-dashboard.service.js';
import { TeamRequestsController } from './team-requests.controller.js';
import { TeamRequestsService } from './team-requests.service.js';

@Module({
  imports: [
    // Files are written to UPLOAD_DIR/tmp while a request is handled (not
    // kept in memory: the hosting has little), then checked and moved.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const options: MulterModuleOptions & { defParamCharset: string } = {
          dest: uploadTempDir(config.get('UPLOAD_DIR')),
          limits: {
            fileSize: MAX_FILE_BYTES,
            files: MAX_FILES,
            fields: 20,
            fieldSize: 64 * 1024,
          },
          // File names with accents or other scripts arrive intact.
          defParamCharset: 'utf8',
        };
        return options;
      },
    }),
  ],
  controllers: [PortalRequestsController, TeamRequestsController],
  providers: [
    RequestsService,
    RequestEventsService,
    TeamRequestsService,
    TeamDashboardService,
  ],
  exports: [RequestEventsService],
})
export class RequestsModule {}
