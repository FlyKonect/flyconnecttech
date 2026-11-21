import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { uploadMulter } from '../uploads/upload-multer.js';
import { PortalProjectsController } from './portal-projects.controller.js';
import { PortalProjectsService } from './portal-projects.service.js';
import { ProjectEventsService } from './project-events.service.js';
import { ProjectsService } from './projects.service.js';
import { TeamProjectsController } from './team-projects.controller.js';

/** Projects: the team's Projects menu and pages, and the portal's My Projects. */
@Module({
  imports: [uploadMulter()],
  controllers: [TeamProjectsController, PortalProjectsController],
  providers: [
    ProjectsService,
    PortalProjectsService,
    ProjectEventsService,
    AuditService,
  ],
})
export class ProjectsModule {}
