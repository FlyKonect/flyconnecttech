import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { TeamWebsiteController } from './team-website.controller.js';
import { WebsiteController } from './website.controller.js';
import { WebsiteService } from './website.service.js';

/** Website content: testimonials and the live-project link. */
@Module({
  controllers: [WebsiteController, TeamWebsiteController],
  providers: [WebsiteService, AuditService],
})
export class WebsiteModule {}
