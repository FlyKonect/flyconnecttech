import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Prisma, RequestStatus } from '../generated/prisma/client.js';
import type { SlaRules } from './sla.js';
import type { CheckedFile } from '../uploads/file-storage.service.js';
import { statusChangeFields } from './status-rules.js';

/**
 * Pieces shared by the customer's and the team's changes to a request
 * (requests.service.ts, team-requests.service.ts).
 */

/**
 * Request changes run with the database's lighter locking (read committed),
 * so two people working at the same moment don't block each other (see
 * ACCOUNT_TX in accounts/).
 */
export const REQUEST_TX = { isolationLevel: 'ReadCommitted' } as const;

export const ALL_STATUSES: readonly RequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
];

/** What a change needs to know about the request. */
export const stateSelect = {
  id: true,
  code: true,
  title: true,
  priority: true,
  status: true,
  assigneeId: true,
  customerId: true,
  dueAt: true,
  resolveDueAt: true,
  slaPausedAt: true,
  firstResponseAt: true,
  createdAt: true,
} satisfies Prisma.SupportRequestSelect;

export type RequestState = Prisma.SupportRequestGetPayload<{
  select: typeof stateSelect;
}>;

/**
 * Moves the request to a new status if nobody changed it meanwhile, with
 * its status history row and, when given, a line in the conversation.
 * Returns false if the status had already changed.
 */
export async function moveStatus(
  tx: Prisma.TransactionClient,
  request: RequestState,
  to: RequestStatus,
  options: {
    /** Who changed it; null for an automatic change (auto-close). */
    actorId: string | null;
    /** A system line in the conversation, or null for none. */
    line: string | null;
    now: Date;
    targets: SlaRules;
  },
): Promise<boolean> {
  const fields = statusChangeFields({
    from: request.status,
    to,
    now: options.now,
    priority: request.priority,
    dueAt: request.dueAt,
    resolveDueAt: request.resolveDueAt,
    slaPausedAt: request.slaPausedAt,
    targets: options.targets,
  });
  const moved = await tx.supportRequest.updateMany({
    where: { id: request.id, status: request.status },
    data: { ...fields, updatedAt: options.now },
  });
  if (moved.count !== 1) return false;
  await tx.requestStatusChange.create({
    data: {
      requestId: request.id,
      from: request.status,
      to,
      byId: options.actorId,
      createdAt: options.now,
    },
  });
  if (options.line) await systemLine(tx, request.id, options.line, options.now);
  return true;
}

/** A small centred line in the conversation ("Assigned to … by …"). */
export async function systemLine(
  tx: Prisma.TransactionClient,
  requestId: string,
  body: string,
  createdAt: Date,
): Promise<void> {
  await tx.requestMessage.create({
    data: { requestId, authorId: null, kind: 'SYSTEM', body, createdAt },
  });
}

/** Saves checked, kept files as the request's (or a message's) attachments. */
export async function saveFiles(
  tx: Prisma.TransactionClient,
  files: CheckedFile[],
  keys: string[],
  requestId: string,
  uploadedById: string,
  messageId: string | null,
): Promise<void> {
  if (!files.length) return;
  await tx.attachment.createMany({
    data: files.map((file, i) => ({
      requestId,
      messageId,
      fileName: file.fileName,
      contentType: file.contentType,
      size: file.size,
      storageKey: keys[i],
      uploadedById,
    })),
  });
}

/** Counts per status from a groupBy, added up for the given statuses. */
export function countOf(
  groups: { status: RequestStatus; _count: { _all: number } }[],
  ...statuses: RequestStatus[]
): number {
  return groups
    .filter((group) => statuses.includes(group.status))
    .reduce((sum, group) => sum + group._count._all, 0);
}

export function requestNotFound() {
  return new NotFoundException({
    code: 'NOT_FOUND',
    message: 'We could not find that request.',
  });
}

export function changedMeanwhile() {
  return new ConflictException({
    code: 'STATUS_CHANGED',
    message: 'This request has changed. Refresh the page and try again.',
  });
}
