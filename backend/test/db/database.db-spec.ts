import { nextCode } from '../../src/codes/readable-codes.js';
import type { PrismaClient } from '../../src/generated/prisma/client.js';
import { createPrismaClient } from '../../src/prisma/connection.js';
import { testDatabaseUrl } from './test-database.js';

// These tests use a real MariaDB (see test/db/test-database.ts).
// Run them with: npm run test:db  (the Docker database must be running).

let prisma: PrismaClient;

beforeAll(() => {
  prisma = createPrismaClient(testDatabaseUrl);
});

afterAll(async () => {
  await prisma.$disconnect();
});

// A year nobody else uses, so these tests never touch real counters.
const testYear = new Date('2099-06-01T12:00:00Z');
const waitLong = { maxWait: 30_000, timeout: 30_000 };

describe('readable codes on a real database', () => {
  beforeEach(async () => {
    await prisma.counter.deleteMany({
      where: { name: { in: ['DEM-2099', 'QUO-2099'] } },
    });
  });

  it('gives 50 different numbers when 50 records are created at once', async () => {
    const codes = await Promise.all(
      Array.from({ length: 50 }, () =>
        prisma.$transaction((tx) => nextCode(tx, 'demo', testYear), waitLong),
      ),
    );

    expect(new Set(codes).size).toBe(50);
    expect([...codes].sort()).toEqual(
      Array.from(
        { length: 50 },
        (_, i) => `DEM-2099-${String(i + 1).padStart(3, '0')}`,
      ),
    );
  });

  it('gives a number back when the record is not saved', async () => {
    await prisma.$transaction((tx) => nextCode(tx, 'quote', testYear));

    await expect(
      prisma.$transaction(async (tx) => {
        await nextCode(tx, 'quote', testYear);
        throw new Error('saving the record failed');
      }),
    ).rejects.toThrow('saving the record failed');

    await expect(
      prisma.$transaction((tx) => nextCode(tx, 'quote', testYear)),
    ).resolves.toBe('QUO-2099-002');
  });
});

describe('time zone', () => {
  it('every database session runs in UTC', async () => {
    const [row] = await prisma.$queryRaw<{ tz: string; now: Date }[]>`
      SELECT @@session.time_zone AS tz, NOW(3) AS now`;

    expect(row.tz).toBe('+00:00');
    expect(Math.abs(new Date(row.now).getTime() - Date.now())).toBeLessThan(
      60_000,
    );
  });
});
