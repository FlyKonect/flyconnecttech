// Adds a project to a customer from the command line. The normal way is the
// team panel (Add customer, or Add project on the customer page); this stays
// for setting up and for the browser tests. A customer needs at least one
// project to send a support request.
//
//   npm run project:add -- --email sarah@bluewave.co.uk \
//     --name "Bluewave booking website" --type travel-booking-platform --status live
//
// Live (in the backend folder, over SSH):
//   node dist/cli/add-project.js --email "..." --name "..." --type website
// First: settings from .env, before React loads (see load-env.ts).
import '../config/load-env.js';
import { parseArgs } from 'node:util';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { nextCode } from '../codes/readable-codes.js';
import type { ProjectStatus, ProjectType } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

const TYPES: Record<string, ProjectType> = {
  website: 'WEBSITE',
  'web-application': 'WEB_APPLICATION',
  'travel-booking-platform': 'TRAVEL_BOOKING_PLATFORM',
  'agent-portal': 'AGENT_PORTAL',
  'api-integration': 'API_INTEGRATION',
  'custom-software': 'CUSTOM_SOFTWARE',
  'ui-ux-design': 'UI_UX_DESIGN',
  'maintenance-plan': 'MAINTENANCE_PLAN',
};

const STATUSES: Record<string, ProjectStatus> = {
  planning: 'PLANNING',
  'in-design': 'IN_DESIGN',
  'in-development': 'IN_DEVELOPMENT',
  live: 'LIVE',
  completed: 'COMPLETED',
};

const usage = `Usage:
  npm run project:add -- --email customer@example.com --name "Project name" --type <type>
Options:
  --type     ${Object.keys(TYPES).join(', ')}
  --status   ${Object.keys(STATUSES).join(', ')} (default planning)`;

function fail(message: string): never {
  console.error(`${message}\n\n${usage}`);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    type: { type: 'string' },
    status: { type: 'string' },
  },
  strict: true,
});

const email = values.email?.trim().toLowerCase();
const name = values.name?.trim();
const type = TYPES[values.type ?? ''];
const status = STATUSES[values.status ?? 'planning'];
if (!email) fail("Give the customer's email with --email.");
if (!name) fail('Give the project a name with --name.');
if (name.length > 160) fail('Keep the name under 160 characters.');
if (!type) fail('Choose a project type with --type.');
if (!status) fail('Choose a valid --status.');

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});

try {
  const prisma = app.get(PrismaService);
  const customer = await prisma.user.findUnique({
    where: { email },
    select: { role: true, customer: { select: { id: true, company: true } } },
  });
  if (!customer || customer.role !== 'CUSTOMER' || !customer.customer) {
    throw new Error(`There is no customer account for ${email}.`);
  }
  const { id: customerId, company } = customer.customer;

  const project = await prisma.$transaction(async (tx) =>
    tx.project.create({
      data: {
        code: await nextCode(tx, 'project'),
        name,
        type,
        status,
        customerId,
      },
    }),
  );
  console.log(`\nAdded ${project.code} · ${project.name} for ${company}.\n`);
} catch (error) {
  console.error(`\nNot added: ${(error as Error).message}\n`);
  process.exitCode = 1;
} finally {
  await app.close();
}
