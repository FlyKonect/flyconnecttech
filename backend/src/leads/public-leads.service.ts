import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { nextCode } from '../codes/readable-codes.js';
import type {
  Budget,
  DemoTopic,
  MessageTopic,
  QuoteProjectType,
  Timeline,
} from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LeadEventsService } from './lead-events.service.js';
import {
  DEMO_DAYS_OFFERED,
  isDemoSlot,
  MESSAGE_TOPIC_LABELS,
  pageName,
} from './lead-rules.js';
import { addActivity } from './lead-store.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;

export type NewDemo = {
  topic: DemoTopic;
  preferredStart: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  notes?: string;
  sourcePage?: string;
};

export type NewQuote = {
  projectType: QuoteProjectType;
  budget: Budget;
  timeline?: Timeline;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  requirements: string;
  sourcePage?: string;
};

export type NewMessage = {
  topic: MessageTopic;
  name: string;
  email: string;
  message: string;
  sourcePage?: string;
};

const blankToNull = (value: string | undefined) => value?.trim() || null;

/**
 * The website's forms (docs/01 §2): Book a demo, Get a quote and Send a
 * message. Each creates its lead with its readable code, an activity line
 * and the team's notifications, then sends the emails. The controller has
 * already checked the input, the rate limit and the honeypot.
 */
@Injectable()
export class PublicLeadsService {
  private readonly logger = new Logger(PublicLeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: LeadEventsService,
  ) {}

  /**
   * The visitor's copy and the team alerts go out after the answer, so the
   * visitor never waits for the team's emails. They never throw.
   */
  private afterAnswer(emails: Promise<void>) {
    emails.catch((error: unknown) =>
      this.logger.error(
        `Lead emails could not be sent: ${(error as Error).message}`,
      ),
    );
  }

  /** Times a scheduled demo already holds, for the Book a demo calendar. */
  async takenSlots(now = new Date()): Promise<string[]> {
    const rows = await this.prisma.demoRequest.findMany({
      where: { scheduledSlot: { gte: now } },
      select: { scheduledSlot: true },
    });
    return rows.map((row) => row.scheduledSlot!.toISOString());
  }

  async createDemo(input: NewDemo, now = new Date()) {
    const start = new Date(input.preferredStart);
    // One of the website's times: a weekday slot in the next two weeks or
    // so (a little slack for a dialog left open over midnight).
    const latest = now.getTime() + (DEMO_DAYS_OFFERED + 6) * 86_400_000;
    if (!isDemoSlot(start, now) || start.getTime() > latest) {
      throw new BadRequestException({
        code: 'NOT_A_SLOT',
        message: 'Please pick one of the times shown.',
      });
    }
    const taken = await this.prisma.demoRequest.findFirst({
      where: { scheduledSlot: start },
      select: { id: true },
    });
    if (taken) {
      throw new ConflictException({
        code: 'SLOT_TAKEN',
        message: 'That time was just booked. Please pick another one.',
      });
    }

    const page = pageName(input.sourcePage);
    const demo = await this.prisma.$transaction(async (tx) => {
      const created = await tx.demoRequest.create({
        data: {
          code: await nextCode(tx, 'demo', now),
          topic: input.topic,
          preferredStart: start,
          name: input.name.trim(),
          email: input.email.trim(),
          company: input.company.trim(),
          phone: blankToNull(input.phone),
          notes: blankToNull(input.notes),
          sourcePage: page,
        },
      });
      await addActivity(tx, 'demo', created.id, {
        kind: 'SYSTEM',
        authorId: null,
        body: `Demo requested from the ${page} page`,
      });
      await this.events.created(tx, 'demo', created);
      return created;
    }, TX);
    this.afterAnswer(this.events.emailNewDemo(demo));
  }

  async createQuote(input: NewQuote, now = new Date()) {
    const page = pageName(input.sourcePage);
    const quote = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quoteRequest.create({
        data: {
          code: await nextCode(tx, 'quote', now),
          projectType: input.projectType,
          budget: input.budget,
          timeline: input.timeline ?? null,
          name: input.name.trim(),
          email: input.email.trim(),
          company: blankToNull(input.company),
          phone: blankToNull(input.phone),
          requirements: input.requirements.trim(),
          sourcePage: page,
        },
      });
      await addActivity(tx, 'quote', created.id, {
        kind: 'SYSTEM',
        authorId: null,
        body: `Quote requested from the ${page} page`,
      });
      await this.events.created(tx, 'quote', created);
      return created;
    }, TX);
    this.afterAnswer(this.events.emailNewQuote(quote));
  }

  async createMessage(input: NewMessage, now = new Date()) {
    const page = pageName(input.sourcePage);
    const email = input.email.trim();
    // A message from one of our customers is linked to them (docs/01 §2).
    const customer = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), role: 'CUSTOMER' },
      select: { customerId: true },
    });
    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.contactMessage.create({
        data: {
          code: await nextCode(tx, 'message', now),
          topic: input.topic,
          name: input.name.trim(),
          email,
          message: input.message.trim(),
          sourcePage: page,
          customerId: customer?.customerId ?? null,
        },
      });
      await addActivity(tx, 'message', created.id, {
        kind: 'SYSTEM',
        authorId: null,
        body: `Message sent from the ${page} page`,
      });
      await this.events.created(
        tx,
        'message',
        created,
        MESSAGE_TOPIC_LABELS[created.topic],
      );
      return created;
    }, TX);
    this.afterAnswer(this.events.emailNewMessage(message));
  }
}
