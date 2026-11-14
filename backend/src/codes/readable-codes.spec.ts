import { jest } from '@jest/globals';
import type { Prisma } from '../generated/prisma/client.js';
import { counterName, formatCode, nextCode, ukYear } from './readable-codes.js';

describe('readable codes', () => {
  const nov2026 = new Date('2026-11-09T10:00:00Z');

  it('formats each kind as the spec shows', () => {
    expect(formatCode('request', counterName('request', nov2026), 125)).toBe(
      'TKT-2026-00125',
    );
    expect(formatCode('demo', counterName('demo', nov2026), 31)).toBe(
      'DEM-2026-031',
    );
    expect(formatCode('quote', counterName('quote', nov2026), 44)).toBe(
      'QUO-2026-044',
    );
    expect(formatCode('message', counterName('message', nov2026), 19)).toBe(
      'MSG-2026-019',
    );
    expect(formatCode('project', counterName('project', nov2026), 1042)).toBe(
      'P-1042',
    );
  });

  it('starts at 1 and grows past its digits instead of failing', () => {
    expect(formatCode('project', 'P', 1)).toBe('P-0001');
    expect(formatCode('demo', 'DEM-2026', 1000)).toBe('DEM-2026-1000');
  });

  it('refuses a number below 1', () => {
    expect(() => formatCode('project', 'P', 0)).toThrow();
    expect(() => formatCode('project', 'P', 1.5)).toThrow();
  });

  it('numbers restart each year, except projects', () => {
    expect(counterName('request', nov2026)).toBe('TKT-2026');
    expect(counterName('request', new Date('2027-01-05T09:00:00Z'))).toBe(
      'TKT-2027',
    );
    expect(counterName('project', nov2026)).toBe('P');
  });

  it('uses the UK year', () => {
    // 23:30 UTC on 31 December is still 31 December in the UK (winter).
    expect(ukYear(new Date('2026-12-31T23:30:00Z'))).toBe(2026);
    expect(ukYear(new Date('2027-01-01T00:00:00Z'))).toBe(2027);
  });

  it('nextCode turns the counter value into a code', async () => {
    const executeRaw = jest.fn(async () => 1);
    const queryRaw = jest.fn(async () => [{ n: BigInt(7) }]);
    const tx = {
      $executeRaw: executeRaw,
      $queryRaw: queryRaw,
    } as unknown as Prisma.TransactionClient;

    await expect(nextCode(tx, 'request', nov2026)).resolves.toBe(
      'TKT-2026-00007',
    );
    expect(executeRaw).toHaveBeenCalledTimes(1);
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
