import {
  ConflictException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hashPassword } from 'better-auth/crypto';
import type { Env } from '../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { EmailService } from '../email/email.service.js';
import {
  InvitationEmail,
  invitationSubject,
} from '../email/templates/invitation.js';
import type { Role } from '../generated/prisma/client.js';
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

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  DEVELOPER: 'Developer',
  CUSTOMER: 'Customer',
};

export type InviteUserInput = {
  name: string;
  email: string;
  role: Role;
  /** Team members only. */
  jobTitle?: string;
  /** Customers only: the company, which becomes the customer record. */
  company?: string;
  country?: string;
  phone?: string;
};

export type InvitationDetails = {
  email: string;
  name: string;
  phone: string | null;
  area: 'portal' | 'team';
  roleLabel: string;
  company: string | null;
};

/**
 * Invitations (docs/01, section 3): invite-only accounts, activated from an
 * emailed link that works once and expires after 48 hours.
 * Callers check who may invite whom (policies.ts) before calling these.
 */
@Injectable()
export class InvitationsService {
  private readonly siteUrl: string;
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  /**
   * Creates an invited account and emails the invitation.
   * `invitedById` is empty only for the first super admin.
   * Returns the link as well, for the command line.
   */
  async inviteUser(
    input: InviteUserInput,
    invitedById: string | null,
  ): Promise<{ userId: string; link: string; emailSent: boolean }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'There is already an account with this email.',
      });
    }
    if (input.role === 'CUSTOMER' && !input.company?.trim()) {
      throw new ConflictException({
        code: 'COMPANY_REQUIRED',
        message: 'A customer account needs a company.',
      });
    }

    const userId = await this.prisma.$transaction(async (tx) => {
      let customerId: string | null = null;
      if (input.role === 'CUSTOMER') {
        const customer = await tx.customer.create({
          data: {
            company: input.company!.trim(),
            country: input.country?.trim() || null,
            createdById: invitedById,
          },
        });
        customerId = customer.id;
        await this.audit.record(
          {
            actorId: invitedById,
            action: 'customer.created',
            entityType: 'customer',
            entityId: customer.id,
            data: { company: customer.company },
          },
          tx,
        );
      }

      const user = await tx.user.create({
        data: {
          name: input.name.trim(),
          email,
          role: input.role,
          status: 'INVITED',
          jobTitle:
            input.role === 'CUSTOMER' ? null : input.jobTitle?.trim() || null,
          country: input.country?.trim() || null,
          phone: input.phone?.trim() || null,
          customerId,
          invitedAt: new Date(),
          createdById: invitedById,
        },
      });
      await this.audit.record(
        {
          actorId: invitedById,
          action: 'user.invited',
          entityType: 'user',
          entityId: user.id,
          data: { email, role: input.role },
        },
        tx,
      );
      return user.id;
    }, ACCOUNT_TX);

    // The account exists now, so a broken email server must not hide the
    // link: the command line prints it (the very first super admin).
    const { link, emailSent } = await this.sendInvitation(userId, invitedById);
    return { userId, link, emailSent };
  }

  /**
   * Sends a new invitation. Any open invitation for the same person stops
   * working. Only for accounts that are still waiting to be activated.
   */
  async resendInvitation(userId: string, sentById: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    if (user.status !== 'INVITED') {
      throw new ConflictException({
        code: 'ALREADY_ACTIVE',
        message:
          'This account is already active. Send a password reset link instead.',
      });
    }
    const { link, emailSent } = await this.sendInvitation(userId, sentById);
    if (!emailSent) {
      throw new ServiceUnavailableException({
        code: 'EMAIL_NOT_SENT',
        message:
          'The invitation email could not be sent. Please try again later.',
      });
    }
    await this.audit.record({
      actorId: sentById,
      action: 'invitation.resent',
      entityType: 'user',
      entityId: userId,
    });
    return link;
  }

  /** What the "Set your password" page shows. 404 for any link that cannot be used. */
  async details(token: string): Promise<InvitationDetails> {
    const invitation = await this.findUsable(token);
    const { user } = invitation;
    return {
      email: user.email,
      name: user.name,
      phone: user.phone,
      area: user.role === 'CUSTOMER' ? 'portal' : 'team',
      roleLabel: ROLE_LABELS[user.role],
      company: user.customer?.company ?? null,
    };
  }

  /**
   * Activates the account: sets the password, verifies the email, marks the
   * person active and the invitation used. The link cannot be used twice,
   * even by two clicks at the same moment.
   */
  async accept(
    token: string,
    input: { name: string; phone?: string; password: string },
  ): Promise<{ area: 'portal' | 'team' }> {
    const invitation = await this.findUsable(token);
    // Hashing is slow on purpose, so it is done before the transaction.
    const passwordHash = await hashPassword(input.password);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.invitation.updateMany({
        where: {
          id: invitation.id,
          usedAt: null,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });
      if (claimed.count !== 1) throw linkGone();

      await tx.account.deleteMany({
        where: { userId: invitation.userId, providerId: 'credential' },
      });
      await tx.account.create({
        data: {
          userId: invitation.userId,
          accountId: invitation.userId,
          providerId: 'credential',
          password: passwordHash,
        },
      });
      await tx.user.update({
        where: { id: invitation.userId },
        data: {
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          status: 'ACTIVE',
          emailVerified: true,
          activatedAt: now,
        },
      });
    }, ACCOUNT_TX);

    return { area: invitation.user.role === 'CUSTOMER' ? 'portal' : 'team' };
  }

  // ---------------------------------------------------------------- helpers

  private async sendInvitation(
    userId: string,
    sentById: string | null,
  ): Promise<{ link: string; emailSent: boolean }> {
    const { token, hash } = newToken();

    const { user, sender } = await this.prisma.$transaction(async (tx) => {
      await tx.invitation.updateMany({
        where: { userId, usedAt: null, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.invitation.create({
        data: { userId, tokenHash: hash, expiresAt: linkExpiry(), sentById },
      });
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          customer: {
            include: {
              projects: {
                select: { name: true },
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      });
      const sender = sentById
        ? await tx.user.findUnique({
            where: { id: sentById },
            select: { name: true },
          })
        : null;
      return { user, sender };
    }, ACCOUNT_TX);

    const link = `${this.siteUrl}/invite/${token}`;
    const common = {
      siteUrl: this.siteUrl,
      firstName: user.name.split(/\s+/)[0] || user.name,
      inviterName: sender?.name ?? null,
      link,
      expiresInHours: LINK_LIFETIME_HOURS,
    };
    const props =
      user.role === 'CUSTOMER'
        ? {
            ...common,
            kind: 'customer' as const,
            company: user.customer?.company ?? '',
            projects:
              user.customer?.projects.map((project) => project.name) ?? [],
          }
        : {
            ...common,
            kind: 'team' as const,
            roleLabel: ROLE_LABELS[user.role],
          };

    try {
      await this.email.send({
        to: user.email,
        subject: invitationSubject(props),
        template: <InvitationEmail {...props} />,
      });
      return { link, emailSent: true };
    } catch (error) {
      this.logger.error(
        `The invitation email to ${user.email} could not be sent: ${(error as Error).message}`,
      );
      return { link, emailSent: false };
    }
  }

  private async findUsable(token: string) {
    if (!looksLikeToken(token)) throw linkGone();
    const invitation = await this.prisma.invitation.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { include: { customer: true } } },
    });
    if (
      !invitation ||
      invitation.usedAt ||
      invitation.revokedAt ||
      invitation.expiresAt <= new Date() ||
      invitation.user.status !== 'INVITED'
    ) {
      throw linkGone();
    }
    return invitation;
  }
}

/** One answer for every unusable link, so a link's history is never revealed. */
function linkGone() {
  return new GoneException({
    code: 'LINK_NOT_VALID',
    message: 'This link has expired or has already been used.',
  });
}
