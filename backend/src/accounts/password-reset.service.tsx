import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from 'better-auth/crypto';
import { AuditService } from '../audit/audit.service.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  PasswordResetEmail,
  passwordResetSubject,
} from '../email/templates/password-reset.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  LINK_LIFETIME_HOURS,
  hashToken,
  linkExpiry,
  looksLikeToken,
  newToken,
} from './tokens.js';

/**
 * Account changes run with the database's lighter locking (read committed).
 * With MariaDB's default, two people asking for links at the same moment
 * could block each other's "replace the old link" step and one would fail.
 */
const ACCOUNT_TX = { isolationLevel: 'ReadCommitted' } as const;

/**
 * Reset links are kept in Better Auth's "verifications" table, but in our
 * own way: only a hash of the link is stored, each link works once, a new
 * link replaces the old one, and links last 48 hours.
 */
export const RESET_LINK_PREFIX = 'password-reset:';

/** A person gets at most one reset email per minute, however often they ask. */
const MIN_SECONDS_BETWEEN_EMAILS = 60;

@Injectable()
export class PasswordResetService {
  private readonly siteUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  /**
   * "Forgot password". Says nothing about whether the email has an account:
   * it quietly does nothing for unknown, invited or disabled accounts.
   */
  async requestByEmail(rawEmail: string): Promise<void> {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE') return;

    const recent = await this.prisma.verification.findFirst({
      where: {
        value: user.id,
        identifier: { startsWith: RESET_LINK_PREFIX },
        createdAt: {
          gt: new Date(Date.now() - MIN_SECONDS_BETWEEN_EMAILS * 1000),
        },
      },
    });
    if (recent) return;

    await this.send(user.id, false);
  }

  /** An admin sends a reset link from the customer page. */
  async sendByTeam(userId: string, sentById: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.status !== 'ACTIVE') {
      throw new GoneException({
        code: 'NOT_ACTIVE',
        message: 'This account is not active. Resend the invitation instead.',
      });
    }
    await this.send(user.id, true);
    await this.audit.record({
      actorId: sentById,
      action: 'passwordReset.sent',
      entityType: 'user',
      entityId: user.id,
    });
  }

  /** What the "Reset password" page shows. */
  async details(token: string): Promise<{ email: string }> {
    const row = await this.findUsable(token);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: row.value },
    });
    return { email: user.email };
  }

  /**
   * Sets the new password, uses up the link, and signs the person out
   * everywhere, in case someone else had their old password.
   */
  async reset(
    token: string,
    password: string,
  ): Promise<{ area: 'portal' | 'team' }> {
    const row = await this.findUsable(token);
    const passwordHash = await hashPassword(password);

    return this.prisma.$transaction(async (tx) => {
      const used = await tx.verification.deleteMany({
        where: { id: row.id, expiresAt: { gt: new Date() } },
      });
      if (used.count !== 1) throw linkGone();

      const user = await tx.user.findUniqueOrThrow({
        where: { id: row.value },
      });
      if (user.status !== 'ACTIVE') throw linkGone();

      const updated = await tx.account.updateMany({
        where: { userId: user.id, providerId: 'credential' },
        data: { password: passwordHash },
      });
      if (updated.count !== 1) throw linkGone();

      await tx.session.deleteMany({ where: { userId: user.id } });
      return { area: user.role === 'CUSTOMER' ? 'portal' : 'team' } as const;
    }, ACCOUNT_TX);
  }

  // ---------------------------------------------------------------- helpers

  private async send(userId: string, sentByTeam: boolean): Promise<void> {
    const { token, hash } = newToken();
    const user = await this.prisma.$transaction(async (tx) => {
      await tx.verification.deleteMany({
        where: { value: userId, identifier: { startsWith: RESET_LINK_PREFIX } },
      });
      await tx.verification.create({
        data: {
          identifier: RESET_LINK_PREFIX + hash,
          value: userId,
          expiresAt: linkExpiry(),
        },
      });
      return tx.user.findUniqueOrThrow({ where: { id: userId } });
    }, ACCOUNT_TX);

    const link = `${this.siteUrl}/reset-password/${token}`;
    await this.email.send({
      to: user.email,
      subject: passwordResetSubject,
      template: (
        <PasswordResetEmail
          siteUrl={this.siteUrl}
          firstName={user.name.split(/\s+/)[0] || user.name}
          link={link}
          expiresInHours={LINK_LIFETIME_HOURS}
          sentByTeam={sentByTeam}
        />
      ),
    });
  }

  private async findUsable(token: string) {
    if (!looksLikeToken(token)) throw linkGone();
    const row = await this.prisma.verification.findFirst({
      where: { identifier: RESET_LINK_PREFIX + hashToken(token) },
    });
    if (!row || row.expiresAt <= new Date()) throw linkGone();
    return row;
  }
}

function linkGone() {
  return new GoneException({
    code: 'LINK_NOT_VALID',
    message: 'This link has expired or has already been used.',
  });
}
