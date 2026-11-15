import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** The actions recorded in the audit log (docs/02, "AuditLog"). */
export type AuditAction =
  | 'user.invited'
  | 'invitation.resent'
  | 'user.roleChanged'
  | 'user.disabled'
  | 'passwordReset.sent'
  | 'customer.created'
  | 'project.added'
  | 'project.statusChanged'
  | 'settings.changed'
  | 'lead.converted';

export type AuditEntry = {
  actorId: string | null;
  action: AuditAction;
  entityType: 'user' | 'customer' | 'project' | 'setting' | 'lead';
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
