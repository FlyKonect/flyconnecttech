import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  EmailChangedEmail,
  emailChangedSubject,
  EmailChangeEmail,
  emailChangeSubject,
} from '../email/templates/email-change.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationsService } from './invitations.service.js';
import { loginKeyFor, normaliseEmail } from './login-key.js';
import {
  hashToken,
  LINK_LIFETIME_HOURS,
  linkExpiry,
  looksLikeToken,
  newToken,
} from './tokens.js';

const ACCOUNT_TX = { isolationLevel: 'ReadCommitted' } as const;

/** Pending changes live in "verifications", like reset links: only the hash. */
export const EMAIL_CHANGE_PREFIX = 'email-change:';

/** by: the team member who asked, for the audit entry. */
type Pending = { userId: string; email: string; by: string };

const firstName = (name: string) => name.split(/\s+/)[0] || name;

/**
 * Changing a person's email (super admins and admins, from Users or the
 * customer page; who may do it to whom: canInviteRole).
 *
 * - Invited, never signed in: the email changes at once and a new
 *   invitation goes to the new address (the old link stops working).
 * - Active: a confirmation link goes to the new address (48 hours, once).
 *   When it is used, the email changes, every session ends, and the old
 *   address gets a notice.
 *
 * An email already used by another account on the same side is refused.
 */
@Injectable()
export class EmailChangeService {
  private readonly siteUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly invitations: InvitationsService,
    private readonly audit: AuditService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  async start(
    actor: SignedIn,
    userId: string,
    rawEmail: string,
  ): Promise<{ result: 'changed' | 'confirmation-sent' }> {
    const email = normaliseEmail(rawEmail);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.status === 'DELETED') throw new NotFoundException();
    if (user.status === 'DISABLED') {
      throw new ConflictException({
        code: 'DISABLED',
        message: 'Enable the account first, then change its email.',
      });
    }
    if (user.email === email) {
      throw new ConflictException({
        code: 'SAME_EMAIL',
        message: 'That is already their email address.',
      });
    }
    await this.mustBeFree(email, user.side, user.id);

    if (user.status === 'INVITED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { email, loginEmail: loginKeyFor(email, user.side) },
        });
        await this.recordChange(tx, actor.id, user.id, user.email, email);
      }, ACCOUNT_TX);
      // The new invitation revokes the old link, sent to the old address.
      await this.invitations.resendInvitation(user.id, actor.id);
      return { result: 'changed' };
    }

    const { token, hash } = newToken();
    await this.prisma.$transaction(async (tx) => {
      // One pending change per person: a new one replaces the old.
      await tx.verification.deleteMany({
        where: {
          identifier: { startsWith: EMAIL_CHANGE_PREFIX },
          value: { contains: `"userId":"${user.id}"` },
        },
      });
      await tx.verification.create({
        data: {
          identifier: EMAIL_CHANGE_PREFIX + hash,
          value: JSON.stringify({
            userId: user.id,
            email,
            by: actor.id,
          } satisfies Pending),
          expiresAt: linkExpiry(),
        },
      });
    }, ACCOUNT_TX);

    const link = `${this.siteUrl}/confirm-email/${token}`;
    await this.email.send({
      to: email,
      subject: emailChangeSubject,
      retry: false,
      template: (
        <EmailChangeEmail
          siteUrl={this.siteUrl}
          firstName={firstName(user.name)}
          newEmail={email}
          link={link}
          expiresInHours={LINK_LIFETIME_HOURS}
        />
      ),
    });
    return { result: 'confirmation-sent' };
  }

  /** What the confirmation page shows: the new address. */
  async details(token: string): Promise<{ email: string }> {
    const { pending } = await this.findUsable(token);
    return { email: pending.email };
  }

  /** The link was used: the email changes, every session ends. */
  async confirm(token: string): Promise<{ area: 'portal' | 'team' }> {
    const { row, pending } = await this.findUsable(token);
    const user = await this.prisma.user.findUnique({
      where: { id: pending.userId },
    });
    if (!user || user.status !== 'ACTIVE') throw linkGone();
    await this.mustBeFree(pending.email, user.side, user.id);

    await this.prisma.$transaction(async (tx) => {
      const used = await tx.verification.deleteMany({
        where: { id: row.id, expiresAt: { gt: new Date() } },
      });
      if (used.count !== 1) throw linkGone();
      await tx.user.update({
        where: { id: user.id },
        data: {
          email: pending.email,
          loginEmail: loginKeyFor(pending.email, user.side),
        },
      });
      await tx.session.deleteMany({ where: { userId: user.id } });
      await this.recordChange(
        tx,
        pending.by,
        user.id,
        user.email,
        pending.email,
      );
    }, ACCOUNT_TX);

    // A notice to the old address, in case the change was not expected.
    try {
      await this.email.send({
        to: user.email,
        subject: emailChangedSubject,
        template: (
          <EmailChangedEmail
            siteUrl={this.siteUrl}
            firstName={firstName(user.name)}
            newEmail={pending.email}
          />
        ),
      });
    } catch {
      // Kept for another try by EmailService; the change itself is done.
    }
    return { area: user.role === 'CUSTOMER' ? 'portal' : 'team' };
  }

  private async mustBeFree(
    email: string,
    side: 'CUSTOMER' | 'TEAM',
    userId: string,
  ) {
    const taken = await this.prisma.user.findFirst({
      where: { email, side, NOT: { id: userId } },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'Another account already uses this email address.',
      });
    }
  }

  private async recordChange(
    tx: Parameters<Parameters<PrismaService['$transaction']>[0]>[0],
    actorId: string,
    userId: string,
    from: string,
    to: string,
  ) {
    await this.audit.record(
      {
        actorId,
        action: 'user.emailChanged',
        entityType: 'user',
        entityId: userId,
        data: { from, to },
      },
      tx,
    );
  }

  private async findUsable(token: string) {
    if (!looksLikeToken(token)) throw linkGone();
    const row = await this.prisma.verification.findFirst({
      where: { identifier: EMAIL_CHANGE_PREFIX + hashToken(token) },
    });
    if (!row || row.expiresAt <= new Date()) throw linkGone();
    return { row, pending: JSON.parse(row.value) as Pending };
  }
}

function linkGone() {
  return new GoneException({
    code: 'LINK_NOT_VALID',
    message: 'This link has expired or has already been used.',
  });
}
