import { AuditService } from '../audit/audit.service.js';
import { Module } from '@nestjs/common';
import { uploadMulter } from '../uploads/upload-multer.js';
import { PortalRequestsController } from './portal-requests.controller.js';
import { RequestEventsService } from './request-events.service.js';
import { RequestsService } from './requests.service.js';
import { TeamDashboardService } from './team-dashboard.service.js';
import { TeamRequestsController } from './team-requests.controller.js';
import { TeamRequestsService } from './team-requests.service.js';

@Module({
  imports: [uploadMulter()],
  controllers: [PortalRequestsController, TeamRequestsController],
  providers: [
    RequestsService,
    RequestEventsService,
    TeamRequestsService,
    TeamDashboardService,
    AuditService,
  ],
  exports: [RequestEventsService],
})
export class RequestsModule {}
