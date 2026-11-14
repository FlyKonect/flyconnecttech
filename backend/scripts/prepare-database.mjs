// Creates the database in DATABASE_URL if it is missing, then applies the
// migrations. Used by the browser tests (npm run e2e:serve); safe to repeat.
// The database name must end in "_e2e" or "_test", so this never touches
// a real database by mistake.
import { execFileSync } from 'node:child_process';
import mariadb from 'mariadb';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set.');

const url = new URL(databaseUrl);
const name = decodeURIComponent(url.pathname.replace(/^\//, ''));
if (!/^[A-Za-z0-9_]+_(e2e|test)$/.test(name)) {
  throw new Error(
    `prepare-database only works on a database ending in "_e2e" or "_test", not "${name}".`,
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
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
