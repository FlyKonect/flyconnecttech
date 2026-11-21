import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { uploadMulter } from '../uploads/upload-multer.js';
import { PortalProjectsController } from './portal-projects.controller.js';
import { PortalProjectsService } from './portal-projects.service.js';
import { ProjectEventsService } from './project-events.service.js';
import { ModulesService } from './modules.service.js';
import { ProjectsService } from './projects.service.js';
import { TeamProjectsController } from './team-projects.controller.js';
import { TopicEventsService } from './topic-events.service.js';
import {
  PortalDiscussionsController,
  TeamDiscussionsController,
  TeamInternalDiscussionsController,
} from './topics.controller.js';
import { TopicsService } from './topics.service.js';

/** Projects: the team's Projects menu and pages, and the portal's My Projects. */
@Module({
  imports: [uploadMulter()],
  controllers: [
    TeamProjectsController,
    PortalProjectsController,
    TeamDiscussionsController,
    TeamInternalDiscussionsController,
    PortalDiscussionsController,
  ],
  providers: [
    ProjectsService,
    ModulesService,
    PortalProjectsService,
    ProjectEventsService,
    TopicsService,
    TopicEventsService,
    AuditService,
  ],
})
export class ProjectsModule {}
