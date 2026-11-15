import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { defaultSettings, type Settings } from './defaults.js';

/**
 * Reads the app's settings. The live site never runs the seed, so a missing
 * row (or a missing part of one) falls back to the defaults in defaults.ts.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    const saved =
      row?.value && typeof row.value === 'object' && !Array.isArray(row.value)
        ? row.value
        : {};
    return { ...defaultSettings[key], ...saved } as Settings[K];
  }
}

@Global()
@Module({ providers: [SettingsService], exports: [SettingsService] })
export class SettingsModule {}
