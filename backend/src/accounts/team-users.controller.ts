import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { canInviteRole, TEAM_ROLES } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AccountDeletionService } from './account-deletion.service.js';
import { EmailChangeService } from './email-change.service.js';
import { InvitationsService } from './invitations.service.js';
import { PasswordResetService } from './password-reset.service.js';
import { TeamUsersService } from './team-users.service.js';

const emailSchema = z.object({
  email: z.email('Enter a valid email address').max(191),
});

const roleSchema = z.object({
  role: z.enum(TEAM_ROLES, 'Choose a role'),
});

/** Disable user: who takes over their open requests (none: unassigned). */
const disableSchema = z
  .object({ transferTo: z.string().max(36).nullish() })
  .optional();

const newUserSchema = z.object({
  name: z.string().trim().min(1, 'Enter their name').max(120),
  email: z.email('Enter a valid email address').max(191),
  jobTitle: z.string().trim().max(120).optional(),
  role: z.enum(TEAM_ROLES, 'Choose a role'),
  // The answer to "This email belonged to an account that was deleted".
  previous: z.enum(['restore', 'fresh']).optional(),
});

/**
 * Account actions the team takes on other people's accounts: the Users
 * screens (29, 30), and Resend invitation / Send password reset link, which
 * the customer page and the Users list both use.
 */
@Area('team')
@Controller('team/users')
export class TeamUsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
    private readonly passwords: PasswordResetService,
    private readonly users: TeamUsersService,
    private readonly deletion: AccountDeletionService,
    private readonly emailChanges: EmailChangeService,
  ) {}

  @Can('users.view')
  @Get()
  list(@CurrentUser() actor: SignedIn) {
    return this.users.list(actor);
  }

  @Can('users.invite')
  @Get('roles')
  roles(@CurrentUser() actor: SignedIn) {
    return this.users.roles(actor);
  }

  /** Add user. Admins can't add a super admin (canInviteRole). */
  @Can('users.invite')
  @Post()
  invite(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: newUserSchema }) body: z.infer<typeof newUserSchema>,
  ) {
    return this.users.invite(actor, body);
  }

  /** Change a team member's role (same limits as Add user). */
  @Can('users.invite')
  @Post(':id/role')
  @HttpCode(200)
  changeRole(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: roleSchema }) body: z.infer<typeof roleSchema>,
  ) {
    return this.users.changeRole(actor, id, body.role);
  }

  /**
   * Reset two-step sign-in (super admins): their authenticator and backup
   * codes are removed and they are signed out; they set it up again at
   * their next sign-in.
   */
  @Can('users.resetTwoFactor')
  @Post(':id/two-factor-reset')
  @HttpCode(200)
  resetTwoFactor(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.users.resetTwoFactor(actor, id);
  }

  /** Enable a disabled account: Active again, or Invited if never activated. */
  @Can('users.invite')
  @Post(':id/enable')
  @HttpCode(200)
  enable(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.users.enable(actor, id);
  }

  /** Body (optional): `transferTo`, the developer who takes over their open requests. */
  @Can('users.invite')
  @Post(':id/disable')
  @HttpCode(200)
  disable(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: disableSchema }) body: z.infer<typeof disableSchema>,
  ) {
    return this.users.disable(actor, id, body?.transferTo);
  }

  /**
   * Delete user: the account goes for good, its history stays (marked
   * deleted). Same limits as Disable: not yourself, admins never a super
   * admin.
   */
  @Can('users.delete')
  @Post(':id/delete')
  @HttpCode(200)
  delete(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.deletion.deleteTeamUser(actor, id);
  }

  /** Resend the invitation. The old link stops working. */
  @Post(':id/invitation')
  @HttpCode(202)
  async resendInvitation(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
  ) {
    await this.mayManage(actor, id);
    await this.invitations.resendInvitation(id, actor.id);
    return { ok: true };
  }

  /**
   * Change their email: at once for someone still invited (with a new
   * invitation), otherwise a confirmation link to the new address.
   */
  @Post(':id/email')
  @HttpCode(200)
  async changeEmail(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: emailSchema }) body: z.infer<typeof emailSchema>,
  ) {
    await this.mayManage(actor, id);
    return this.emailChanges.start(actor, id, body.email);
  }

  /** Email a password reset link. */
  @Post(':id/password-reset')
  @HttpCode(202)
  async sendPasswordReset(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
  ) {
    await this.mayManage(actor, id);
    await this.passwords.sendByTeam(id, actor.id);
    return { ok: true };
  }

  /** The same rule as adding the person: role by role (policies.ts). */
  private async mayManage(actor: SignedIn, targetId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { role: true, status: true },
    });
    if (!target || target.status === 'DELETED') throw new NotFoundException();
    if (!canInviteRole(actor, target.role)) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }
  }
}
