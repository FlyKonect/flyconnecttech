import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * Builds the database connection from DATABASE_URL
 * (mysql://USER:PASSWORD@HOST:PORT/DATABASE).
 *
 * Every connection is switched to UTC as soon as it opens. Prisma already
 * writes and reads times as UTC, but anything the database works out itself
 * (a default "now", or raw SQL) would otherwise use the server's own time
 * zone, which on shared hosting is often not UTC.
 */
export function mariaDbConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (url.protocol !== 'mysql:' && url.protocol !== 'mariadb:') {
    throw new Error('DATABASE_URL must start with mysql:// or mariadb://');
  }

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
    initSql: "SET time_zone = '+00:00'",
    // Shared hosting allows only a few connections per account.
    connectionLimit: Number(url.searchParams.get('connection_limit') ?? 5),
  };
}

/** A database client for scripts and tests. The app uses PrismaService. */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaMariaDb(mariaDbConfig(databaseUrl)),
  });
}
