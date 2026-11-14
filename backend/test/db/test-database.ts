/**
 * The database the database tests use. It is created if missing and brought
 * up to date with the migrations before the tests run.
 *
 * Set TEST_DATABASE_URL to choose it. Its name must end in "_test", so the
 * tests can never run against the real database by mistake.
 */
export const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  'mysql://root:root@localhost:3306/flyconnect_tech_test';

export function testDatabaseName(): string {
  const name = decodeURIComponent(
    new URL(testDatabaseUrl).pathname.replace(/^\//, ''),
  );
  if (!/^[A-Za-z0-9_]+_test$/.test(name)) {
    throw new Error(
      `TEST_DATABASE_URL must name a database ending in "_test", not "${name}".`,
    );
  }
  return name;
}
