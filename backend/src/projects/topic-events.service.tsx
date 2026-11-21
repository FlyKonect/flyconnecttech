import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readEmailPrefs } from '../accounts/email-prefs.js';
import type { Env } from '../config/env.js';
import { EmailService } from '../email/email.service.js';
import {
  DiscussionEmail,
  discussionSubject,
  type DiscussionEmailKind,
} from '../email/templates/discussion.js';
import type { Prisma, Role, TopicKind } from '../generated/prisma/client.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { firstName } from './project-events.service.js';
import { topicHref } from './topic-rules.js';

/** Someone who may hear about a topic. */
export type Listener = {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailPrefs: unknown;
};

/** What the alerts need to know about a topic. */
export type EventTopic = {
  number: number;
  kind: TopicKind;
  title: string;
  project: { code: string; name: string };
};

/**
 * Who hears about a discussion: an in-app notice (inside the caller's
 * transaction) and an email after it. Customers follow their "A
 * discussion reply is posted" choice; team topics never reach them (the
 * caller never passes a customer for those). A failed email never undoes
 * the post.
 */
@Injectable()
export class TopicEventsService {
  private readonly siteUrl: string;
  private readonly logger = new Logger(TopicEventsService.name);

  constructor(
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
    config: ConfigService<Env, true>,
  ) {
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  /** In-app notices: customers open the portal's topic, the team theirs. */
  async notify(
    tx: Prisma.TransactionClient,
    topic: EventTopic,
    people: Listener[],
    text: string,
  ): Promise<void> {
    const customers = people.filter((p) => p.role === 'CUSTOMER');
    const team = people.filter((p) => p.role !== 'CUSTOMER');
    const href = (area: 'portal' | 'team') =>
      topicHref(area, topic.project.code, topic.kind, topic.number);
    if (customers.length && topic.kind === 'CUSTOMER') {
      await this.notifications.notify(
        customers.map((p) => p.id),
        { kind: 'discussion', text, href: href('portal') },
        tx,
      );
    }
    if (team.length) {
      await this.notifications.notify(
        team.map((p) => p.id),
        { kind: 'discussion', text, href: href('team') },
        tx,
      );
    }
  }

  /** The emails; returns how many went out. */
  async send(
    topic: EventTopic,
    people: Listener[],
    kind: DiscussionEmailKind,
    post: { authorName: string; body: string; files: number },
  ): Promise<number> {
    let sent = 0;
    for (const person of people) {
      const customer = person.role === 'CUSTOMER';
      if (customer) {
        if (topic.kind !== 'CUSTOMER') continue;
        if (!readEmailPrefs(person.emailPrefs).discussionReplies) continue;
      }
      const subject = discussionSubject(kind, post.authorName, topic.title);
      const link = `${this.siteUrl}${topicHref(
        customer ? 'portal' : 'team',
        topic.project.code,
        topic.kind,
        topic.number,
      )}`;
      try {
        await this.email.send({
          to: person.email,
          subject,
          template: (
            <DiscussionEmail
              siteUrl={this.siteUrl}
              firstName={firstName(person.name)}
              kind={kind}
              authorName={post.authorName}
              code={topic.project.code}
              projectName={topic.project.name}
              number={topic.number}
              title={topic.title}
              body={post.body}
              files={post.files}
              internal={topic.kind === 'INTERNAL'}
              link={link}
            />
          ),
        });
        sent += 1;
      } catch (error) {
        this.logger.error(`Could not send "${subject}": ${String(error)}`);
      }
    }
    return sent;
  }
}
