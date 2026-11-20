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
import { nextCode } from '../codes/readable-codes.js';
import { EmailService } from '../email/email.service.js';
import {
  InvitationEmail,
  invitationSubject,
} from '../email/templates/invitation.js';
import { Prisma } from '../generated/prisma/client.js';
import type {
  AccountSide,
  LeadType,
  ProjectType,
  Role,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { withoutDeletedMark } from './deleted-marks.js';
import { loginKeyFor, normaliseEmail, sideOfRole } from './login-key.js';
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
  /** Customers only: their first projects, listed in the invitation email. */
  projects?: { name: string; type: ProjectType }[];
  /** Customers only: the website lead they were converted from. */
  sourceLead?: { type: LeadType; id: string };
  /**
   * Customers only: more steps inside the same save, after the customer is
   * created (converting a lead links it here).
   */
  onCustomer?: (
    tx: Prisma.TransactionClient,
    customerId: string,
    email: string,
  ) => Promise<void>;
  /**
   * When a deleted account had this email on this side: bring its history
   * back ("restore") or start a new account ("fresh"). Not given: the
   * answer is PREVIOUS_ACCOUNT, so the screen can ask.
   */
  previous?: 'restore' | 'fresh';
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
  ): Promise<{
    userId: string;
    customerId: string | null;
    link: string;
    emailSent: boolean;
  }> {
    const email = normaliseEmail(input.email);
    // Customer and team accounts are separate: the email only has to be
    // free on this account's own side.
    const side = sideOfRole(input.role);
    const existing = await this.prisma.user.findUnique({
      where: { email_side: { email, side } },
    });
    if (existing) throw emailTaken(side);
    if (input.role === 'CUSTOMER' && !input.company?.trim()) {
      throw new ConflictException({
        code: 'COMPANY_REQUIRED',
        message: 'A customer account needs a company.',
      });
    }

    // A deleted account had this email on this side: first ask whether to
    // bring its history back (docs/01, "Delete"), then do as answered.
    const previous = await this.prisma.user.findFirst({
      where: { deletedEmail: email, side, status: 'DELETED' },
      orderBy: { deletedAt: 'desc' },
      select: { id: true, name: true, deletedAt: true, customerId: true },
    });
    if (previous && !input.previous) {
      throw await previousAccountDetails(this.prisma, previous);
    }
    const restoring =
      previous && input.previous === 'restore' ? previous : null;

    const created = this.prisma.$transaction(async (tx) => {
      if (previous && !restoring) {
        // Start fresh: the old history stays deleted and is not offered again.
        await tx.user.update({
          where: { id: previous.id },
          data: { deletedEmail: null },
        });
      }

      let customerId: string | null = null;
      if (input.role === 'CUSTOMER') {
        const company = input.company!.trim();
        const country = input.country?.trim() || null;
        const lead = input.sourceLead
          ? {
              sourceLeadType: input.sourceLead.type,
              sourceLeadId: input.sourceLead.id,
            }
          : {};
        const customer = restoring?.customerId
          ? await tx.customer.update({
              where: { id: restoring.customerId },
              data: { company, country, deletedAt: null, ...lead },
            })
          : await tx.customer.create({
              data: { company, country, createdById: invitedById, ...lead },
            });
        customerId = customer.id;
        const codes: string[] = [];
        for (const project of input.projects ?? []) {
          const code = await nextCode(tx, 'project');
          await tx.project.create({
            data: {
              code,
              name: project.name.trim(),
              type: project.type,
              customerId,
            },
          });
          codes.push(code);
        }
        await this.audit.record(
          {
            actorId: invitedById,
            action: restoring ? 'customer.restored' : 'customer.created',
            entityType: 'customer',
            entityId: customer.id,
            data: { company: customer.company, projects: codes },
          },
          tx,
        );
        await input.onCustomer?.(tx, customer.id, email);
      }

      const details = {
        name: input.name.trim(),
        email,
        side,
        loginEmail: loginKeyFor(email, side),
        role: input.role,
        status: 'INVITED' as const,
        jobTitle:
          input.role === 'CUSTOMER' ? null : input.jobTitle?.trim() || null,
        country: input.country?.trim() || null,
        phone: input.phone?.trim() || null,
        customerId,
        invitedAt: new Date(),
        createdById: invitedById,
      };
      // Restore: the same account comes back, so its history is theirs again.
      const user = restoring
        ? await tx.user.update({
            where: { id: restoring.id },
            data: {
              ...details,
              deletedAt: null,
              deletedEmail: null,
              activatedAt: null,
              emailVerified: false,
            },
          })
        : await tx.user.create({ data: details });
      await this.audit.record(
        {
          actorId: invitedById,
          action: restoring ? 'user.restored' : 'user.invited',
          entityType: 'user',
          entityId: user.id,
          data: { email, role: input.role },
        },
        tx,
      );
      return { userId: user.id, customerId };
    }, ACCOUNT_TX);
    // Two people adding the same email at the same moment: the second one
    // hits the unique email and gets the same answer as above.
    const { userId, customerId } = await created.catch((error: unknown) => {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw emailTaken(side);
      }
      throw error;
    });

    // The account exists now, so a broken email server must not hide the
    // link: the command line prints it (the very first super admin).
    const { link, emailSent } = await this.sendInvitation(userId, invitedById);
    return { userId, customerId, link, emailSent };
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

/**
 * "This email belonged to an account that was deleted": what Add user and
 * Add customer show before asking Restore or Start fresh.
 */
async function previousAccountDetails(
  prisma: PrismaService,
  previous: {
    id: string;
    name: string;
    deletedAt: Date | null;
    customerId: string | null;
  },
) {
  const customer = previous.customerId
    ? await prisma.customer.findUnique({
        where: { id: previous.customerId },
        select: {
          company: true,
          _count: { select: { requests: true, projects: true } },
        },
      })
    : null;
  // A team member's history: the requests they wrote in.
  const repliedOn = customer
    ? []
    : await prisma.requestMessage.groupBy({
        by: ['requestId'],
        where: { authorId: previous.id },
      });
  return new ConflictException({
    code: 'PREVIOUS_ACCOUNT',
    message:
      'This email belonged to an account that was deleted. Restore its history, or start fresh?',
    previous: {
      name: withoutDeletedMark(previous.name),
      deletedAt: previous.deletedAt,
      company: customer ? withoutDeletedMark(customer.company) : null,
      requests: customer ? customer._count.requests : repliedOn.length,
      projects: customer ? customer._count.projects : null,
    },
  });
}

/** The email is used on this side already (the other side does not count). */
function emailTaken(side: AccountSide) {
  return new ConflictException({
    code: 'EMAIL_TAKEN',
    message:
      side === 'TEAM'
        ? 'There is already a team account with this email.'
        : 'There is already a client account with this email.',
  });
}

/** One answer for every unusable link, so a link's history is never revealed. */
function linkGone() {
  return new GoneException({
    code: 'LINK_NOT_VALID',
    message: 'This link has expired or has already been used.',
  });
}
