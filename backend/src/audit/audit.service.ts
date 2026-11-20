import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** The actions recorded in the audit log (docs/02, "AuditLog"). */
export type AuditAction =
  | 'user.invited'
  | 'invitation.resent'
  | 'user.roleChanged'
  | 'user.disabled'
  | 'user.enabled'
  | 'user.deleted'
  | 'user.restored'
  | 'passwordReset.sent'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted'
  | 'customer.restored'
  | 'project.added'
  | 'project.updated'
  | 'project.statusChanged'
  | 'settings.changed'
  | 'lead.converted'
  | 'testimonial.added'
  | 'testimonial.changed'
  | 'testimonial.removed';

export type AuditEntry = {
  actorId: string | null;
  action: AuditAction;
  entityType:
    'user' | 'customer' | 'project' | 'setting' | 'lead' | 'testimonial';
  entityId: string;
  data?: Prisma.InputJsonValue;
};

/** Writes audit log entries. Pass the transaction to record it with the change. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    entry: AuditEntry,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        data: entry.data ?? {},
      },
    });
  }
}
