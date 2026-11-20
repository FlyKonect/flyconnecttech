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
import { InvitationsService } from './invitations.service.js';
import { PasswordResetService } from './password-reset.service.js';
import { TeamUsersService } from './team-users.service.js';

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

  @Can('users.invite')
  @Post(':id/disable')
  @HttpCode(200)
  disable(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.users.disable(actor, id);
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
