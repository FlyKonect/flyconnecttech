// Invites a person from the command line, before the "Add user" screen exists
// (Phase 7) and for the very first super admin.
//
//   npm run user:invite -- --role super-admin --name "Your Name" --email you@yourdomain.com
//   npm run user:invite -- --role customer --name "Sarah Mitchell" \
//     --email sarah@bluewave.co.uk --company "Bluewave Holidays"
//
// Live (in the backend folder, over SSH):
//   node dist/cli/invite-user.js --role super-admin --name "..." --email "..."
//
// It sends the normal invitation email and also prints the link, in case
// email is not set up yet. Anyone holding the link can activate the account,
// so share it only with that person.
// First: settings from .env, before React loads (see load-env.ts).
import '../config/load-env.js';
import { parseArgs } from 'node:util';
import { NestFactory } from '@nestjs/core';
import { InvitationsService } from '../accounts/invitations.service.js';
import { AppModule } from '../app.module.js';
import type { Role } from '../generated/prisma/client.js';

const ROLES: Record<string, Role> = {
  'super-admin': 'SUPER_ADMIN',
  admin: 'ADMIN',
  manager: 'MANAGER',
  developer: 'DEVELOPER',
  customer: 'CUSTOMER',
};

const usage = `Usage:
  npm run user:invite -- --role <${Object.keys(ROLES).join('|')}> --name "Full Name" --email name@example.com
Options:
  --company "Company"     required for customers
  --job-title "Title"     team members, for example "Support lead"
  --country "Country"     optional`;

function fail(message: string): never {
  console.error(`${message}\n\n${usage}`);
  process.exit(1);
}

const { values } = parseArgs({
  options: {
    role: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    company: { type: 'string' },
    'job-title': { type: 'string' },
    country: { type: 'string' },
  },
  strict: true,
});

const role = ROLES[values.role ?? ''];
if (!role) fail('Choose a role with --role.');
if (!values.name?.trim()) fail('Give the person a name with --name.');
if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
  fail('Give a valid email with --email.');
}
if (role === 'CUSTOMER' && !values.company?.trim()) {
  fail('A customer needs a company: add --company "Company name".');
}

const app = await NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});

try {
  const { link, emailSent } = await app.get(InvitationsService).inviteUser(
    {
      role,
      name: values.name,
      email: values.email,
      company: values.company,
      jobTitle: values['job-title'],
      country: values.country,
    },
    null,
  );
  if (emailSent) {
    console.log(`\nInvitation sent to ${values.email}.`);
    console.log(
      `It works once and expires in 48 hours. The link, in case the email does not arrive:\n\n  ${link}\n`,
    );
  } else {
    console.log(
      `\nThe account for ${values.email} is ready, but the email could not be sent (check the SMTP settings in .env).`,
    );
    console.log(
      `Give the person this link yourself. It works once and expires in 48 hours:\n\n  ${link}\n`,
    );
  }
} catch (error) {
  const message =
    (error as { response?: { message?: string } }).response?.message ??
    (error as Error).message;
  console.error(`\nNot invited: ${message}\n`);
  process.exitCode = 1;
} finally {
  await app.close();
}
