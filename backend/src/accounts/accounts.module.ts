import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { RateLimitGuard } from '../rate-limit/rate-limit.js';
import { AccountDeletionService } from './account-deletion.service.js';
import { EmailChangeService } from './email-change.service.js';
import { AccountsController } from './accounts.controller.js';
import { InvitationsService } from './invitations.service.js';
import { MeController } from './me.controller.js';
import { PasswordResetService } from './password-reset.service.js';
import { SessionStatusController } from './session-status.controller.js';
import {
  PasswordController,
  SessionsController,
  ProfileController,
  TeamProfileController,
} from './profile.controller.js';
import { ProfileService } from './profile.service.js';
import { TeamUsersController } from './team-users.controller.js';
import { TeamUsersService } from './team-users.service.js';

@Module({
  controllers: [
    AccountsController,
    MeController,
    TeamUsersController,
    SessionStatusController,
    ProfileController,
    TeamProfileController,
    PasswordController,
    SessionsController,
  ],
  providers: [
    AccountDeletionService,
    EmailChangeService,
    InvitationsService,
    PasswordResetService,
    ProfileService,
    TeamUsersService,
    AuditService,
    RateLimitGuard,
  ],
  exports: [AccountDeletionService, InvitationsService, PasswordResetService],
})
export class AccountsModule {}
