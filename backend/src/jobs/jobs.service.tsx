import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReactElement } from 'react';
import { readEmailPrefs } from '../accounts/email-prefs.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  DailyDigestEmail,
  dailyDigestSubject,
} from '../email/templates/daily-digest.js';
import {
  WeeklySummaryEmail,
  weeklySummarySubject,
} from '../email/templates/weekly-summary.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PRIORITY_LABELS, STATUS_LABELS } from '../requests/labels.js';
import { RequestEventsService } from '../requests/request-events.service.js';
import {
  moveStatus,
  REQUEST_TX,
  stateSelect,
} from '../requests/request-writes.js';
import { OPEN_STATUSES } from '../requests/status-rules.js';
import { SettingsService } from '../settings/settings.service.js';
import { dueWords, waitingFor } from './job-words.js';

const DAY = 24 * 60 * 60 * 1000;

/** How many requests one email lists at most. */
const LIST_SIZE = 20;

/** The conversation line when a request closes by itself. */
export const AUTO_CLOSE_LINE =
  'Closed automatically 7 days after it was resolved';

/** Who gets the daily digest (docs/01 §7: admins and managers). */
const DIGEST_ROLES = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] as const;

export type JobResult = { done: string };

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

/**
 * The scheduled jobs (docs/01 §5 Settings and §7), run by cPanel Cron
 * through `node dist/cli/run-job.js <job>`. The hosting has no background
 * workers, so each job does its work and ends. Running a job again is
 * safe: it never sends twice for the same thing in one run, and a closed
 * request is not closed again.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly siteUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly email: EmailService,
    private readonly events: RequestEventsService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  /**
   * The daily digest: the requests still waiting for review, to every
   * active super admin, admin and manager. Nothing when none are waiting
   * or the setting is off.
   */
  async dailyDigest(now = new Date()): Promise<JobResult> {
    const { dailyDigest } = await this.settings.get('teamNotifications');
    if (!dailyDigest) return { done: 'the daily digest is switched off' };

    const where = { status: 'SUBMITTED' as const };
    const [total, waiting] = await Promise.all([
      this.prisma.supportRequest.count({ where }),
      this.prisma.supportRequest.findMany({
        where,
        orderBy: [{ createdAt: 'asc' }, { code: 'asc' }],
        take: LIST_SIZE,
        select: {
          code: true,
          title: true,
          priority: true,
          createdAt: true,
          dueAt: true,
          customer: { select: { company: true } },
        },
      }),
    ]);
    if (!total) return { done: 'no requests are waiting for review' };

    const rows = waiting.map((request) => ({
      code: request.code,
      title: request.title,
      company: request.customer.company,
      priority: PRIORITY_LABELS[request.priority],
      waiting: waitingFor(request.createdAt, now),
      due: dueWords(request.dueAt, now),
    }));
    const people = await this.prisma.user.findMany({
      where: { role: { in: [...DIGEST_ROLES] }, status: 'ACTIVE' },
      select: { name: true, email: true },
    });
    let sent = 0;
    for (const person of people) {
      const ok = await this.trySend(
        person.email,
        dailyDigestSubject(total),
        <DailyDigestEmail
          siteUrl={this.siteUrl}
          firstName={firstName(person.name)}
          rows={rows}
          total={total}
          link={`${this.siteUrl}/team/requests?status=submitted`}
        />,
      );
      if (ok) sent++;
    }
    return {
      done: `sent to ${sent} of ${people.length} people, ${total} waiting`,
    };
  }

  /**
   * Auto-close: requests Resolved for 7 days or more become Closed, with
   * nobody named. The customer is told as for any close. Each request has
   * its own save, so one problem doesn't stop the rest.
   */
  async autoClose(now = new Date()): Promise<JobResult> {
    const { autoCloseResolvedAfter7Days } =
      await this.settings.get('teamNotifications');
    if (!autoCloseResolvedAfter7Days) {
      return { done: 'auto-close is switched off' };
    }
    const targets = await this.settings.slaRules();
    const due = await this.prisma.supportRequest.findMany({
      where: {
        status: 'RESOLVED',
        resolvedAt: { lte: new Date(now.getTime() - 7 * DAY) },
      },
      orderBy: { resolvedAt: 'asc' },
      select: stateSelect,
    });

    let closed = 0;
    for (const request of due) {
      try {
        const moved = await this.prisma.$transaction(async (tx) => {
          const changed = await moveStatus(tx, request, 'CLOSED', {
            actorId: null,
            line: AUTO_CLOSE_LINE,
            now,
            targets,
          });
          if (changed) await this.events.statusChanged(tx, request, 'CLOSED');
          return changed;
        }, REQUEST_TX);
        if (!moved) continue;
        closed++;
        await this.events.emailStatusChanged(request, 'CLOSED');
      } catch (error) {
        this.logger.error(
          `${request.code} could not be closed: ${(error as Error).message}`,
        );
      }
    }
    return { done: `closed ${closed} of ${due.length}` };
  }

  /**
   * Every 5 minutes: emails that failed get another try (EmailService).
   * Prints how many went and how many still wait; nothing when no email
   * waits, so the log does not fill with a line every 5 minutes.
   */
  async sendEmails(now = new Date()): Promise<JobResult> {
    const { sent, failed } = await this.email.sendWaiting(now);
    if (sent + failed === 0) return { done: '' };
    return { done: `${sent} sent, ${failed} still waiting` };
  }

  /**
   * The weekly summary, for customers who ticked it: their open requests,
   * and what was resolved or closed in the last 7 days. Nobody gets an
   * empty one.
   */
  async weeklySummary(now = new Date()): Promise<JobResult> {
    const weekAgo = new Date(now.getTime() - 7 * DAY);
    const customers = await this.prisma.user.findMany({
      where: { role: 'CUSTOMER', status: 'ACTIVE', customerId: { not: null } },
      select: { name: true, email: true, emailPrefs: true, customerId: true },
    });
    const wanted = customers.filter(
      (person) => readEmailPrefs(person.emailPrefs).weeklySummary,
    );

    const select = {
      code: true,
      title: true,
      status: true,
      project: { select: { name: true } },
    } as const;
    const row = (request: {
      code: string;
      title: string;
      status: keyof typeof STATUS_LABELS;
      project: { name: string };
    }) => ({
      code: request.code,
      title: request.title,
      project: request.project.name,
      status: STATUS_LABELS[request.status],
    });

    let sent = 0;
    for (const person of wanted) {
      const customerId = person.customerId!;
      const [open, finished] = await Promise.all([
        this.prisma.supportRequest.findMany({
          where: { customerId, status: { in: [...OPEN_STATUSES] } },
          orderBy: [{ createdAt: 'desc' }, { code: 'desc' }],
          take: LIST_SIZE,
          select,
        }),
        this.prisma.supportRequest.findMany({
          where: {
            customerId,
            OR: [
              { status: 'RESOLVED', resolvedAt: { gte: weekAgo } },
              { status: 'CLOSED', closedAt: { gte: weekAgo } },
            ],
          },
          orderBy: [{ updatedAt: 'desc' }, { code: 'desc' }],
          take: LIST_SIZE,
          select,
        }),
      ]);
      if (!open.length && !finished.length) continue;
      const ok = await this.trySend(
        person.email,
        weeklySummarySubject,
        <WeeklySummaryEmail
          siteUrl={this.siteUrl}
          firstName={firstName(person.name)}
          open={open.map(row)}
          finished={finished.map(row)}
          link={`${this.siteUrl}/portal/requests`}
        />,
      );
      if (ok) sent++;
    }
    return {
      done: `sent to ${sent} of ${wanted.length} customers who asked for it`,
    };
  }

  private async trySend(
    to: string,
    subject: string,
    template: ReactElement,
  ): Promise<boolean> {
    try {
      await this.email.send({ to, subject, template });
      return true;
    } catch (error) {
      this.logger.error(
        `"${subject}" to ${to} could not be sent: ${(error as Error).message}`,
      );
      return false;
    }
  }
}
