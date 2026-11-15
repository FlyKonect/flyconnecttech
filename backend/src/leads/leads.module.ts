import { Module } from '@nestjs/common';
import { RateLimitGuard } from '../rate-limit/rate-limit.js';
import { LeadActionsService } from './lead-actions.service.js';
import { LeadEventsService } from './lead-events.service.js';
import { PublicLeadsController } from './public-leads.controller.js';
import { PublicLeadsService } from './public-leads.service.js';
import { TeamLeadsController } from './team-leads.controller.js';
import { TeamLeadsService } from './team-leads.service.js';

/** Website leads: the public forms and the team's side (docs/01 §2 and §6). */
@Module({
  controllers: [PublicLeadsController, TeamLeadsController],
  providers: [
    PublicLeadsService,
    TeamLeadsService,
    LeadActionsService,
    LeadEventsService,
    RateLimitGuard,
  ],
})
export class LeadsModule {}
