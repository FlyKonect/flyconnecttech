import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReactElement } from 'react';
import { readEmailPrefs } from '../accounts/email-prefs.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  RequestReceivedEmail,
  requestReceivedSubject,
} from '../email/templates/request-received.js';
import {
  StatusChangedEmail,
  statusChangedSubject,
} from '../email/templates/status-changed.js';
import {
  assignedSubject,
  CustomerRepliedEmail,
  customerRepliedSubject,
  RequestAssignedEmail,
  UrgentRequestEmail,
  urgentSubject,
} from '../email/templates/team-request.js';
import {
  TeamReplyEmail,
  teamReplySubject,
} from '../email/templates/team-reply.js';
import type {
  NotificationKind,
  Prisma,
  Priority,
  RequestStatus,
  RequestType,
} from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { PRIORITY_LABELS, TYPE_LABELS } from './labels.js';

/** What the events need to know about a request. */
export type EventRequest = {
  id: string;
  code: string;
  title: string;
  priority: Priority;
  assigneeId: string | null;
  customerId: string;
};

export const portalRequestHref = (code: string) => `/portal/requests/${code}`;
export const teamRequestHref = (code: string) => `/team/requests/${code}`;

/** Notification colour for a status the customer is told about. */
const STATUS_KINDS: Partial<Record<RequestStatus, NotificationKind>> = {
  WAITING_FOR_CUSTOMER: 'info',
  RESOLVED: 'ok',
  CLOSED: 'closed',
};

/**
 * Who hears about what on a support request (docs/01, section 7).
 *
 * In-app notifications are written inside the caller's transaction, so they
 * exist only if the change was saved. Emails go after the transaction, and
 * a failed email is logged, never thrown: the change has already happened.
 */
@Injectable()
export class RequestEventsService {
  private readonly siteUrl: string;
  private readonly logger = new Logger(RequestEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    private readonly settings: SettingsService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  // ------------------------------------------------- in the transaction

  /**
   * A customer sent a new request. The team is notified; the customer is
   * not (they see the "Request submitted" page and get an email copy).
   */
  async created(
    tx: Prisma.TransactionClient,
    request: EventRequest,
    company: string,
  ): Promise<void> {
    const team = await tx.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
        status: 'ACTIVE',
      },
      select: { id: true },
    });
    await this.notifications.notify(
      team.map((person) => person.id),
      request.priority === 'URGENT'
        ? {
            kind: 'urgent',
            text: urgentSubject(request.code, company),
            href: teamRequestHref(request.code),
          }
        : {
            kind: 'new',
            text: `New support request ${request.code} · ${PRIORITY_LABELS[request.priority]}`,
            href: teamRequestHref(request.code),
          },
      tx,
    );
  }

  /** A request was assigned (or transferred) to a developer. */
  async assigned(
    tx: Prisma.TransactionClient,
    request: EventRequest,
    developer: { id: string; name: string },
  ): Promise<void> {
    await this.notifications.notify(
      [developer.id],
      {
        kind: 'review',
        text: `${request.code} was assigned to ${developer.name}`,
        href: teamRequestHref(request.code),
      },
      tx,
    );
  }

  /**
   * The customer replied or used a button (close, confirm, reopen). The
   * assigned developer hears about it, or the admins when nobody is assigned.
   */
  async customerActivity(
    tx: Prisma.TransactionClient,
    request: EventRequest,
    text: string,
  ): Promise<void> {
    const to = request.assigneeId
      ? [request.assigneeId]
      : (
          await tx.user.findMany({
            where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, status: 'ACTIVE' },
            select: { id: true },
          })
        ).map((person) => person.id);
    await this.notifications.notify(
      to,
      { kind: 'reply', text, href: teamRequestHref(request.code) },
      tx,
    );
  }

  /** A team member replied to the customer (Phase 6). Never for internal notes. */
  async teamReplied(
    tx: Prisma.TransactionClient,
    request: EventRequest,
    authorName: string,
  ): Promise<void> {
    const customer = await this.contact(request.customerId, tx);
    if (!customer) return;
    await this.notifications.notify(
      [customer.id],
      {
        kind: 'reply',
        text: `${authorName} replied to ${request.code}`,
        href: portalRequestHref(request.code),
      },
      tx,
    );
  }

  /** The team changed the status (Phase 6). The customer is told. */
  async statusChanged(
    tx: Prisma.TransactionClient,
    request: EventRequest,
    status: RequestStatus,
  ): Promise<void> {
    const customer = await this.contact(request.customerId, tx);
    if (!customer) return;
    await this.notifications.notify(
      [customer.id],
      {
        kind: STATUS_KINDS[status] ?? 'status',
        text: statusChangedSubject(request.code, status),
        href: portalRequestHref(request.code),
      },
      tx,
    );
  }

  // ------------------------------------------- emails, after the change

  /** The customer's copy of their new request. Always sent. */
  async emailRequestReceived(
    request: EventRequest & {
      description: string;
      type: RequestType;
      projectName: string;
      fileCount: number;
    },
  ): Promise<boolean> {
    const customer = await this.contact(request.customerId);
    if (!customer) return false;
    return this.send(
      customer.email,
      requestReceivedSubject(request.code),
      <RequestReceivedEmail
        siteUrl={this.siteUrl}
        firstName={firstName(customer.name)}
        code={request.code}
        title={request.title}
        projectName={request.projectName}
        typeLabel={TYPE_LABELS[request.type]}
        priorityLabel={PRIORITY_LABELS[request.priority]}
        description={request.description}
        fileCount={request.fileCount}
        link={this.link(request.code)}
      />,
    );
  }

  /** A team reply, if the customer wants these emails ("The team replies"). */
  async emailTeamReply(
    request: EventRequest,
    authorName: string,
    body: string,
  ): Promise<boolean> {
    const customer = await this.contact(request.customerId);
    if (!customer || !readEmailPrefs(customer.emailPrefs).replies) return false;
    return this.send(
      customer.email,
      teamReplySubject(authorName, request.code),
      <TeamReplyEmail
        siteUrl={this.siteUrl}
        firstName={firstName(customer.name)}
        authorName={authorName}
        code={request.code}
        title={request.title}
        body={body}
        link={this.link(request.code)}
      />,
    );
  }

  /**
   * A status change, if the customer wants these emails ("A status changes
   * or more information is needed"). "Resolved" asks them to confirm.
   */
  async emailStatusChanged(
    request: EventRequest,
    status: RequestStatus,
    note?: string,
  ): Promise<boolean> {
    const customer = await this.contact(request.customerId);
    if (!customer || !readEmailPrefs(customer.emailPrefs).statusChanges) {
      return false;
    }
    return this.send(
      customer.email,
      statusChangedSubject(request.code, status),
      <StatusChangedEmail
        siteUrl={this.siteUrl}
        firstName={firstName(customer.name)}
        code={request.code}
        title={request.title}
        status={status}
        note={note}
        link={this.link(request.code)}
      />,
    );
  }

  /** The developer a request was assigned or transferred to. Always sent. */
  async emailAssigned(
    request: EventRequest,
    developer: { name: string; email: string },
    assignedBy: string,
  ): Promise<boolean> {
    const context = await this.teamContext(request);
    if (!context) return false;
    return this.send(
      developer.email,
      assignedSubject(request.code),
      <RequestAssignedEmail
        {...context}
        firstName={firstName(developer.name)}
        assignedBy={assignedBy}
      />,
    );
  }

  /**
   * The customer replied: the assigned developer gets an email, if the
   * setting "Notify the assigned developer when a customer replies" is on.
   */
  async emailCustomerReplied(
    request: EventRequest,
    customerName: string,
    body: string,
  ): Promise<boolean> {
    if (!request.assigneeId) return false;
    const { notifyAssigneeOnReply } =
      await this.settings.get('teamNotifications');
    if (!notifyAssigneeOnReply) return false;
    const developer = await this.prisma.user.findFirst({
      where: { id: request.assigneeId, status: 'ACTIVE' },
      select: { name: true, email: true },
    });
    const context = await this.teamContext(request);
    if (!developer || !context) return false;
    return this.send(
      developer.email,
      customerRepliedSubject(customerName, request.code),
      <CustomerRepliedEmail
        {...context}
        firstName={firstName(developer.name)}
        customerName={customerName}
        body={body}
      />,
    );
  }

  /**
   * A new Urgent request: super admins and admins get an email, if the
   * setting "Alert all admins about new Urgent requests" is on.
   */
  async emailUrgent(
    request: EventRequest & { description: string },
  ): Promise<number> {
    const { urgentAlert } = await this.settings.get('teamNotifications');
    if (!urgentAlert) return 0;
    const [admins, context] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, status: 'ACTIVE' },
        select: { name: true, email: true },
      }),
      this.teamContext(request),
    ]);
    if (!context) return 0;
    let sent = 0;
    for (const admin of admins) {
      const ok = await this.send(
        admin.email,
        urgentSubject(request.code, context.company),
        <UrgentRequestEmail
          {...context}
          firstName={firstName(admin.name)}
          description={request.description}
        />,
      );
      if (ok) sent += 1;
    }
    return sent;
  }

  // ------------------------------------------------------------ helpers

  /** What the team's emails show about a request. */
  private async teamContext(request: EventRequest) {
    const found = await this.prisma.supportRequest.findUnique({
      where: { id: request.id },
      select: {
        project: { select: { name: true } },
        customer: { select: { company: true } },
      },
    });
    if (!found) return null;
    return {
      siteUrl: this.siteUrl,
      code: request.code,
      title: request.title,
      company: found.customer.company,
      projectName: found.project.name,
      priorityLabel: PRIORITY_LABELS[request.priority],
      link: `${this.siteUrl}${teamRequestHref(request.code)}`,
    };
  }

  /** The customer's contact person, if their account is active. */
  private async contact(
    customerId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.user.findFirst({
      where: { customerId, role: 'CUSTOMER', status: 'ACTIVE' },
      select: { id: true, name: true, email: true, emailPrefs: true },
    });
  }

  private link(code: string): string {
    return `${this.siteUrl}${portalRequestHref(code)}`;
  }

  private async send(
    to: string,
    subject: string,
    template: ReactElement,
  ): Promise<boolean> {
    try {
      await this.email.send({ to, subject, template });
      return true;
    } catch (error) {
      this.logger.error(`Could not send "${subject}": ${String(error)}`);
      return false;
    }
  }
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}
