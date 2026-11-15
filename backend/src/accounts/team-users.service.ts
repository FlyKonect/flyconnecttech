import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import type { UserStatus } from '../generated/prisma/client.js';
import {
  canInviteRole,
  TEAM_ROLES,
  type TeamRole,
} from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import { InvitationsService } from './invitations.service.js';
import { RESET_LINK_PREFIX } from './password-reset.service.js';

const ACCOUNT_TX = { isolationLevel: 'ReadCommitted' } as const;

/** Active people first, then invited, then disabled. */
const STATUS_ORDER: Record<UserStatus, number> = {
  ACTIVE: 0,
  INVITED: 1,
  DISABLED: 2,
};

export type NewTeamUser = {
  name: string;
  email: string;
  jobTitle?: string;
  role: TeamRole;
};

/**
 * The Users screens (docs/01, section 5 "Users", screens 29 and 30): the
 * team list with its role tiles, adding a team member, and disabling one.
 * Who may manage whom follows canInviteRole (policies.ts) both ways.
 */
@Injectable()
export class TeamUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitations: InvitationsService,
    private readonly audit: AuditService,
  ) {}

  async list(actor: SignedIn) {
    const users = await this.prisma.user.findMany({
      where: { role: { in: [...TEAM_ROLES] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
        status: true,
        lastActiveAt: true,
        invitedAt: true,
      },
    });
    const loads = await this.prisma.supportRequest.groupBy({
      by: ['assigneeId'],
      where: {
        assigneeId: {
          in: users.filter((u) => u.role === 'DEVELOPER').map((u) => u.id),
        },
        status: { in: [...OPEN_STATUSES] },
      },
      _count: { _all: true },
    });

    const rank = (role: string) => TEAM_ROLES.indexOf(role as TeamRole);
    const rows = users
      .sort(
        (a, b) =>
          rank(a.role) - rank(b.role) ||
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.name.localeCompare(b.name),
      )
      .map((user) => ({
        ...user,
        openAssigned:
          user.role === 'DEVELOPER'
            ? (loads.find((load) => load.assigneeId === user.id)?._count._all ??
              0)
            : null,
        // The "⋯" menu: never for yourself, never above your own rank.
        canManage: user.id !== actor.id && canInviteRole(actor, user.role),
      }));

    const count = (role: TeamRole | null, status: UserStatus) =>
      users.filter(
        (u) => (role === null || u.role === role) && u.status === status,
      ).length;
    return {
      summary: {
        active: count(null, 'ACTIVE'),
        invited: count(null, 'INVITED'),
      },
      byRole: Object.fromEntries(
        TEAM_ROLES.map((role) => [
          role,
          { active: count(role, 'ACTIVE'), invited: count(role, 'INVITED') },
        ]),
      ) as Record<TeamRole, { active: number; invited: number }>,
      rows,
    };
  }

  /** Add user: creates the invited account and emails the invitation. */
  async invite(actor: SignedIn, input: NewTeamUser) {
    if (!canInviteRole(actor, input.role)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only a super admin can add another super admin.',
      });
    }
    const { userId, emailSent } = await this.invitations.inviteUser(
      {
        name: input.name,
        email: input.email,
        role: input.role,
        jobTitle: input.jobTitle,
      },
      actor.id,
    );
    return { id: userId, emailSent };
  }

  /**
   * Disable user: they are signed out everywhere at once, can't sign in
   * again, and any open invitation or reset link stops working. Their
   * requests stay assigned to them until someone transfers them.
   */
  async disable(actor: SignedIn, userId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!target || target.role === 'CUSTOMER') throw new NotFoundException();
    if (target.id === actor.id) {
      throw new ConflictException({
        code: 'CANNOT_DISABLE_SELF',
        message: "You can't disable your own account.",
      });
    }
    if (!canInviteRole(actor, target.role)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only a super admin can disable a super admin.',
      });
    }
    if (target.status === 'DISABLED') return { ok: true };

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: target.id, status: { not: 'DISABLED' } },
        data: { status: 'DISABLED' },
      });
      // Someone else disabled them a moment ago.
      if (changed.count !== 1) return;
      await tx.session.deleteMany({ where: { userId: target.id } });
      await tx.invitation.updateMany({
        where: { userId: target.id, usedAt: null, revokedAt: null },
        data: { revokedAt: now },
      });
      await tx.verification.deleteMany({
        where: {
          value: target.id,
          identifier: { startsWith: RESET_LINK_PREFIX },
        },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'user.disabled',
          entityType: 'user',
          entityId: target.id,
          data: { email: target.email, role: target.role, was: target.status },
        },
        tx,
      );
    }, ACCOUNT_TX);
    return { ok: true };
  }
}
