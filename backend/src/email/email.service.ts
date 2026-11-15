import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import nodemailer, { type Transporter } from 'nodemailer';
import type { ReactElement } from 'react';
import type { Env } from '../config/env.js';

export type OutgoingEmail = {
  to: string;
  subject: string;
  /** A React Email template, for example <InvitationEmail ... />. */
  template: ReactElement;
  /** A calendar invite (.ics text, src/leads/ics.ts), sent as invite.ics. */
  calendar?: { method: 'REQUEST' | 'CANCEL'; content: string };
};

/**
 * Sends email through SMTP: Mailpit on a PC (read at http://localhost:8025),
 * the hosting's email account or Resend's SMTP on the live site.
 * Every email has an HTML and a plain-text version.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
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

    await this.transporter.sendMail({
      from: this.from,
      to: email.to,
      subject: email.subject,
      html,
      text,
      // Mail apps show this as an invite to accept, and as invite.ics.
      icalEvent: email.calendar
        ? {
            method: email.calendar.method,
            filename: 'invite.ics',
            content: email.calendar.content,
          }
        : undefined,
    });
    this.logger.log(`Sent "${email.subject}"`);
  }
}
