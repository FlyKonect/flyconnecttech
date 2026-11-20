import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { loginKeyFor } from '../../src/accounts/login-key.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../src/email/email.service.js';
import type { Role } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';

// Customer accounts and team accounts are separate (docs/02): one email can
// have one of each, with its own password, sign-in page, password reset and
// invitation. Each sign-in page says its side with the x-fct-side header.

const DOMAIN = '@sides.test';
const ORIGIN = 'http://localhost:3001';
const CUSTOMER_PASSWORD = 'Harbour-Light-9';
const TEAM_PASSWORD = 'Skyline-2027';
const sent: OutgoingEmail[] = [];

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

/** The link in the newest email to this address, after the given path. */
function tokenFor(email: string, path: '/invite/' | '/reset-password/') {
  const message = [...sent].reverse().find((item) => item.to === email);
  const match = JSON.stringify(message?.template.props).match(
    new RegExp(`${path}([A-Za-z0-9_-]{43})`),
  );
  if (!match) throw new Error(`No ${path} link was sent to ${email}.`);
  return match[1];
}

/** Invites and activates an account with this exact email. */
async function activated(
  email: string,
  role: Role,
  password: string,
  company?: string,
) {
  const { userId } = await invitations.inviteUser(
    { name: `Test ${role.toLowerCase()}`, email, role, company },
    null,
  );
  await http()
    .post(`/accounts/invitations/${tokenFor(email, '/invite/')}/accept`)
    .send({ name: `Test ${role.toLowerCase()}`, password })
    .expect(200);
  return userId;
}

function signIn(email: string, password: string, side?: 'customer' | 'team') {
  const call = http()
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email, password });
  return side ? call.set('x-fct-side', side) : call;
}

/** Signs in, then asks /me which account that was. */
async function whoSignedIn(
  email: string,
  password: string,
  side?: 'customer' | 'team',
) {
  const answer = await signIn(email, password, side).expect(200);
  const cookie = (answer.headers['set-cookie'] as unknown as string[])
    .map((item) => item.split(';')[0])
    .join('; ');
  const me = await http().get('/me').set('Cookie', cookie).expect(200);
  return me.body as { id: string; area: string; email: string };
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmailService)
    .useValue({
      send: async (email: OutgoingEmail) => {
        sent.push(email);
      },
    })
    .compile();
  app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  configureApp(app);
  await app.init();
  prisma = app.get(PrismaService);
  invitations = app.get(InvitationsService);
});

afterAll(async () => {
  await app?.close();
});

describe('one email, two separate accounts', () => {
  it('a customer account and a team account can share an email, but each side only once', async () => {
    const email = uniqueEmail('both');
    const customerId = await activated(
      email,
      'CUSTOMER',
      CUSTOMER_PASSWORD,
      'Bluewave Holidays',
    );
    const teamId = await activated(email, 'DEVELOPER', TEAM_PASSWORD);
    expect(customerId).not.toBe(teamId);

    const accounts = await prisma.user.findMany({
      where: { email },
      select: { side: true, loginEmail: true },
      orderBy: { side: 'asc' },
    });
    expect(accounts).toEqual([
      { side: 'CUSTOMER', loginEmail: loginKeyFor(email, 'CUSTOMER') },
      { side: 'TEAM', loginEmail: loginKeyFor(email, 'TEAM') },
    ]);

    // A second account on either side is refused, saying which side.
    await expect(
      invitations.inviteUser(
        { name: 'Again', email, role: 'CUSTOMER', company: 'Other Ltd' },
        null,
      ),
    ).rejects.toMatchObject({
      response: {
        code: 'EMAIL_TAKEN',
        message: 'There is already a client account with this email.',
      },
    });
    await expect(
      invitations.inviteUser(
        { name: 'Again', email: ` ${email.toUpperCase()} `, role: 'ADMIN' },
        null,
      ),
    ).rejects.toMatchObject({
      response: {
        code: 'EMAIL_TAKEN',
        message: 'There is already a team account with this email.',
      },
    });
  });

  it('each sign-in page signs in its own account, with its own password', async () => {
    const email = uniqueEmail('pages');
    const customerId = await activated(
      email,
      'CUSTOMER',
      CUSTOMER_PASSWORD,
      'Bluewave Holidays',
    );
    const teamId = await activated(email, 'MANAGER', TEAM_PASSWORD);

    const customer = await whoSignedIn(email, CUSTOMER_PASSWORD, 'customer');
    expect(customer).toMatchObject({ id: customerId, area: 'portal', email });
    const team = await whoSignedIn(email, TEAM_PASSWORD, 'team');
    expect(team).toMatchObject({ id: teamId, area: 'team', email });

    // Each password opens only its own account.
    await signIn(email, TEAM_PASSWORD, 'customer').expect(401);
    await signIn(email, CUSTOMER_PASSWORD, 'team').expect(401);
    // With both sides taken, the page must say which.
    await signIn(email, TEAM_PASSWORD).expect(400);
  });

  it('a page still finds an account that only exists on the other side', async () => {
    const teamOnly = uniqueEmail('team-only');
    const teamId = await activated(teamOnly, 'DEVELOPER', TEAM_PASSWORD);
    // The website then says "This is a team account", as before.
    expect(
      await whoSignedIn(teamOnly, TEAM_PASSWORD, 'customer'),
    ).toMatchObject({ id: teamId, area: 'team' });
    // Scripts and tests that say no side get the one account there is.
    expect(await whoSignedIn(teamOnly, TEAM_PASSWORD)).toMatchObject({
      id: teamId,
    });
    await signIn(uniqueEmail('nobody'), TEAM_PASSWORD, 'team').expect(401);
  });

  it('forgot password resets the account of the page that asked', async () => {
    const email = uniqueEmail('reset');
    await activated(email, 'CUSTOMER', CUSTOMER_PASSWORD, 'Bluewave Holidays');
    await activated(email, 'ADMIN', TEAM_PASSWORD);

    await http()
      .post('/accounts/password/forgot')
      .send({ email, side: 'team' })
      .expect(202);
    const team = await http()
      .post(`/accounts/password/reset/${tokenFor(email, '/reset-password/')}`)
      .send({ password: 'Team-New-Pass-4' })
      .expect(200);
    expect(team.body).toEqual({ area: 'team' });

    await http()
      .post('/accounts/password/forgot')
      .send({ email, side: 'customer' })
      .expect(202);
    const customer = await http()
      .post(`/accounts/password/reset/${tokenFor(email, '/reset-password/')}`)
      .send({ password: 'Client-New-Pass-4' })
      .expect(200);
    expect(customer.body).toEqual({ area: 'portal' });

    // Each account kept its own new password.
    await whoSignedIn(email, 'Client-New-Pass-4', 'customer');
    await signIn(email, 'Team-New-Pass-4', 'team').expect(200);
    await signIn(email, 'Team-New-Pass-4', 'customer').expect(401);
  });

  it('a website message from the email is linked to the customer, not the team account', async () => {
    const email = uniqueEmail('message');
    await activated(email, 'DEVELOPER', TEAM_PASSWORD);
    await activated(email, 'CUSTOMER', CUSTOMER_PASSWORD, 'Harbour Travel');
    const customerAccount = await prisma.user.findFirstOrThrow({
      where: { email, side: 'CUSTOMER' },
    });

    await http()
      .post('/leads/message')
      .send({
        topic: 'PARTNERSHIP',
        name: 'Laura Bennett',
        email,
        message: 'A question about our booking site.',
        sourcePage: '/contact',
      })
      .expect(200);
    const message = await prisma.contactMessage.findFirstOrThrow({
      where: { email },
    });
    expect(message.customerId).toBe(customerAccount.customerId);
  });

  it('the sign-in key is made the same way as the migration made it', async () => {
    const email = 'Mixed.Case@Example.co.uk';
    const [row] = await prisma.$queryRaw<{ key: string }[]>`
      SELECT CONCAT('t.', SHA2(LOWER(TRIM(${email})), 256), '@accounts.invalid') AS \`key\`
    `;
    expect(row.key).toBe(loginKeyFor(email, 'TEAM'));
  });
});
