import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { defaultSettings, type Settings } from './defaults.js';

/**
 * Reads and saves the app's settings. The live site never runs the seed,
 * so a missing row (or a missing part of one) falls back to the defaults
 * in defaults.ts.
 */
@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    const saved =
      row?.value && typeof row.value === 'object' && !Array.isArray(row.value)
        ? row.value
        : {};
    return { ...defaultSettings[key], ...saved } as Settings[K];
  }

  async all(): Promise<Settings> {
    const [responseTargets, teamNotifications] = await Promise.all([
      this.get('responseTargets'),
      this.get('teamNotifications'),
    ]);
    return { responseTargets, teamNotifications };
  }

  /**
   * Saves both settings in one go (screen 33). Each setting that actually
   * changed gets a settings.changed audit entry with the old and new value.
   * New response targets apply to new requests and priority changes;
   * requests already open keep their due time.
   */
  async save(actorId: string, next: Settings): Promise<Settings> {
    const before = await this.all();
    await this.prisma.$transaction(async (tx) => {
      for (const key of Object.keys(next) as (keyof Settings)[]) {
        const value = next[key];
        if (JSON.stringify(before[key]) === JSON.stringify(value)) continue;
        await tx.setting.upsert({
          where: { key },
          create: { key, value, updatedById: actorId },
          update: { value, updatedById: actorId },
        });
        await this.audit.record(
          {
            actorId,
            action: 'settings.changed',
            entityType: 'setting',
            entityId: key,
            data: { from: before[key], to: value },
          },
          tx,
        );
      }
    });
    return this.all();
  }
}
