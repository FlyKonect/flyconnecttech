import { Injectable } from '@nestjs/common';
import type { NotificationKind, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type NewNotification = {
  kind: NotificationKind;
  text: string;
  /** The page it opens, for example /portal/requests/TKT-2026-00001. */
  href: string;
};

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  text: string;
  href: string;
  read: boolean;
  createdAt: Date;
};

/**
 * In-app notifications (docs/01, section 7). Everyone only ever reads and
 * changes their own.
 */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Sends one notification to each person. Pass the transaction to send it with the change. */
  async notify(
    userIds: string[],
    notification: NewNotification,
    tx: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    const unique = [...new Set(userIds)];
    if (!unique.length) return;
    await tx.notification.createMany({
      data: unique.map((userId) => ({ userId, ...notification })),
    });
  }

  async list(userId: string, take = 50, skip = 0): Promise<NotificationItem[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip,
    });
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      text: row.text,
      href: row.href,
      read: row.readAt !== null,
      createdAt: row.createdAt,
    }));
  }

  /** All of this person's notifications, read or not. */
  count(userId: string) {
    return this.prisma.notification.count({ where: { userId } });
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, readAt: null } });
  }

  async markRead(userId: string, id: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
