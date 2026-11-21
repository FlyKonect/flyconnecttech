import { Controller, Get, Module, Query } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { Area, Can } from '../auth/decorators.js';
import { pageWindow, parsePaging } from '../common/paging.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ACTION_GROUPS, ACTION_WORDS, auditSubject } from './audit-words.js';
import { AuditService, type AuditAction } from './audit.service.js';

const isDay = (text?: string) => !!text && /^\d{4}-\d{2}-\d{2}$/.test(text);

/**
 * The Activity log (super admins only): who changed what in accounts,
 * customers, requests, exports and settings, newest first, paged.
 * ?what= (a group of ACTION_GROUPS), ?person= (a team member's id),
 * ?from= and ?to= (dates, both included).
 */
@Area('team')
@Can('audit.view')
@Controller('team/audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('what') what?: string,
    @Query('person') person?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    const actions = what ? ACTION_GROUPS[what] : undefined;
    const where: Prisma.AuditLogWhereInput = {
      ...(actions ? { action: { in: actions } } : {}),
      ...(person && /^[0-9a-f-]{36}$/i.test(person) ? { actorId: person } : {}),
      ...(isDay(from) || isDay(to)
        ? {
            createdAt: {
              ...(isDay(from) ? { gte: new Date(`${from}T00:00:00Z`) } : {}),
              ...(isDay(to)
                ? {
                    lt: new Date(new Date(`${to}T00:00:00Z`).getTime() + 864e5),
                  }
                : {}),
            },
          }
        : {}),
    };
    const total = await this.prisma.auditLog.count({ where });
    const window = pageWindow(parsePaging(page, size), total);
    const [rows, people] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: window.skip,
        take: window.take,
        select: {
          id: true,
          createdAt: true,
          action: true,
          entityId: true,
          data: true,
          actor: { select: { name: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { role: { not: 'CUSTOMER' }, status: { not: 'DELETED' } },
        orderBy: { name: 'asc' },
        select: { id: true, name: true },
      }),
    ]);
    return {
      total,
      page: window.page,
      pageSize: window.pageSize,
      groups: Object.keys(ACTION_GROUPS),
      people,
      rows: rows.map((row) => {
        const action = row.action as AuditAction;
        return {
          id: row.id,
          at: row.createdAt,
          who: row.actor?.name ?? 'The system',
          did: ACTION_WORDS[action] ?? row.action,
          subject: auditSubject(
            action,
            row.entityId,
            row.data as Record<string, unknown> | null,
          ),
        };
      }),
    };
  }
}

@Module({
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {}
