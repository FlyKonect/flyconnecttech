import {
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { Area, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { canInviteRole } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationsService } from './invitations.service.js';
import { PasswordResetService } from './password-reset.service.js';

/**
 * Account actions the team takes on someone else's account. The buttons come
 * in Phase 7 (customer page, users list); the rules apply already.
 */
@Area('team')
@Controller('team/users')
export class TeamUsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
    private readonly passwords: PasswordResetService,
  ) {}

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
    await this.passwords.sendByTeam(id);
    return { ok: true };
  }

  /** The same rule as adding the person: role by role (policies.ts). */
  private async mayManage(actor: SignedIn, targetId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { role: true },
    });
    if (!target) throw new NotFoundException();
    if (!canInviteRole(actor, target.role)) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }
  }
}
