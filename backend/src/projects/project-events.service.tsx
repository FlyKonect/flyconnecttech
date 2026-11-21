import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readEmailPrefs } from '../accounts/email-prefs.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  ProjectUpdateEmail,
  projectUpdateSubject,
} from '../email/templates/project-update.js';
import type { Prisma } from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { progressWords, type Progress } from './project-rules.js';

export const portalProjectHref = (code: string) => `/portal/projects/${code}`;

/** What the events need to know about a project. */
export type EventProject = {
  code: string;
  name: string;
  customerId: string;
};

/**
 * Who hears about a project update: the customer's contact person. The
 * in-app notice is written inside the caller's transaction; the email goes
 * after it ("A project update is posted"), and a failed email never undoes
 * the update. Item changes send nothing (the owner's choice).
 */
@Injectable()
export class ProjectEventsService {
  private readonly siteUrl: string;
  private readonly logger = new Logger(ProjectEventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  async updatePosted(
    tx: Prisma.TransactionClient,
    project: EventProject,
  ): Promise<void> {
    const customer = await this.contact(project.customerId, tx);
    if (!customer) return;
    await this.notifications.notify(
      [customer.id],
      {
        kind: 'project',
        text: `New update on ${project.code} ${project.name}`,
        href: portalProjectHref(project.code),
      },
      tx,
    );
  }

  /** The email, if the customer wants it. True when it was sent. */
  async emailUpdate(
    project: EventProject,
    update: { authorName: string; body: string; files: number },
    progress: Progress,
  ): Promise<boolean> {
    const customer = await this.contact(project.customerId);
    if (!customer || !readEmailPrefs(customer.emailPrefs).projectUpdates) {
      return false;
    }
    const subject = projectUpdateSubject(project.name);
    try {
      await this.email.send({
        to: customer.email,
        subject,
        template: (
          <ProjectUpdateEmail
            siteUrl={this.siteUrl}
            firstName={customer.name.trim().split(/\s+/)[0] || customer.name}
            authorName={update.authorName}
            code={project.code}
            name={project.name}
            body={update.body}
            progress={
              progress.percent === null
                ? null
                : `Progress: ${progressWords(progress)}`
            }
            files={update.files}
            link={`${this.siteUrl}${portalProjectHref(project.code)}`}
          />
        ),
      });
      return true;
    } catch (error) {
      this.logger.error(`Could not send "${subject}": ${String(error)}`);
      return false;
    }
  }

  /** The customer's contact person, if their account is active. */
  private contact(
    customerId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    return tx.user.findFirst({
      where: { customerId, role: 'CUSTOMER', status: 'ACTIVE' },
      select: { id: true, name: true, email: true, emailPrefs: true },
    });
  }
}
