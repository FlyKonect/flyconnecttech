import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import type { SignedIn } from '../auth/signed-in.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LeadEventsService } from './lead-events.service.js';
import {
  firstNameOf,
  formatUsd,
  isDemoSlot,
  ukSlotLong,
  type CANCEL_REASONS,
  type LOST_REASONS,
} from './lead-rules.js';
import {
  addActivity,
  claimOwner,
  leadNotFound,
  moveStatus,
  notNow,
  type LeadKind,
} from './lead-store.js';

const TX = { isolationLevel: 'ReadCommitted' } as const;

type Lead = { id: string; code: string; status: string; name: string };

/**
 * The status buttons on a lead's page (docs/01 §6), with the design's
 * activity lines. Each one also makes the person its owner if it had none.
 * Emails go after the change is saved; the answer says whether they went.
 */
@Injectable()
export class LeadActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: LeadEventsService,
  ) {}

  // --------------------------------------------------------------- demo

  /** Confirm time, or Reschedule a scheduled demo. */
  async confirmDemo(
    actor: SignedIn,
    code: string,
    input: { start: string; hostId: string; videoLink?: string },
  ) {
    const demo = await this.demo(code);
    if (demo.status !== 'NEW' && demo.status !== 'SCHEDULED') throw notNow();
    const start = new Date(input.start);
    if (!isDemoSlot(start)) {
      throw new BadRequestException({
        code: 'NOT_A_SLOT',
        message: 'Pick a weekday and one of the demo times.',
      });
    }
    const host = (await this.events.leadTeam()).find(
      (person) => person.id === input.hostId,
    );
    if (!host) {
      throw new BadRequestException({
        code: 'NOT_A_HOST',
        message: 'Choose a super admin, admin or manager as the host.',
      });
    }
    const moved = demo.status === 'SCHEDULED';
    const ownerId = demo.ownerId ?? host.id;

    try {
      await this.prisma.$transaction(async (tx) => {
        await moveStatus(tx, 'demo', demo.id, ['NEW', 'SCHEDULED'], {
          status: 'SCHEDULED',
          scheduledStart: start,
          // Unique: two scheduled demos can never share a time.
          scheduledSlot: start,
          hostId: host.id,
          videoLink: input.videoLink?.trim() || null,
          ownerId,
        });
        await addActivity(tx, 'demo', demo.id, {
          kind: 'SYSTEM',
          authorId: actor.id,
          body: `${moved ? 'Rescheduled to' : 'Confirmed for'} ${ukSlotLong(start)} by ${actor.name}`,
        });
        await this.events.scheduled(
          tx,
          { code: demo.code, ownerId, hostId: host.id },
          start,
          moved,
          actor.id,
        );
      }, TX);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException({
          code: 'SLOT_TAKEN',
          message:
            'That time is already booked for another demo. Pick another time.',
        });
      }
      throw error;
    }

    const saved = await this.prisma.demoRequest.findUniqueOrThrow({
      where: { id: demo.id },
    });
    const text = await this.events.sendInvite(saved, start, host.name, moved);
    if (text) await this.logEmail('demo', demo.id, actor.id, text);
    return { status: 'SCHEDULED', emailSent: !!text, email: demo.email };
  }

  completeDemo(actor: SignedIn, code: string) {
    return this.simple(actor, 'demo', code, ['SCHEDULED'], {
      data: { status: 'COMPLETED', scheduledSlot: null },
      line: () => `Demo completed · marked by ${actor.name}`,
    });
  }

  async cancelDemo(
    actor: SignedIn,
    code: string,
    input: { reason: (typeof CANCEL_REASONS)[number]; email: boolean },
  ) {
    const demo = await this.demo(code);
    if (demo.status !== 'NEW' && demo.status !== 'SCHEDULED') throw notNow();
    const wasScheduled =
      demo.status === 'SCHEDULED' ? demo.scheduledStart : null;
    await this.prisma.$transaction(async (tx) => {
      await moveStatus(tx, 'demo', demo.id, ['NEW', 'SCHEDULED'], {
        status: 'CANCELLED',
        scheduledSlot: null,
        cancelReason: input.reason,
      });
      await claimOwner(tx, 'demo', demo.id, actor.id);
      await addActivity(tx, 'demo', demo.id, {
        kind: 'SYSTEM',
        authorId: actor.id,
        body: `Cancelled by ${actor.name} · ${input.reason}`,
      });
    }, TX);
    let emailSent = false;
    if (input.email) {
      const text = await this.events.sendCancelled(
        demo,
        wasScheduled,
        demo.host?.name ?? null,
      );
      if (text) await this.logEmail('demo', demo.id, actor.id, text);
      emailSent = !!text;
    }
    return {
      status: 'CANCELLED',
      emailSent,
      firstName: firstNameOf(demo.name),
    };
  }

  reopenDemo(actor: SignedIn, code: string) {
    return this.simple(actor, 'demo', code, ['CANCELLED'], {
      data: { status: 'NEW', cancelReason: null, scheduledStart: null },
      line: () => `Reopened by ${actor.name}`,
    });
  }

  // -------------------------------------------------------------- quote

  startReview(actor: SignedIn, code: string) {
    return this.simple(actor, 'quote', code, ['NEW'], {
      data: { status: 'REVIEWING' },
      line: () => `Review started by ${actor.name}`,
    });
  }

  /** Send estimate, or Update estimate: every estimate is kept. */
  async sendEstimate(
    actor: SignedIn,
    code: string,
    input: {
      amount: number;
      deliveryTime: string;
      validUntil: string;
      summary: string;
    },
  ) {
    const quote = await this.prisma.quoteRequest.findUnique({
      where: { code },
      include: { _count: { select: { estimates: true } } },
    });
    if (!quote) throw leadNotFound();
    if (!['NEW', 'REVIEWING', 'ESTIMATE_SENT'].includes(quote.status)) {
      throw notNow();
    }
    const validUntil = new Date(`${input.validUntil}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (Number.isNaN(validUntil.getTime()) || validUntil < today) {
      throw new BadRequestException({
        code: 'BAD_DATE',
        message: 'Choose a date from today on.',
      });
    }
    const estimate = {
      amountCents: Math.round(input.amount * 100),
      deliveryTime: input.deliveryTime.trim() || 'to be confirmed',
      validUntil,
      summary: input.summary.trim(),
    };
    const updated = quote._count.estimates > 0;
    await this.prisma.$transaction(async (tx) => {
      await moveStatus(
        tx,
        'quote',
        quote.id,
        ['NEW', 'REVIEWING', 'ESTIMATE_SENT'],
        { status: 'ESTIMATE_SENT' },
      );
      await tx.estimate.create({
        data: { ...estimate, quoteRequestId: quote.id, sentById: actor.id },
      });
      await claimOwner(tx, 'quote', quote.id, actor.id);
      await addActivity(tx, 'quote', quote.id, {
        kind: 'SYSTEM',
        authorId: actor.id,
        body: `${updated ? 'Updated estimate of' : 'Estimate of'} ${formatUsd(estimate.amountCents)} sent by ${actor.name}`,
      });
    }, TX);
    const text = await this.events.sendEstimate(quote, estimate, updated);
    if (text) await this.logEmail('quote', quote.id, actor.id, text);
    return { status: 'ESTIMATE_SENT', emailSent: !!text, email: quote.email };
  }

  markWon(actor: SignedIn, code: string) {
    return this.simple(actor, 'quote', code, ['ESTIMATE_SENT'], {
      data: { status: 'WON' },
      line: (lead) =>
        `Marked as won by ${actor.name} · ${firstNameOf(lead.name)} accepted the estimate`,
    });
  }

  async markLost(
    actor: SignedIn,
    code: string,
    input: { reason: (typeof LOST_REASONS)[number]; note?: string },
  ) {
    const note = input.note?.trim();
    return this.simple(
      actor,
      'quote',
      code,
      ['NEW', 'REVIEWING', 'ESTIMATE_SENT'],
      {
        data: { status: 'LOST', lostReason: input.reason },
        line: () => `Marked as lost by ${actor.name} · ${input.reason}`,
        // The note for the team is an internal note.
        before: note
          ? (tx, lead) =>
              addActivity(tx, 'quote', lead.id, {
                kind: 'NOTE',
                authorId: actor.id,
                body: note,
              })
          : undefined,
      },
    );
  }

  reopenQuote(actor: SignedIn, code: string) {
    return this.simple(actor, 'quote', code, ['LOST'], {
      data: { status: 'REVIEWING', lostReason: null },
      line: () => `Reopened by ${actor.name}`,
    });
  }

  // ------------------------------------------------------------ message

  closeMessage(actor: SignedIn, code: string) {
    return this.simple(actor, 'message', code, ['NEW', 'REPLIED'], {
      data: { status: 'CLOSED' },
      line: () => `Closed by ${actor.name}`,
    });
  }

  /** Back to Replied if the team replied, otherwise to New. */
  async reopenMessage(actor: SignedIn, code: string) {
    const message = await this.prisma.contactMessage.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!message) throw leadNotFound();
    const replies = await this.prisma.leadActivity.count({
      where: { leadType: 'MESSAGE', leadId: message.id, kind: 'EMAIL' },
    });
    return this.simple(actor, 'message', code, ['CLOSED'], {
      data: { status: replies ? 'REPLIED' : 'NEW' },
      line: () => `Reopened by ${actor.name}`,
    });
  }

  // ------------------------------------------------------------ helpers

  private async demo(code: string) {
    const demo = await this.prisma.demoRequest.findUnique({
      where: { code },
      include: { host: { select: { name: true } } },
    });
    if (!demo) throw leadNotFound();
    return demo;
  }

  private async find(kind: LeadKind, code: string): Promise<Lead | null> {
    const select = { id: true, code: true, status: true, name: true } as const;
    if (kind === 'demo') {
      return this.prisma.demoRequest.findUnique({ where: { code }, select });
    }
    if (kind === 'quote') {
      return this.prisma.quoteRequest.findUnique({ where: { code }, select });
    }
    return this.prisma.contactMessage.findUnique({ where: { code }, select });
  }

  /** A status change with one activity line. */
  private async simple(
    actor: SignedIn,
    kind: LeadKind,
    code: string,
    from: readonly string[],
    change: {
      data: Record<string, unknown> & { status: string };
      line: (lead: Lead) => string;
      before?: (tx: Prisma.TransactionClient, lead: Lead) => Promise<void>;
    },
  ) {
    const lead = await this.find(kind, code);
    if (!lead) throw leadNotFound();
    if (!from.includes(lead.status)) throw notNow();
    await this.prisma.$transaction(async (tx) => {
      await moveStatus(tx, kind, lead.id, from, change.data);
      await claimOwner(tx, kind, lead.id, actor.id);
      await change.before?.(tx, lead);
      await addActivity(tx, kind, lead.id, {
        kind: 'SYSTEM',
        authorId: actor.id,
        body: change.line(lead),
      });
    }, TX);
    return { status: change.data.status };
  }

  /** The email as it was sent, in the activity. */
  private logEmail(
    kind: LeadKind,
    leadId: string,
    authorId: string,
    body: string,
  ) {
    return addActivity(this.prisma, kind, leadId, {
      kind: 'EMAIL',
      authorId,
      body,
    });
  }
}
