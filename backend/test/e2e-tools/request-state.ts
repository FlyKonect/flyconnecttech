// Browser tests only: does to a request what the team panel will do from
// Phase 6 (change its status, reply as a team member), so the portal's
// screens for those states can be tested now. Never runs on a real database.
//
//   node --import tsx test/e2e-tools/request-state.ts TKT-2026-00001 RESOLVED
//   node --import tsx test/e2e-tools/request-state.ts TKT-2026-00001 \
//     --reply "We found the cause." --author admin@e2e.test
import { parseArgs } from 'node:util';
import type { RequestStatus } from '../../src/generated/prisma/client.js';
import { createPrismaClient } from '../../src/prisma/connection.js';

const databaseUrl = process.env.DATABASE_URL ?? '';
const name = decodeURIComponent(new URL(databaseUrl).pathname.slice(1));
if (!/_(e2e|test)$/.test(name)) {
  throw new Error(`Only for test databases, not "${name}".`);
}

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { reply: { type: 'string' }, author: { type: 'string' } },
});
const [code, status] = positionals as [string, RequestStatus | undefined];

const prisma = createPrismaClient(databaseUrl);
try {
  const request = await prisma.supportRequest.findUniqueOrThrow({
    where: { code },
  });
  const now = new Date();

  if (values.reply) {
    const author = await prisma.user.findUniqueOrThrow({
      where: { email: values.author ?? '' },
    });
    await prisma.requestMessage.create({
      data: {
        requestId: request.id,
        authorId: author.id,
        kind: 'STAFF_REPLY',
        body: values.reply,
        createdAt: now,
      },
    });
  }

  if (status) {
    await prisma.supportRequest.update({
      where: { id: request.id },
      data: {
        status,
        slaPausedAt: status === 'WAITING_FOR_CUSTOMER' ? now : null,
        resolvedAt: status === 'RESOLVED' ? now : request.resolvedAt,
        updatedAt: now,
      },
    });
    await prisma.requestStatusChange.create({
      data: { requestId: request.id, from: request.status, to: status },
    });
  }
} finally {
  await prisma.$disconnect();
}
