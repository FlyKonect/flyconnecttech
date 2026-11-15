import { ConflictException, NotFoundException } from '@nestjs/common';
import type {
  LeadActivityKind,
  LeadType,
  Prisma,
} from '../generated/prisma/client.js';

/**
 * Shared database steps for the three kinds of website lead: demo requests,
 * quote requests and contact messages. Each kind has its own table; these
 * helpers do the steps that are the same for all three.
 */

export type LeadKind = 'demo' | 'quote' | 'message';

export const LEAD_TYPE: Record<LeadKind, LeadType> = {
  demo: 'DEMO',
  quote: 'QUOTE',
  message: 'MESSAGE',
};

export const KIND_OF_TYPE: Record<LeadType, LeadKind> = {
  DEMO: 'demo',
  QUOTE: 'quote',
  MESSAGE: 'message',
};

/** "Demo request", "Quote request", "Message". */
export const KIND_LABEL: Record<LeadKind, string> = {
  demo: 'Demo request',
  quote: 'Quote request',
  message: 'Message',
};

/** The part of the team panel address: /team/leads/demos/DEM-2026-031. */
export const KIND_PATH: Record<LeadKind, string> = {
  demo: 'demos',
  quote: 'quotes',
  message: 'messages',
};

export const leadHref = (kind: LeadKind, code: string) =>
  `/team/leads/${KIND_PATH[kind]}/${code}`;

/** The kind of lead a code belongs to: DEM-, QUO- or MSG-. */
export function kindOfCode(code: string): LeadKind | null {
  if (/^DEM-\d{4}-\d+$/.test(code)) return 'demo';
  if (/^QUO-\d{4}-\d+$/.test(code)) return 'quote';
  if (/^MSG-\d{4}-\d+$/.test(code)) return 'message';
  return null;
}

/** What the three tables have in common, for updateMany. */
type LeadTable = {
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
};

export function leadTable(
  tx: Prisma.TransactionClient,
  kind: LeadKind,
): LeadTable {
  const tables = {
    demo: tx.demoRequest,
    quote: tx.quoteRequest,
    message: tx.contactMessage,
  };
  return tables[kind] as unknown as LeadTable;
}

/** Adds a line to the lead's activity: a system line, an email or a note. */
export async function addActivity(
  tx: Prisma.TransactionClient,
  kind: LeadKind,
  leadId: string,
  activity: { kind: LeadActivityKind; authorId: string | null; body: string },
) {
  await tx.leadActivity.create({
    data: { leadType: LEAD_TYPE[kind], leadId, ...activity },
  });
}

/** The first action on an unowned lead makes the person doing it its owner. */
export async function claimOwner(
  tx: Prisma.TransactionClient,
  kind: LeadKind,
  leadId: string,
  actorId: string,
) {
  await leadTable(tx, kind).updateMany({
    where: { id: leadId, ownerId: null },
    data: { ownerId: actorId },
  });
}

/**
 * Moves a lead to a new status, only from the statuses given, so two
 * people clicking at the same moment can't both win.
 */
export async function moveStatus(
  tx: Prisma.TransactionClient,
  kind: LeadKind,
  leadId: string,
  from: readonly string[],
  data: Record<string, unknown> & { status: string },
) {
  const moved = await leadTable(tx, kind).updateMany({
    where: { id: leadId, status: { in: [...from] } },
    data,
  });
  if (moved.count !== 1) throw changedMeanwhile();
}

export function changedMeanwhile() {
  return new ConflictException({
    code: 'CHANGED',
    message:
      'Someone else changed this a moment ago. Refresh the page and try again.',
  });
}

export function leadNotFound() {
  return new NotFoundException({ code: 'NOT_FOUND' });
}

/** The answer when an action doesn't fit the lead's status now. */
export function notNow() {
  return new ConflictException({
    code: 'NOT_NOW',
    message: 'That is not possible at this stage. Refresh the page.',
  });
}
