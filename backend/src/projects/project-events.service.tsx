import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readEmailPrefs } from '../accounts/email-prefs.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  ProjectUpdateEmail,
  projectUpdateSubject,
} from '../email/templates/project-update.js';
import {
  ModuleReviewEmail,
  moduleReviewSubject,
} from '../email/templates/module-review.js';
import type { Prisma } from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { progressWords, type Progress } from './project-rules.js';
import type { ReactElement } from 'react';

export const portalProjectHref = (code: string) => `/portal/projects/${code}`;
export const teamProjectHref = (code: string) => `/team/projects/${code}`;

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

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

  // ---------------------------------------------------- module reviews

  /** A module went into Client review: the customer is told. */
  async moduleReady(
    tx: Prisma.TransactionClient,
    project: EventProject,
    module: { name: string },
  ): Promise<void> {
    const customer = await this.contact(project.customerId, tx);
    if (!customer) return;
    await this.notifications.notify(
      [customer.id],
      {
        kind: 'module',
        text: `Ready for your review: ${module.name} (${project.code})`,
        href: `${portalProjectHref(project.code)}/modules`,
      },
      tx,
    );
  }

  /** The email for it ("A project update is posted"). True when sent. */
  async emailModuleReady(
    project: EventProject,
    module: { name: string; round: number },
  ): Promise<boolean> {
    const customer = await this.contact(project.customerId);
    if (!customer || !readEmailPrefs(customer.emailPrefs).projectUpdates) {
      return false;
    }
    return this.send(
      customer.email,
      moduleReviewSubject('ready', module.name),
      <ModuleReviewEmail
        siteUrl={this.siteUrl}
        firstName={firstName(customer.name)}
        kind="ready"
        code={project.code}
        projectName={project.name}
        moduleName={module.name}
        round={module.round}
        link={`${this.siteUrl}${portalProjectHref(project.code)}/modules`}
      />,
    );
  }

  /** The customer approved a module or asked for changes: the team hears. */
  async moduleDecided(
    tx: Prisma.TransactionClient,
    project: EventProject & { id: string },
    module: { name: string },
    decision: 'approve' | 'changes',
    customerName: string,
  ): Promise<void> {
    const team = await this.projectTeam(project.id, tx);
    await this.notifications.notify(
      team.map((person) => person.id),
      {
        kind: 'module',
        text:
          decision === 'approve'
            ? `${customerName} approved ${module.name} (${project.code})`
            : `${customerName} asked for changes to ${module.name} (${project.code})`,
        href: `${teamProjectHref(project.code)}/modules`,
      },
      tx,
    );
  }

  async emailModuleDecided(
    project: EventProject & { id: string },
    module: { name: string; round: number },
    decision: 'approve' | 'changes',
    note: string | null,
    customerName: string,
  ): Promise<number> {
    const kind = decision === 'approve' ? 'approved' : 'changes';
    let sent = 0;
    for (const person of await this.projectTeam(project.id)) {
      const ok = await this.send(
        person.email,
        moduleReviewSubject(kind, module.name),
        <ModuleReviewEmail
          siteUrl={this.siteUrl}
          firstName={firstName(person.name)}
          kind={kind}
          code={project.code}
          projectName={project.name}
          moduleName={module.name}
          round={module.round}
          note={note}
          byName={customerName}
          link={`${this.siteUrl}${teamProjectHref(project.code)}/modules`}
        />,
      );
      if (ok) sent += 1;
    }
    return sent;
  }

  /**
   * Who does the work: the lead and the project team's members (active).
   * With nobody on the project, the super admins and admins.
   */
  async projectTeam(
    projectId: string,
    tx: Prisma.TransactionClient = this.prisma,
  ) {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: {
        lead: { select: { id: true, name: true, email: true, status: true } },
        members: {
          select: {
            user: {
              select: { id: true, name: true, email: true, status: true },
            },
          },
        },
      },
    });
    const people = [
      ...(project?.lead ? [project.lead] : []),
      ...(project?.members.map((member) => member.user) ?? []),
    ].filter((person) => person.status === 'ACTIVE');
    const unique = [...new Map(people.map((p) => [p.id, p])).values()];
    if (unique.length) return unique;
    return tx.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, status: 'ACTIVE' },
      select: { id: true, name: true, email: true, status: true },
    });
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
