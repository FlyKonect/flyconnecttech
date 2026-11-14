import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { Env } from '../config/env.js';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * The one shared database connection. Inject this service wherever the
 * database is needed; never create another PrismaClient.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService<Env, true>) {
    super({
      adapter: new PrismaMariaDb(toMariaDbUrl(config.get('DATABASE_URL'))),
    });
  }

  /** True when the database answers. */
  async isUp(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

/** The MariaDB driver wants mariadb://, while Prisma's own tools want mysql://. */
function toMariaDbUrl(url: string): string {
  return url.replace(/^mysql:\/\//, 'mariadb://');
}
