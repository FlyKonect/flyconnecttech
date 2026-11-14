import type { Prisma } from '../generated/prisma/client.js';

/**
 * Readable codes shown next to the UUIDs (docs/02, CLAUDE.md "Readable codes"):
 *
 *   request  TKT-2026-00001   numbering restarts each year
 *   demo     DEM-2026-001     numbering restarts each year
 *   quote    QUO-2026-001     numbering restarts each year
 *   message  MSG-2026-001     numbering restarts each year
 *   project  P-0001           one sequence for ever
 *
 * Numbers start at 1. A number never repeats, even when two records are
 * created at the same moment. When a sequence passes its digits (for
 * example request 100000 in one year) the code simply gets longer.
 */

export type CodeKind = 'request' | 'demo' | 'quote' | 'message' | 'project';

const FORMATS: Record<
  CodeKind,
  { prefix: string; digits: number; yearly: boolean }
> = {
  request: { prefix: 'TKT', digits: 5, yearly: true },
  demo: { prefix: 'DEM', digits: 3, yearly: true },
  quote: { prefix: 'QUO', digits: 3, yearly: true },
  message: { prefix: 'MSG', digits: 3, yearly: true },
  project: { prefix: 'P', digits: 4, yearly: false },
};

/** The year in the UK, where the business works. */
export function ukYear(when: Date): number {
  return Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric',
    }).format(when),
  );
}

/** The counter that a code is numbered from: "TKT-2026", or "P" for projects. */
export function counterName(kind: CodeKind, when: Date): string {
  const { prefix, yearly } = FORMATS[kind];
  return yearly ? `${prefix}-${ukYear(when)}` : prefix;
}

/** "TKT-2026" + 7 -> "TKT-2026-00007". */
export function formatCode(kind: CodeKind, counter: string, number: number) {
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(
      `A code number must be a whole number from 1, not ${number}.`,
    );
  }
  return `${counter}-${String(number).padStart(FORMATS[kind].digits, '0')}`;
}

/**
 * Takes the next code for a new record.
 *
 * Call it inside the same transaction that creates the record:
 *
 *   await prisma.$transaction(async (tx) => {
 *     const code = await nextCode(tx, 'request');
 *     return tx.supportRequest.create({ data: { code, ... } });
 *   });
 *
 * How it stays unique: the counter row is created or increased in one
 * statement, which locks that row until the transaction ends, so a second
 * caller waits for the first. If the transaction is rolled back, the number
 * is given back too. Both statements must run on the same database
 * connection, which is why a transaction is required.
 */
export async function nextCode(
  tx: Prisma.TransactionClient,
  kind: CodeKind,
  when: Date = new Date(),
): Promise<string> {
  const counter = counterName(kind, when);

  await tx.$executeRaw`
    INSERT INTO counters (name, value) VALUES (${counter}, LAST_INSERT_ID(1))
    ON DUPLICATE KEY UPDATE value = LAST_INSERT_ID(value + 1)`;
  const [row] = await tx.$queryRaw<{ n: bigint | number }[]>`
    SELECT LAST_INSERT_ID() AS n`;

  return formatCode(kind, counter, Number(row.n));
}
