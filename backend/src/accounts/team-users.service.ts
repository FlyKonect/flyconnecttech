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
  can,
  canInviteRole,
  PERMISSIONS,
  TEAM_ROLES,
  type TeamRole,
} from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import { SettingsService } from '../settings/settings.service.js';
import { AccountDeletionService } from './account-deletion.service.js';
import { InvitationsService } from './invitations.service.js';
import { RESET_LINK_PREFIX } from './password-reset.service.js';

const ACCOUNT_TX = { isolationLevel: 'ReadCommitted' } as const;

/** Active people first, then invited, then disabled. */
const STATUS_ORDER: Record<UserStatus, number> = {
  ACTIVE: 0,
  INVITED: 1,
  DISABLED: 2,
  DELETED: 3,
};

export type NewTeamUser = {
  name: string;
  email: string;
  jobTitle?: string;
  role: TeamRole;
  /** The answer to "This email belonged to an account that was deleted". */
  previous?: 'restore' | 'fresh';
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
    private readonly deletion: AccountDeletionService,
    private readonly settings: SettingsService,
  ) {}

  async list(actor: SignedIn) {
    const users = await this.prisma.user.findMany({
      // Deleted accounts are history only: never in the list.
      where: { role: { in: [...TEAM_ROLES] }, status: { not: 'DELETED' } },
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
        canDelete:
          user.id !== actor.id &&
          can(actor, 'users.delete') &&
          canInviteRole(actor, user.role),
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

  /**
   * For the Add user screen: the roles this person may give, and the
   * permission table ("What each role can do"), straight from policies.ts.
   */
  roles(actor: SignedIn) {
    return {
      canInvite: TEAM_ROLES.filter((role) => canInviteRole(actor, role)),
      permissions: PERMISSIONS,
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
        previous: input.previous,
      },
      actor.id,
    );
    return { id: userId, emailSent };
  }

  /**
   * Disable user: they are signed out everywhere at once, can't sign in
   * again, and any open invitation or reset link stops working. Their open
   * requests go to `transferTo` (an active developer) or back to Under
   * Review unassigned, and their open leads go back to nobody, so no work
   * waits on someone who has left.
   */
  async disable(actor: SignedIn, userId: string, transferTo?: string | null) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!target || target.role === 'CUSTOMER' || target.status === 'DELETED') {
      throw new NotFoundException();
    }
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

    const receiver = transferTo
      ? await this.prisma.user.findFirst({
          where: {
            id: transferTo,
            role: 'DEVELOPER',
            status: 'ACTIVE',
            NOT: { id: target.id },
          },
          select: { id: true, name: true },
        })
      : null;
    if (transferTo && !receiver) {
      throw new ConflictException({
        code: 'NOT_A_DEVELOPER',
        message: 'Choose an active developer to take over the requests.',
      });
    }

    const targets = await this.settings.get('responseTargets');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: target.id, status: { not: 'DISABLED' } },
        data: { status: 'DISABLED' },
      });
      // Someone else disabled them a moment ago.
      if (changed.count !== 1) return;
      const moved = await this.deletion.releaseWork(tx, {
        target,
        actor,
        reason: 'disabled',
        now,
        targets,
        transferTo: receiver,
      });
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
          data: {
            email: target.email,
            role: target.role,
            was: target.status,
            ...(receiver
              ? { transferredRequests: moved, transferredTo: receiver.id }
              : { unassignedRequests: moved }),
          },
        },
        tx,
      );
    }, ACCOUNT_TX);
    return { ok: true };
  }

  /**
   * Change role: the same limits as adding (canInviteRole for the old and
   * the new role), never yourself. Only developers hold requests: a
   * developer who becomes something else hands their open requests back
   * (Under Review, unassigned); someone who becomes a developer hands back
   * the leads they owned. It applies from their next click (SessionGuard
   * reads the role every time).
   */
  async changeRole(actor: SignedIn, userId: string, role: TeamRole) {
    const target = await this.manageable(actor, userId, 'change the role of');
    if (!canInviteRole(actor, role)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only a super admin can make someone a super admin.',
      });
    }
    if (target.role === role) return { ok: true };

    const targets = await this.settings.get('responseTargets');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: target.id, role: target.role },
        data: { role },
      });
      if (changed.count !== 1) return;
      const involvesDeveloper =
        target.role === 'DEVELOPER' || role === 'DEVELOPER';
      const unassigned = involvesDeveloper
        ? await this.deletion.releaseWork(tx, {
            target,
            actor,
            reason: 'notDeveloper',
            now,
            targets,
          })
        : [];
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'user.roleChanged',
          entityType: 'user',
          entityId: target.id,
          data: {
            email: target.email,
            from: target.role,
            to: role,
            unassignedRequests: unassigned,
          },
        },
        tx,
      );
    }, ACCOUNT_TX);
    return { ok: true };
  }

  /**
   * Enable a disabled account. Someone who had activated it can sign in
   * again with their old password; someone who never did goes back to
   * Invited, and needs Resend invitation (their old link stays revoked).
   */
  async enable(actor: SignedIn, userId: string) {
    const target = await this.manageable(actor, userId, 'enable');
    if (target.status !== 'DISABLED') return { status: target.status };
    const activated = await this.prisma.account.count({
      where: { userId: target.id, providerId: 'credential' },
    });
    const status: UserStatus = activated > 0 ? 'ACTIVE' : 'INVITED';
    await this.prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: { id: target.id, status: 'DISABLED' },
        data: { status },
      });
      if (changed.count !== 1) return;
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'user.enabled',
          entityType: 'user',
          entityId: target.id,
          data: { email: target.email, role: target.role, now: status },
        },
        tx,
      );
    }, ACCOUNT_TX);
    return { status };
  }

  /** A team user this person may manage: not deleted, not yourself, not above you. */
  private async manageable(actor: SignedIn, userId: string, what: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!target || target.role === 'CUSTOMER' || target.status === 'DELETED') {
      throw new NotFoundException();
    }
    if (target.id === actor.id) {
      throw new ConflictException({
        code: 'NOT_YOURSELF',
        message: `You can't ${what} your own account.`,
      });
    }
    if (!canInviteRole(actor, target.role)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: `Only a super admin can ${what} a super admin.`,
      });
    }
    return target as typeof target & { role: TeamRole };
  }
}
