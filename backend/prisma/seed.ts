// Prepares a new database: adds the settings the app needs to run.
//
// No sample people, customers, requests or leads: the database starts empty.
// Safe to run more than once: a setting that already exists is left as it
// is, so this never undoes a change a super admin made.
//
//   npm run db:seed
import 'dotenv/config';
import { createPrismaClient } from '../src/prisma/connection.js';
import { defaultSettings } from '../src/settings/defaults.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set (backend/.env).');

const prisma = createPrismaClient(databaseUrl);

try {
  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = await prisma.setting.findUnique({ where: { key } });
    if (existing) {
      console.log(`Setting "${key}" already exists, left as it is.`);
      continue;
    }
    await prisma.setting.create({ data: { key, value } });
    console.log(`Setting "${key}" added.`);
  }
  console.log('Seed done.');
} finally {
  await prisma.$disconnect();
}
