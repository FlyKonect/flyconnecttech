import { ConflictException } from '@nestjs/common';
import type {
  LeadType,
  Prisma,
  ProjectType,
} from '../generated/prisma/client.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import {
  PROJECT_TYPE_FROM_DEMO,
  PROJECT_TYPE_FROM_QUOTE,
} from './lead-rules.js';
import {
  addActivity,
  kindOfCode,
  LEAD_TYPE,
  leadNotFound,
  leadTable,
  type LeadKind,
} from './lead-store.js';

/**
 * Convert a lead to a customer (docs/01 §6, screen 42): a Completed demo
 * or a Won quote, not yet converted.
 */

export type ConvertibleLead = {
  kind: LeadKind;
  type: LeadType;
  id: string;
  code: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  projectType: ProjectType;
};

export async function findConvertible(
  prisma: PrismaService | Prisma.TransactionClient,
  code: string,
): Promise<ConvertibleLead> {
  const kind = kindOfCode(code);
  const select = {
    id: true,
    code: true,
    status: true,
    name: true,
    email: true,
    company: true,
    phone: true,
    customerId: true,
  } as const;

  if (kind === 'demo') {
    const demo = await prisma.demoRequest.findUnique({
      where: { code },
      select: { ...select, topic: true },
    });
    if (!demo) throw leadNotFound();
    if (demo.status !== 'COMPLETED' || demo.customerId) throw notConvertible();
    return {
      kind,
      type: 'DEMO',
      ...demo,
      projectType: PROJECT_TYPE_FROM_DEMO[demo.topic],
    };
  }
  if (kind === 'quote') {
    const quote = await prisma.quoteRequest.findUnique({
      where: { code },
      select: { ...select, projectType: true },
    });
    if (!quote) throw leadNotFound();
    if (quote.status !== 'WON' || quote.customerId) throw notConvertible();
    return {
      kind,
      type: 'QUOTE',
      ...quote,
      projectType: PROJECT_TYPE_FROM_QUOTE[quote.projectType],
    };
  }
  throw leadNotFound();
}

/**
 * Inside the Add customer save: links the lead to the new customer and
 * logs it. Fails (and so undoes the save) if someone converted it first.
 */
export async function linkConverted(
  tx: Prisma.TransactionClient,
  lead: ConvertibleLead,
  customerId: string,
  actor: { id: string; name: string },
  email: string,
) {
  const linked = await leadTable(tx, lead.kind).updateMany({
    where: { id: lead.id, customerId: null },
    data: { customerId },
  });
  if (linked.count !== 1) throw notConvertible();
  await addActivity(tx, lead.kind, lead.id, {
    kind: 'SYSTEM',
    authorId: actor.id,
    body: `Converted to customer by ${actor.name}. Portal invitation sent to ${email}`,
  });
  return { sourceLeadType: LEAD_TYPE[lead.kind], sourceLeadId: lead.id };
}

function notConvertible() {
  return new ConflictException({
    code: 'NOT_CONVERTIBLE',
    message:
      'Only a completed demo or a won quote can be converted, and only once.',
  });
}
