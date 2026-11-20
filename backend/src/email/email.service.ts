import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import nodemailer, { type Transporter } from 'nodemailer';
import type { ReactElement } from 'react';
import type { Env } from '../config/env.js';
import type { EmailOutbox } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { company } from './templates/layout.js';

export type OutgoingEmail = {
  to: string;
  subject: string;
  /** A React Email template, for example <InvitationEmail ... />. */
  template: ReactElement;
  /** A calendar invite (.ics text, src/leads/ics.ts), sent as invite.ics. */
  calendar?: { method: 'REQUEST' | 'CANCEL'; content: string };
  /**
   * false: never keep it for another try. For emails with a sign-in link
   * (invitation, password reset): the link must not be stored readable,
   * and the person or the team sends a new one instead.
   */
  retry?: false;
};

/** Tries in all, the first one included. */
export const MAX_TRIES = 5;

/** The wait before each next try: 5 minutes, 15 minutes, 1 hour, 3 hours. */
const WAITS_MIN = [5, 15, 60, 180];

/** Sent and removed emails are kept this long, then deleted. */
const KEEP_DAYS = 30;

/** How many waiting emails one run of the job tries. */
const BATCH = 50;

type Rendered = {
  to: string;
  subject: string;
  html: string;
  text: string;
  calendarMethod: string | null;
  calendarContent: string | null;
};

export type OutboxItem = {
  id: string;
  to: string;
  subject: string;
  attempts: number;
  lastError: string;
  state: 'retrying' | 'failed';
  nextTryAt: Date | null;
  createdAt: Date;
};

const errorText = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 500);

/**
 * Sends email through SMTP: Mailpit on a PC (read at http://localhost:8025),
 * the hosting's email account or Resend's SMTP on the live site.
 * Every email has an HTML and a plain-text version, and replies go to the
 * company inbox.
 *
 * An email that fails is kept in `email_outbox` and the `send-emails` job
 * (cPanel Cron, every 5 minutes) tries it again. After the last try it
 * waits on the Failed emails screen (admins) to be resent or removed.
 * `send` still throws on a failure, so the caller can say "not sent".
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(
    config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {
    const user = config.get('SMTP_USER', { infer: true });
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      secure: config.get('SMTP_SECURE'),
      auth: user ? { user, pass: config.get('SMTP_PASS') } : undefined,
    });
    this.from = config.get('EMAIL_FROM');
  }

  async send(email: OutgoingEmail): Promise<void> {
    const [html, text] = await Promise.all([
      render(email.template),
      render(email.template, { plainText: true }),
    ]);
    const rendered: Rendered = {
      to: email.to,
      subject: email.subject,
      html,
      text,
      calendarMethod: email.calendar?.method ?? null,
      calendarContent: email.calendar?.content ?? null,
    };
    try {
      await this.deliver(rendered);
    } catch (error) {
      if (email.retry !== false) await this.keepForRetry(rendered, error);
      throw error;
    }
  }

  /** The send-emails job: tries the emails whose next try is due. */
  async sendWaiting(
    now = new Date(),
  ): Promise<{ sent: number; failed: number }> {
    const due = await this.prisma.emailOutbox.findMany({
      where: {
        sentAt: null,
        gaveUpAt: null,
        dismissedAt: null,
        nextTryAt: { lte: now },
      },
      orderBy: { nextTryAt: 'asc' },
      take: BATCH,
    });
    let sent = 0;
    let failed = 0;
    for (const row of due) {
      if (await this.tryAgain(row, now)) sent += 1;
      else failed += 1;
    }
    const old = new Date(now.getTime() - KEEP_DAYS * 24 * 60 * 60 * 1000);
    await this.prisma.emailOutbox.deleteMany({
      where: {
        OR: [{ sentAt: { lt: old } }, { dismissedAt: { lt: old } }],
      },
    });
    return { sent, failed };
  }

  /** The Failed emails screen: still retrying, or given up. Newest first. */
  async waiting(): Promise<OutboxItem[]> {
    const rows = await this.prisma.emailOutbox.findMany({
      where: { sentAt: null, dismissedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((row) => ({
      id: row.id,
      to: row.to,
      subject: row.subject,
      attempts: row.attempts,
      lastError: row.lastError,
      state: row.gaveUpAt ? 'failed' : 'retrying',
      nextTryAt: row.gaveUpAt ? null : row.nextTryAt,
      createdAt: row.createdAt,
    }));
  }

  /** Resend: one more try now. True when it went. */
  async resend(id: string, now = new Date()): Promise<boolean> {
    const row = await this.open(id);
    return this.tryAgain(row, now, { manual: true });
  }

  /** Remove it from the list without sending. */
  async dismiss(id: string, now = new Date()): Promise<void> {
    await this.open(id);
    await this.prisma.emailOutbox.update({
      where: { id },
      data: { dismissedAt: now },
    });
  }

  private async open(id: string): Promise<EmailOutbox> {
    const row = await this.prisma.emailOutbox.findUnique({ where: { id } });
    if (!row || row.sentAt || row.dismissedAt) throw new NotFoundException();
    return row;
  }

  private async deliver(email: Rendered): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      replyTo: company.email,
      to: email.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      icalEvent:
        email.calendarMethod && email.calendarContent
          ? {
              method: email.calendarMethod,
              filename: 'invite.ics',
              content: email.calendarContent,
            }
          : undefined,
    });
    this.logger.log(`Sent "${email.subject}"`);
  }

  private async keepForRetry(email: Rendered, error: unknown): Promise<void> {
    try {
      await this.prisma.emailOutbox.create({
        data: {
          ...email,
          attempts: 1,
          lastError: errorText(error),
          nextTryAt: new Date(Date.now() + WAITS_MIN[0] * 60_000),
        },
      });
    } catch (saveError) {
      // The database is down too: the caller still reports "not sent".
      this.logger.error(
        `Could not keep "${email.subject}" for another try`,
        saveError,
      );
    }
  }

  /**
   * One more try. On a failure: the next wait, or "given up" after the
   * last try. A manual resend of a given-up email stays given up.
   */
  private async tryAgain(
    row: EmailOutbox,
    now: Date,
    options: { manual?: boolean } = {},
  ): Promise<boolean> {
    try {
      await this.deliver(row);
      await this.prisma.emailOutbox.update({
        where: { id: row.id },
        data: { sentAt: now, attempts: row.attempts + 1 },
      });
      return true;
    } catch (error) {
      const attempts = row.attempts + 1;
      const givesUp = options.manual
        ? row.gaveUpAt !== null || attempts >= MAX_TRIES
        : attempts >= MAX_TRIES;
      const wait = WAITS_MIN[Math.min(attempts - 1, WAITS_MIN.length - 1)];
      await this.prisma.emailOutbox.update({
        where: { id: row.id },
        data: {
          attempts,
          lastError: errorText(error),
          nextTryAt: new Date(now.getTime() + wait * 60_000),
          gaveUpAt: givesUp ? (row.gaveUpAt ?? now) : null,
        },
      });
      this.logger.warn(`Still not sent: "${row.subject}" (try ${attempts})`);
      return false;
    }
  }
}
