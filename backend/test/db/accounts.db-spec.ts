import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../src/email/email.service.js';
import type { Role } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../totp.js';

// The account journeys on a real database (docs/01, section 3).
// Emails are caught instead of sent, so the links can be read.

const DOMAIN = '@accounts.test';
const PASSWORD = 'Skyline-2027';
const sent: OutgoingEmail[] = [];

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

/** The token from the last email sent to this address. */
function lastLink(to: string, path: '/invite/' | '/reset-password/') {
  const email = [...sent].reverse().find((item) => item.to === to);
  if (!email) throw new Error(`No email was sent to ${to}`);
  const html = JSON.stringify(email.template.props);
  const match = html.match(new RegExp(`${path}([A-Za-z0-9_-]{43})`));
  if (!match) throw new Error(`No ${path} link in the email to ${to}`);
  return match[1];
}

/** The session cookie from a sign-in response. */
function cookieFrom(response: request.Response): string {
  const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) throw new Error('No cookie was set.');
  return raw.map((cookie) => cookie.split(';')[0]).join('; ');
}

async function inviteAndActivate(role: Role, extra: { company?: string } = {}) {
  const email = uniqueEmail(role.toLowerCase());
  const { userId } = await invitations.inviteUser(
    { name: `Test ${role}`, email, role, ...extra },
    null,
  );
  const token = lastLink(email, '/invite/');
  await http()
    .post(`/accounts/invitations/${token}/accept`)
    .send({ name: `Test ${role}`, password: PASSWORD })
    .expect(200);
  return { userId, email };
}

function signIn(email: string, password = PASSWORD) {
  return http()
    .post('/api/auth/sign-in/email')
    .set('Origin', 'http://localhost:3001')
    .send({ email, password });
}

/** A team member who has set up the authenticator app. Returns a signed-in cookie. */
async function teamMemberWithTwoFactor(role: Role) {
  const { userId, email } = await inviteAndActivate(role);
  const signedIn = await signIn(email);
  let cookie = cookieFrom(signedIn);

  const enabled = await http()
    .post('/api/auth/two-factor/enable')
    .set('Origin', 'http://localhost:3001')
    .set('Cookie', cookie)
    .send({ password: PASSWORD })
    .expect(200);
  const secret = secretFromUri(enabled.body.totpURI);
  const verified = await http()
    .post('/api/auth/two-factor/verify-totp')
    .set('Origin', 'http://localhost:3001')
    .set('Cookie', cookie)
    .send({ code: totp(secret) })
    .expect(200);
  if (verified.headers['set-cookie']) cookie = cookieFrom(verified);
  return { userId, email, cookie, secret };
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmailService)
    .useValue({
      send: async (email: OutgoingEmail) => {
        // Addresses starting "no-mail" act like a broken email server.
        if (email.to.startsWith('no-mail')) throw new Error('SMTP is down');
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

  // Leftovers from an earlier run.
  const old = await prisma.user.findMany({
    where: { email: { endsWith: DOMAIN } },
    select: { id: true, customerId: true },
  });
  await prisma.user.deleteMany({ where: { id: { in: old.map((u) => u.id) } } });
  await prisma.customer.deleteMany({
    where: {
      id: { in: old.flatMap((u) => (u.customerId ? [u.customerId] : [])) },
    },
  });
});

afterAll(async () => {
  await app?.close();
});

describe('invitations', () => {
  it('a customer activates the account from the link and signs in', async () => {
    const email = uniqueEmail('sarah');
    await invitations.inviteUser(
      {
        name: 'Sarah Mitchell',
        email,
        role: 'CUSTOMER',
        company: 'Bluewave Holidays',
      },
      null,
    );
    const token = lastLink(email, '/invite/');

    const details = await http()
      .get(`/accounts/invitations/${token}`)
      .expect(200);
    expect(details.body).toMatchObject({
      email,
      name: 'Sarah Mitchell',
      area: 'portal',
      company: 'Bluewave Holidays',
    });

    // A weak password is refused with the rule that failed.
    const weak = await http()
      .post(`/accounts/invitations/${token}/accept`)
      .send({ name: 'Sarah Mitchell', password: 'skyline' })
      .expect(400);
    expect(JSON.stringify(weak.body)).toContain('At least 10 characters');

    await http()
      .post(`/accounts/invitations/${token}/accept`)
      .send({
        name: 'Sarah Mitchell',
        phone: '+44 20 7946 0321',
        password: PASSWORD,
      })
      .expect(200)
      .expect({ area: 'portal' });

    const user = await prisma.user.findFirstOrThrow({ where: { email } });
    expect(user).toMatchObject({
      status: 'ACTIVE',
      emailVerified: true,
      phone: '+44 20 7946 0321',
    });

    // The link works only once.
    await http()
      .post(`/accounts/invitations/${token}/accept`)
      .send({ name: 'Sarah Mitchell', password: PASSWORD })
      .expect(410);

    const signedIn = await signIn(email).expect(200);
    const me = await http()
      .get('/me')
      .set('Cookie', cookieFrom(signedIn))
      .expect(200);
    expect(me.body).toMatchObject({
      role: 'CUSTOMER',
      area: 'portal',
      customer: { company: 'Bluewave Holidays' },
      actions: [],
    });
  });

  it('only a hash of the link is stored', async () => {
    const email = uniqueEmail('hash');
    const { userId } = await invitations.inviteUser(
      { name: 'Hash Test', email, role: 'DEVELOPER' },
      null,
    );
    const token = lastLink(email, '/invite/');
    const stored = await prisma.invitation.findFirstOrThrow({
      where: { userId },
    });
    expect(stored.tokenHash).not.toBe(token);
    expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('resending stops the old link working', async () => {
    const admin = await teamMemberWithTwoFactor('ADMIN');
    const email = uniqueEmail('resend');
    const { userId } = await invitations.inviteUser(
      { name: 'Resend Test', email, role: 'MANAGER' },
      null,
    );
    const first = lastLink(email, '/invite/');

    await http()
      .post(`/team/users/${userId}/invitation`)
      .set('Cookie', admin.cookie)
      .expect(202);
    const second = lastLink(email, '/invite/');
    expect(second).not.toBe(first);

    await http().get(`/accounts/invitations/${first}`).expect(410);
    await http().get(`/accounts/invitations/${second}`).expect(200);

    const log = await prisma.auditLog.findFirst({
      where: { action: 'invitation.resent', entityId: userId },
    });
    expect(log?.actorId).toBe(admin.userId);
  });

  it('an expired link cannot be used', async () => {
    const email = uniqueEmail('expired');
    const { userId } = await invitations.inviteUser(
      { name: 'Expired Test', email, role: 'DEVELOPER' },
      null,
    );
    const token = lastLink(email, '/invite/');
    await prisma.invitation.updateMany({
      where: { userId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await http().get(`/accounts/invitations/${token}`).expect(410);
  });

  it('nobody can sign in before activating', async () => {
    const email = uniqueEmail('invited');
    await invitations.inviteUser(
      { name: 'Invited', email, role: 'CUSTOMER', company: 'X Ltd' },
      null,
    );
    const response = await signIn(email);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('records who was invited in the audit log', async () => {
    const email = uniqueEmail('audit');
    const { userId } = await invitations.inviteUser(
      { name: 'Audit Test', email, role: 'DEVELOPER' },
      null,
    );
    const log = await prisma.auditLog.findFirst({
      where: { action: 'user.invited', entityId: userId },
    });
    expect(log?.data).toMatchObject({ email, role: 'DEVELOPER' });
  });

  it('if the email fails, the link is still given back and works', async () => {
    const email = uniqueEmail('no-mail');
    const { link, emailSent } = await invitations.inviteUser(
      { name: 'No Mail', email, role: 'SUPER_ADMIN' },
      null,
    );
    expect(emailSent).toBe(false);
    const token = link.split('/invite/')[1];
    await http()
      .post(`/accounts/invitations/${token}/accept`)
      .send({ name: 'No Mail', password: PASSWORD })
      .expect(200);
    await signIn(email).expect(200);
  });
});

describe('two-factor sign-in for the team', () => {
  it('a team member without two-factor can only reach the setup', async () => {
    const { email } = await inviteAndActivate('DEVELOPER');
    const cookie = cookieFrom(await signIn(email).expect(200));

    const me = await http().get('/me').set('Cookie', cookie).expect(200);
    expect(me.body).toMatchObject({ area: 'team', twoFactorEnabled: false });

    const blocked = await http()
      .post('/team/users/anyone/password-reset')
      .set('Cookie', cookie)
      .expect(403);
    expect(blocked.body.code).toBe('TWO_FACTOR_REQUIRED');
  });

  it('after setup, signing in needs the authenticator code', async () => {
    const member = await teamMemberWithTwoFactor('MANAGER');

    const first = await signIn(member.email).expect(200);
    expect(first.body.twoFactorRedirect).toBe(true);
    const pending = cookieFrom(first);

    // Without the code there is no session.
    await http().get('/me').set('Cookie', pending).expect(401);

    // A wrong code is refused.
    await http()
      .post('/api/auth/two-factor/verify-totp')
      .set('Origin', 'http://localhost:3001')
      .set('Cookie', pending)
      .send({ code: '000000' })
      .expect((response) =>
        expect(response.status).toBeGreaterThanOrEqual(400),
      );

    const verified = await http()
      .post('/api/auth/two-factor/verify-totp')
      .set('Origin', 'http://localhost:3001')
      .set('Cookie', pending)
      .send({ code: totp(member.secret) })
      .expect(200);
    const me = await http()
      .get('/me')
      .set('Cookie', cookieFrom(verified))
      .expect(200);
    expect(me.body).toMatchObject({ role: 'MANAGER', twoFactorEnabled: true });
  });
});

describe('password reset', () => {
  it('a link by email sets a new password, works once, and signs out everywhere', async () => {
    const { email } = await inviteAndActivate('CUSTOMER', {
      company: 'Reset Ltd',
    });
    const oldSession = cookieFrom(await signIn(email).expect(200));

    await http().post('/accounts/password/forgot').send({ email }).expect(202);
    const token = lastLink(email, '/reset-password/');

    await http()
      .get(`/accounts/password/reset/${token}`)
      .expect(200)
      .expect({ email });
    await http()
      .post(`/accounts/password/reset/${token}`)
      .send({ password: 'Harbour-Light-9' })
      .expect(200)
      .expect({ area: 'portal' });

    await http()
      .post(`/accounts/password/reset/${token}`)
      .send({ password: 'Another-Pass-9' })
      .expect(410);
    await http().get('/me').set('Cookie', oldSession).expect(401);
    expect((await signIn(email)).status).toBeGreaterThanOrEqual(400);
    await signIn(email, 'Harbour-Light-9').expect(200);
  });

  it('ten people asking at the same moment all get their link', async () => {
    const people = await Promise.all(
      Array.from({ length: 10 }, () =>
        inviteAndActivate('CUSTOMER', { company: 'Busy Ltd' }),
      ),
    );
    const answers = await Promise.all(
      people.map(({ email }) =>
        http().post('/accounts/password/forgot').send({ email }),
      ),
    );
    expect(answers.map((answer) => answer.status)).toEqual(Array(10).fill(202));
    for (const { email } of people) {
      expect(() => lastLink(email, '/reset-password/')).not.toThrow();
    }
  });

  it('never reveals whether an email has an account', async () => {
    const before = sent.length;
    const response = await http()
      .post('/accounts/password/forgot')
      .send({ email: uniqueEmail('nobody') })
      .expect(202);
    expect(response.body).toEqual({ ok: true });
    expect(sent.length).toBe(before);
  });
});

describe('disabled accounts', () => {
  it('are signed out at once and cannot sign in', async () => {
    const { userId, email } = await inviteAndActivate('CUSTOMER', {
      company: 'Gone Ltd',
    });
    const cookie = cookieFrom(await signIn(email).expect(200));
    await http().get('/me').set('Cookie', cookie).expect(200);

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DISABLED' },
    });

    await http().get('/me').set('Cookie', cookie).expect(401);
    expect((await signIn(email)).status).toBeGreaterThanOrEqual(400);
  });
});

describe('the account lock after wrong passwords', () => {
  it('locks after 10 wrong passwords, emails the owner, and a reset lifts it', async () => {
    const { userId, email } = await inviteAndActivate('CUSTOMER', {
      company: 'Locked Ltd',
    });
    // A right password in between starts the count again.
    for (let i = 0; i < 5; i += 1) await signIn(email, 'Wrong-pass-123');
    await signIn(email).expect(200);
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: userId } }))
        .failedSignIns,
    ).toBe(0);

    for (let i = 0; i < 10; i += 1) {
      await signIn(email, 'Wrong-pass-123').expect(401);
    }
    // Now even the right password is refused, with a clear reason.
    const locked = await signIn(email).expect(403);
    expect(JSON.stringify(locked.body)).toContain('locked for 15 minutes');
    expect(
      sent.some(
        (item) =>
          item.to === email && item.subject.includes('account was locked'),
      ),
    ).toBe(true);

    // A new password lifts the lock.
    await http()
      .post('/accounts/password/forgot')
      .send({ email, side: 'customer' })
      .expect(202);
    const token = lastLink(email, '/reset-password/');
    await http()
      .post(`/accounts/password/reset/${token}`)
      .send({ password: 'Brand-new-pass-2027' })
      .expect(200);
    await signIn(email, 'Brand-new-pass-2027').expect(200);
  });
});

describe('permissions on the server', () => {
  it('a developer may not send a reset link; an admin may', async () => {
    const developer = await teamMemberWithTwoFactor('DEVELOPER');
    const admin = await teamMemberWithTwoFactor('ADMIN');
    const { userId } = await inviteAndActivate('CUSTOMER', {
      company: 'Perm Ltd',
    });

    const refused = await http()
      .post(`/team/users/${userId}/password-reset`)
      .set('Cookie', developer.cookie)
      .expect(403);
    expect(refused.body.code).toBe('NOT_ALLOWED');

    await http()
      .post(`/team/users/${userId}/password-reset`)
      .set('Cookie', admin.cookie)
      .expect(202);
  });

  it('an admin may not act on a super admin', async () => {
    const admin = await teamMemberWithTwoFactor('ADMIN');
    const { userId } = await inviteAndActivate('SUPER_ADMIN');
    await http()
      .post(`/team/users/${userId}/password-reset`)
      .set('Cookie', admin.cookie)
      .expect(403);
  });

  it('a customer may not use team routes', async () => {
    const { email } = await inviteAndActivate('CUSTOMER', {
      company: 'Cust Ltd',
    });
    const cookie = cookieFrom(await signIn(email).expect(200));
    const response = await http()
      .post('/team/users/anyone/password-reset')
      .set('Cookie', cookie)
      .expect(403);
    expect(response.body).toMatchObject({ code: 'WRONG_AREA', area: 'portal' });
  });
});

describe('the website asks "am I signed in, and where?"', () => {
  it('answers the area, or nothing, and never an error', async () => {
    const signedOut = await http().get('/me/status').expect(200);
    expect(signedOut.body).toEqual({ area: null });

    const { email } = await inviteAndActivate('CUSTOMER', {
      company: 'Status Ltd',
    });
    const customer = cookieFrom(await signIn(email).expect(200));
    const asCustomer = await http()
      .get('/me/status')
      .set('Cookie', customer)
      .expect(200);
    expect(asCustomer.body).toEqual({ area: 'portal' });

    const admin = await teamMemberWithTwoFactor('ADMIN');
    const asAdmin = await http()
      .get('/me/status')
      .set('Cookie', admin.cookie)
      .expect(200);
    expect(asAdmin.body).toEqual({ area: 'team' });

    // A made-up session is simply "not signed in".
    const fake = await http()
      .get('/me/status')
      .set('Cookie', 'fct.session_token=nonsense')
      .expect(200);
    expect(fake.body).toEqual({ area: null });
  });
});
