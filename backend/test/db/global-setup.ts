import { execFileSync } from 'node:child_process';
import mariadb from 'mariadb';

/**
 * Runs once before the database tests: creates and migrates the test database.
 *
 * Jest loads this file differently from the tests, so it cannot import the
 * project's own files. The database address rules are repeated here on
 * purpose; keep them in step with test/db/test-database.ts.
 */
export default async function globalSetup(): Promise<void> {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ??
    'mysql://root:root@localhost:3306/flyconnect_tech_test';
  const url = new URL(databaseUrl);
  const name = decodeURIComponent(url.pathname.replace(/^\//, ''));

  if (!/^[A-Za-z0-9_]+_test$/.test(name)) {
    throw new Error(
      `TEST_DATABASE_URL must name a database ending in "_test", not "${name}".`,
    );
  }

  const connection = await mariadb.createConnection({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  });
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await connection.end();
  }

  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}
