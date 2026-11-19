import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';
import { EmailService, type OutgoingEmail } from '../email/email.service.js';
import {
  DemoCancelledEmail,
  demoCancelledSubject,
  demoCancelledText,
  DemoInviteEmail,
  demoInviteSubject,
  demoInviteText,
  DemoReceivedEmail,
  demoReceivedSubject,
  EstimateEmail,
  estimateSubject,
  estimateText,
  leadEmailSubject,
  LeadMessageEmail,
  NewLeadAlertEmail,
  QuoteReceivedEmail,
  quoteReceivedSubject,
} from '../email/templates/lead-emails.js';
import type {
  ContactMessage,
  DemoRequest,
  Prisma,
  QuoteRequest,
} from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { buildDemoInvite } from './ics.js';
import {
  BUDGET_LABELS,
  DEMO_MINUTES,
  DEMO_TOPIC_LABELS,
  firstNameOf,
  formatGbp,
  longDate,
  MESSAGE_TOPIC_LABELS,
  QUOTE_TYPE_LABELS,
  TIMELINE_LABELS,
  ukClock,
  ukDayLong,
  ukDayShort,
  ukSlotLong,
} from './lead-rules.js';
import { leadHref, type LeadKind } from './lead-store.js';

/** Who works on website leads, and gets the alerts (docs/01 §1 and §7). */
const LEAD_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const;

type Person = { id: string; name: string; email: string };

/**
 * Who hears about what on website leads (docs/01 §7):
 * - a new lead: an in-app notification and an alert email for every active
 *   super admin, admin and manager; the visitor gets a confirmation (demo
 *   and quote);
 * - a demo confirmed or rescheduled: the owner and host in the app, the
 *   visitor by email with the calendar invite;
 * - demo cancelled, estimates and the composer's emails: the visitor.
 *
 * Notifications are written inside the change's transaction. Emails go
 * after it; a failed email is reported back, never undoes the change.
 */
@Injectable()
export class LeadEventsService {
  private readonly logger = new Logger(LeadEventsService.name);
  private readonly siteUrl: string;
  private readonly organizer: { name: string; email: string };

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
    const from = config.get('EMAIL_FROM');
    const address = /<([^>]+)>/.exec(from)?.[1] ?? from.trim();
    this.organizer = { name: 'FlyConnect Tech', email: address };
  }

  /** Active super admins, admins and managers. */
  leadTeam(): Promise<Person[]> {
    return this.prisma.user.findMany({
      where: { role: { in: [...LEAD_ROLES] }, status: 'ACTIVE' },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: { id: true, name: true, email: true },
    });
  }

  // -------------------------------------------------------- a new lead

  /** "New demo request DEM-2026-031 from Olivia Grant, Skyhaven Travel" */
  newLeadText(
    kind: LeadKind,
    lead: { code: string; name: string; company?: string | null },
    topic?: string,
  ) {
    const who = lead.company ? `${lead.name}, ${lead.company}` : lead.name;
    if (kind === 'message') {
      return `New message ${lead.code} from ${lead.name}${topic ? ` · ${topic}` : ''}`;
    }
    return `New ${kind === 'demo' ? 'demo' : 'quote'} request ${lead.code} from ${who}`;
  }

  async created(
    tx: Prisma.TransactionClient,
    kind: LeadKind,
    lead: { code: string; name: string; company?: string | null },
    topic?: string,
  ) {
    const team = await tx.user.findMany({
      where: { role: { in: [...LEAD_ROLES] }, status: 'ACTIVE' },
      select: { id: true },
    });
    await this.notifications.notify(
      team.map((person) => person.id),
      {
        kind: 'lead',
        text: this.newLeadText(kind, lead, topic),
        href: leadHref(kind, lead.code),
      },
      tx,
    );
  }

  async emailNewDemo(demo: DemoRequest) {
    const when = ukSlotLong(demo.preferredStart);
    const topic = DEMO_TOPIC_LABELS[demo.topic];
    await this.trySend({
      to: demo.email,
      subject: demoReceivedSubject,
      template: (
        <DemoReceivedEmail
          siteUrl={this.siteUrl}
          firstName={firstNameOf(demo.name)}
          code={demo.code}
          topic={topic}
          when={when}
          company={demo.company}
          email={demo.email}
        />
      ),
    });
    await this.alertTeam(
      'demo',
      demo,
      topic,
      [
        `Preferred time: ${when}`,
        `Company: ${demo.company}`,
        `Sent from: ${demo.sourcePage} page`,
      ],
      demo.notes,
    );
  }

  async emailNewQuote(quote: QuoteRequest) {
    const projectType = QUOTE_TYPE_LABELS[quote.projectType];
    const timeline = quote.timeline ? TIMELINE_LABELS[quote.timeline] : null;
    await this.trySend({
      to: quote.email,
      subject: quoteReceivedSubject,
      template: (
        <QuoteReceivedEmail
          siteUrl={this.siteUrl}
          firstName={firstNameOf(quote.name)}
          code={quote.code}
          projectType={projectType}
          budget={BUDGET_LABELS[quote.budget]}
          timeline={timeline}
          email={quote.email}
          requirements={quote.requirements}
        />
      ),
    });
    await this.alertTeam(
      'quote',
      quote,
      projectType,
      [
        `Budget: ${BUDGET_LABELS[quote.budget]}`,
        ...(timeline ? [`Timeline: ${timeline}`] : []),
        `Sent from: ${quote.sourcePage} page`,
      ],
      quote.requirements,
    );
  }

  async emailNewMessage(message: ContactMessage) {
    const topic = MESSAGE_TOPIC_LABELS[message.topic];
    await this.alertTeam(
      'message',
      message,
      topic,
      [`From: ${message.name} · ${message.email}`],
      message.message,
    );
  }

  private async alertTeam(
    kind: LeadKind,
    lead: { code: string; name: string; company?: string | null },
    title: string,
    lines: string[],
    text: string | null,
  ) {
    const subject = this.newLeadText(
      kind,
      lead,
      kind === 'message' ? title : undefined,
    );
    for (const person of await this.leadTeam()) {
      await this.trySend({
        to: person.email,
        subject,
        template: (
          <NewLeadAlertEmail
            siteUrl={this.siteUrl}
            firstName={firstNameOf(person.name)}
            subject={subject}
            code={lead.code}
            title={title}
            lines={lines}
            text={text}
            link={`${this.siteUrl}${leadHref(kind, lead.code)}`}
          />
        ),
      });
    }
  }

  // --------------------------------------------------------------- demo

  /** In-app, for the owner and the host (not the person who did it). */
  async scheduled(
    tx: Prisma.TransactionClient,
    demo: { code: string; ownerId: string | null; hostId: string },
    start: Date,
    moved: boolean,
    actorId: string,
  ) {
    await this.notifications.notify(
      [demo.ownerId, demo.hostId].filter(
        (id): id is string => !!id && id !== actorId,
      ),
      {
        kind: 'lead',
        text: `${demo.code} demo ${moved ? 'moved to' : 'confirmed for'} ${ukDayShort(start)}, ${ukClock(start)}`,
        href: leadHref('demo', demo.code),
      },
      tx,
    );
  }

  /** The calendar invite. Returns the text for the activity, if it was sent. */
  async sendInvite(
    demo: DemoRequest,
    start: Date,
    host: string,
    moved: boolean,
  ): Promise<string | null> {
    const firstName = firstNameOf(demo.name);
    const when = ukSlotLong(start);
    const text = demoInviteText({
      firstName,
      day: ukDayLong(start),
      time: ukClock(start),
      host,
      link: demo.videoLink,
      moved,
    });
    const subject = demoInviteSubject(when, moved);
    const sent = await this.trySend({
      to: demo.email,
      subject,
      template: (
        <DemoInviteEmail
          siteUrl={this.siteUrl}
          firstName={firstName}
          subject={subject}
          text={text}
          code={demo.code}
          topic={DEMO_TOPIC_LABELS[demo.topic]}
          when={when}
          link={demo.videoLink}
        />
      ),
      calendar: {
        method: 'REQUEST',
        content: this.invite(demo, start, host, 'REQUEST'),
      },
    });
    return sent ? text : null;
  }

  /** The cancellation; a scheduled demo's invite is cancelled too. */
  async sendCancelled(
    demo: DemoRequest,
    scheduledStart: Date | null,
    host: string | null,
  ): Promise<string | null> {
    const text = demoCancelledText(
      firstNameOf(demo.name),
      ukDayLong(scheduledStart ?? demo.preferredStart),
    );
    const sent = await this.trySend({
      to: demo.email,
      subject: demoCancelledSubject,
      template: (
        <DemoCancelledEmail
          siteUrl={this.siteUrl}
          firstName={firstNameOf(demo.name)}
          text={text}
        />
      ),
      calendar: scheduledStart
        ? {
            method: 'CANCEL',
            content: this.invite(
              demo,
              scheduledStart,
              host ?? 'FlyConnect Tech',
              'CANCEL',
            ),
          }
        : undefined,
    });
    return sent ? text : null;
  }

  private invite(
    demo: DemoRequest,
    start: Date,
    host: string,
    method: 'REQUEST' | 'CANCEL',
  ) {
    return buildDemoInvite({
      code: demo.code,
      start,
      minutes: DEMO_MINUTES,
      summary: `FlyConnect Tech demo: ${DEMO_TOPIC_LABELS[demo.topic]}`,
      description: `A 30-minute video call with ${host} from FlyConnect Tech.`,
      url: demo.videoLink,
      organizer: this.organizer,
      attendee: { name: demo.name, email: demo.email },
      method,
      domain: this.organizer.email.split('@')[1] ?? 'flyconnect.tech',
    });
  }

  // -------------------------------------------------------------- quote

  async sendEstimate(
    quote: QuoteRequest,
    estimate: {
      amountCents: number;
      deliveryTime: string;
      validUntil: Date;
      summary: string;
    },
    updated: boolean,
  ): Promise<string | null> {
    const firstName = firstNameOf(quote.name);
    const projectType = QUOTE_TYPE_LABELS[quote.projectType];
    const amount = formatGbp(estimate.amountCents);
    const validUntil = longDate(estimate.validUntil);
    const subject = estimateSubject(updated);
    const sent = await this.trySend({
      to: quote.email,
      subject,
      template: (
        <EstimateEmail
          siteUrl={this.siteUrl}
          firstName={firstName}
          subject={subject}
          code={quote.code}
          projectType={projectType}
          amount={amount}
          deliveryTime={estimate.deliveryTime}
          validUntil={validUntil}
          summary={estimate.summary}
        />
      ),
    });
    return sent
      ? estimateText({
          firstName,
          projectType,
          amount,
          deliveryTime: estimate.deliveryTime,
          validUntil,
          summary: estimate.summary,
        })
      : null;
  }

  // ----------------------------------------------------------- composer

  /** An email written in the lead's composer. True when it went. */
  sendLeadEmail(
    kind: LeadKind,
    lead: { code: string; name: string; email: string },
    body: string,
    senderName: string,
  ): Promise<boolean> {
    const subject = leadEmailSubject(kind, lead.code);
    return this.trySend({
      to: lead.email,
      subject,
      template: (
        <LeadMessageEmail
          siteUrl={this.siteUrl}
          firstName={firstNameOf(lead.name)}
          subject={subject}
          body={body}
          senderName={senderName}
        />
      ),
    });
  }

  /** Sends, and reports instead of throwing. */
  private async trySend(email: OutgoingEmail): Promise<boolean> {
    try {
      await this.email.send(email);
      return true;
    } catch (error) {
      this.logger.error(
        `"${email.subject}" to ${email.to} could not be sent: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
