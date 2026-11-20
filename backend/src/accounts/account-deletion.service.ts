import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { Prisma } from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { canInviteRole } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  moveStatus,
  REQUEST_TX,
  stateSelect,
  systemLine,
} from '../requests/request-writes.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import type { ResponseTargets } from '../settings/defaults.js';
import { SettingsService } from '../settings/settings.service.js';
import { deletedAddress, markDeleted } from './deleted-marks.js';
import { RESET_LINK_PREFIX } from './password-reset.service.js';

/**
 * Deleting team users and customers (docs/01, "Delete"). The account is
 * deleted for good: no sign-in (password, two-factor, sessions, links),
 * no personal details, gone from the lists, and its email can be used
 * again. Its history stays: requests, replies, files, estimates and lead
 * notes keep their author, shown with "(deleted)" after the name. The old
 * email is kept apart (deletedEmail) so adding it again can offer to
 * restore that history (InvitationsService.inviteUser).
 *
 * Who: super admins and admins (users.delete / customers.delete), with the
 * same limits as Disable: never yourself, and admins never a super admin.
 */
@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Delete a team user. Their open requests become unassigned and go back
   * to Under Review; open leads they owned (and demos they hosted) go back
   * to nobody, so the team picks them up.
   */
  async deleteTeamUser(actor: SignedIn, userId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!target || target.role === 'CUSTOMER' || target.status === 'DELETED') {
      throw new NotFoundException();
    }
    if (target.id === actor.id) {
      throw new ConflictException({
        code: 'CANNOT_DELETE_SELF',
        message: "You can't delete your own account.",
      });
    }
    if (!canInviteRole(actor, target.role)) {
      throw new ForbiddenException({
        code: 'NOT_ALLOWED',
        message: 'Only a super admin can delete a super admin.',
      });
    }

    const targets = await this.settings.get('responseTargets');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const assigned = await this.releaseWork(tx, {
        target,
        actor,
        reason: 'deleted',
        now,
        targets,
      });

      await this.erase(tx, target, now);
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'user.deleted',
          entityType: 'user',
          entityId: target.id,
          data: {
            email: target.email,
            role: target.role,
            was: target.status,
            unassignedRequests: assigned,
          },
        },
        tx,
      );
    }, REQUEST_TX);
    return { ok: true };
  }

  /**
   * Delete a customer: its contact's account goes as above, the customer
   * leaves the lists, and its open requests are closed (the customer is
   * not emailed: their account is gone). Projects and requests stay.
   */
  async deleteCustomer(actor: SignedIn, customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        company: true,
        deletedAt: true,
        contactUser: {
          select: { id: true, name: true, email: true, status: true },
        },
      },
    });
    if (!customer || customer.deletedAt) throw new NotFoundException();

    const targets = await this.settings.get('responseTargets');
    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const open = await tx.supportRequest.findMany({
        where: { customerId: customer.id, status: { in: [...OPEN_STATUSES] } },
        select: stateSelect,
      });
      for (const request of open) {
        await moveStatus(tx, request, 'CLOSED', {
          actorId: actor.id,
          line: 'Closed because the customer account was deleted',
          now,
          targets,
        });
      }

      if (customer.contactUser && customer.contactUser.status !== 'DELETED') {
        await this.erase(tx, customer.contactUser, now);
      }
      await tx.customer.update({
        where: { id: customer.id },
        data: { deletedAt: now, company: markDeleted(customer.company, 160) },
      });
      await this.audit.record(
        {
          actorId: actor.id,
          action: 'customer.deleted',
          entityType: 'customer',
          entityId: customer.id,
          data: {
            company: customer.company,
            email: customer.contactUser?.email ?? null,
            closedRequests: open.map((request) => request.code),
          },
        },
        tx,
      );
    }, REQUEST_TX);
    return { ok: true };
  }

  /** Under Review, with a line saying why; already there: just the line. */
  /**
   * A team member leaves (deleted or disabled): their open requests go to
   * another active developer (transferTo), or become unassigned and go
   * back to Under Review, each with a line in the conversation. Open leads
   * they owned and demos they hosted go back to nobody. Returns the codes
   * of the requests that moved.
   */
  async releaseWork(
    tx: Prisma.TransactionClient,
    work: {
      target: { id: string; name: string };
      actor: SignedIn;
      reason: 'deleted' | 'disabled';
      now: Date;
      targets: ResponseTargets;
      transferTo?: { id: string; name: string } | null;
    },
  ): Promise<string[]> {
    const { target, actor, reason, now, targets, transferTo } = work;
    const assigned = await tx.supportRequest.findMany({
      where: { assigneeId: target.id, status: { in: [...OPEN_STATUSES] } },
      select: stateSelect,
    });
    for (const request of assigned) {
      await tx.supportRequest.update({
        where: { id: request.id },
        data: { assigneeId: transferTo?.id ?? null },
      });
      if (transferTo) {
        const line = `Transferred from ${target.name} to ${transferTo.name} by ${actor.name} (${target.name}'s account was ${reason})`;
        await systemLine(tx, request.id, line, now);
      } else {
        const line = `Unassigned because ${target.name}'s account was ${reason}`;
        await this.backToReview(tx, request, line, actor.id, now, targets);
      }
    }
    if (transferTo && assigned.length > 0) {
      const count = assigned.length;
      const what = count === 1 ? '1 request' : `${count} requests`;
      await this.notifications.notify(
        [transferTo.id],
        {
          kind: 'info',
          text: `${what} transferred to you from ${target.name}`,
          href: '/team/requests',
        },
        tx,
      );
    }

    await tx.demoRequest.updateMany({
      where: { ownerId: target.id, status: { in: ['NEW', 'SCHEDULED'] } },
      data: { ownerId: null },
    });
    await tx.demoRequest.updateMany({
      where: { hostId: target.id, status: { in: ['NEW', 'SCHEDULED'] } },
      data: { hostId: null },
    });
    await tx.quoteRequest.updateMany({
      where: {
        ownerId: target.id,
        status: { in: ['NEW', 'REVIEWING', 'ESTIMATE_SENT'] },
      },
      data: { ownerId: null },
    });
    await tx.contactMessage.updateMany({
      where: { ownerId: target.id, status: { in: ['NEW', 'REPLIED'] } },
      data: { ownerId: null },
    });
    return assigned.map((request) => request.code);
  }

  private async backToReview(
    tx: Prisma.TransactionClient,
    request: Prisma.SupportRequestGetPayload<{ select: typeof stateSelect }>,
    line: string,
    actorId: string,
    now: Date,
    targets: ResponseTargets,
  ) {
    if (request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW') {
      await systemLine(tx, request.id, line, now);
      return;
    }
    await moveStatus(tx, request, 'UNDER_REVIEW', {
      actorId,
      line,
      now,
      targets,
    });
  }

  /**
   * The account itself: every way in removed, personal details erased, the
   * name kept (marked deleted) for the history, the email set aside.
   */
  private async erase(
    tx: Prisma.TransactionClient,
    user: { id: string; name: string; email: string },
    now: Date,
  ) {
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.twoFactor.deleteMany({ where: { userId: user.id } });
    await tx.invitation.updateMany({
      where: { userId: user.id, usedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    await tx.verification.deleteMany({
      where: { value: user.id, identifier: { startsWith: RESET_LINK_PREFIX } },
    });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.user.update({
      where: { id: user.id },
      data: {
        status: 'DELETED',
        deletedAt: now,
        deletedEmail: user.email,
        email: deletedAddress(user.id),
        loginEmail: deletedAddress(user.id),
        name: markDeleted(user.name, 120),
        emailVerified: false,
        twoFactorEnabled: false,
        phone: null,
        country: null,
        jobTitle: null,
        image: null,
        emailPrefs: Prisma.DbNull,
        lastActiveAt: null,
      },
    });
  }
}
