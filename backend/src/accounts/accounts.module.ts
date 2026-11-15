import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { RateLimitGuard } from '../rate-limit/rate-limit.js';
import { AccountsController } from './accounts.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MeController } from './me.controller.js';
import { PasswordResetService } from './password-reset.service.js';
import { PasswordController, ProfileController } from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { TeamUsersController } from './team-users.controller.js';

@Module({
  controllers: [
    AccountsController,
    MeController,
    TeamUsersController,
    ProfileController,
    PasswordController,
  ],
  providers: [
    InvitationsService,
    PasswordResetService,
    ProfileService,
    AuditService,
    RateLimitGuard,
  ],
  exports: [InvitationsService, PasswordResetService],
})
export class AccountsModule {}
