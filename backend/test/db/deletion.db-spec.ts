import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { nextCode } from '../../src/codes/readable-codes.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../src/email/email.service.js';
import type { Role } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../totp.js';

// Deleting team users and customers (docs/01, "Delete"): the account goes
// for good (no sign-in, no personal details, out of the lists, the email
// free again), its history stays under its name marked "(deleted)", and
// adding the same email again asks whether to restore that history.

const DOMAIN = '@deletion.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const sent: OutgoingEmail[] = [];

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

function cookieFrom(response: request.Response): string {
  const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) throw new Error('No cookie was set.');
  return raw.map((cookie) => cookie.split(';')[0]).join('; ');
}

type Person = { id: string; email: string; name: string; cookie: string };

function tokenFor(email: string) {
  const invitation = [...sent].reverse().find((item) => item.to === email);
  return JSON.stringify(invitation?.template.props).match(
    /\/invite\/([A-Za-z0-9_-]{43})/,
  )![1];
}

/** Activates the newest invitation to this email and signs in. */
async function activate(email: string, name: string, role: Role) {
  await http()
    .post(`/accounts/invitations/${tokenFor(email)}/accept`)
    .send({ name, password: PASSWORD })
    .expect(200);
  const signedIn = await http()
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email, password: PASSWORD })
    .expect(200);
  let cookie = cookieFrom(signedIn);
  if (role !== 'CUSTOMER') {
    const enabled = await http()
      .post('/api/auth/two-factor/enable')
      .set('Origin', ORIGIN)
      .set('Cookie', cookie)
      .send({ password: PASSWORD })
      .expect(200);
    const verified = await http()
      .post('/api/auth/two-factor/verify-totp')
      .set('Origin', ORIGIN)
      .set('Cookie', cookie)
      .send({ code: totp(secretFromUri(enabled.body.totpURI)) })
      .expect(200);
    if (verified.headers['set-cookie']) cookie = cookieFrom(verified);
  }
  return cookie;
}

async function person(
  role: Role,
  name: string,
  company?: string,
): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const { userId } = await invitations.inviteUser(
    { name, email, role, company, jobTitle: 'Tester' },
    null,
  );
  return { id: userId, email, name, cookie: await activate(email, name, role) };
}

const as = (who: Person) => ({
  get: (path: string) => http().get(path).set('Cookie', who.cookie),
  post: (path: string, body: object = {}) =>
    http().post(path).set('Cookie', who.cookie).send(body),
});

/** A customer with one project. */
async function customerWithProject(name: string, company: string) {
  const customer = await person('CUSTOMER', name, company);
  const { customerId } = await prisma.user.findUniqueOrThrow({
    where: { id: customer.id },
  });
  const project = await prisma.$transaction(async (tx) =>
    tx.project.create({
      data: {
        code: await nextCode(tx, 'project'),
        name: `${company} website`,
        type: 'WEBSITE',
        customerId: customerId!,
      },
    }),
  );
  return { ...customer, customerId: customerId!, projectId: project.id };
}

async function newRequest(
  customer: { cookie: string; projectId: string },
  title: string,
) {
  const response = await http()
    .post('/portal/requests')
    .set('Cookie', customer.cookie)
    .field('projectId', customer.projectId)
    .field('type', 'TECHNICAL_ISSUE')
    .field('priority', 'MEDIUM')
    .field('title', title)
    .field('description', 'The checkout page shows an error after payment.')
    .expect(201);
  return response.body.code as string;
}

const stored = (code: string) =>
  prisma.supportRequest.findUniqueOrThrow({
    where: { code },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

let superAdmin: Person;
let admin: Person;
let manager: Person;

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

  superAdmin = await person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
});

afterAll(async () => {
  await app?.close();
});

describe('who may delete', () => {
  it('super admins and admins; never yourself; admins never a super admin', async () => {
    const developer = await person('DEVELOPER', 'Daniyal Ahmed');
    const customer = await customerWithProject('Sarah Mitchell', 'Harbour Co');

    // Managers and developers may not delete anyone.
    for (const who of [manager, developer]) {
      await as(who).post(`/team/users/${admin.id}/delete`).expect(403);
      await as(who)
        .post(`/team/customers/${customer.customerId}/delete`)
        .expect(403);
    }
    // Admins never a super admin; nobody themselves.
    const notAllowed = await as(admin)
      .post(`/team/users/${superAdmin.id}/delete`)
      .expect(403);
    expect(notAllowed.body.code).toBe('NOT_ALLOWED');
    const self = await as(admin)
      .post(`/team/users/${admin.id}/delete`)
      .expect(409);
    expect(self.body.code).toBe('CANNOT_DELETE_SELF');
    // A customer is deleted from the customer page, not as a user.
    await as(admin).post(`/team/users/${customer.id}/delete`).expect(404);
    await as(admin).post('/team/users/no-such-person/delete').expect(404);
    await as(admin).post('/team/customers/no-such-company/delete').expect(404);

    // The Users list says where Delete may be offered.
    const list = await as(admin).get('/team/users').expect(200);
    const row = (id: string) =>
      list.body.rows.find((item: { id: string }) => item.id === id);
    expect(row(developer.id).canDelete).toBe(true);
    expect(row(superAdmin.id).canDelete).toBe(false);
    expect(row(admin.id).canDelete).toBe(false);
  });
});

describe('deleting a team member', () => {
  it('ends the account, hands back open requests and keeps the history', async () => {
    const customer = await customerWithProject('Laura Bennett', 'Bluewave');
    const developer = await person('DEVELOPER', 'Priya Nair');
    await prisma.user.update({
      where: { id: developer.id },
      data: { phone: '+44 20 7946 0321', country: 'United Kingdom' },
    });
    const code = await newRequest(customer, 'Search shows no hotels');
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: developer.id })
      .expect(200);
    await as(developer)
      .post(`/team/requests/${code}/status`, { status: 'IN_PROGRESS' })
      .expect(200);
    await as(developer)
      .post(`/team/requests/${code}/messages`, {
        kind: 'reply',
        body: 'Looking at it now.',
      })
      .expect(200);

    await as(admin).post(`/team/users/${developer.id}/delete`).expect(200);

    // The account: no way in, no personal details, the email set aside.
    const after = await prisma.user.findUniqueOrThrow({
      where: { id: developer.id },
    });
    expect(after).toMatchObject({
      status: 'DELETED',
      name: 'Priya Nair (deleted)',
      deletedEmail: developer.email,
      phone: null,
      country: null,
      jobTitle: null,
      twoFactorEnabled: false,
    });
    expect(after.email).not.toBe(developer.email);
    expect(after.deletedAt).not.toBeNull();
    const mine = { where: { userId: developer.id } };
    expect(await prisma.session.count(mine)).toBe(0);
    expect(await prisma.account.count(mine)).toBe(0);
    expect(await prisma.twoFactor.count(mine)).toBe(0);
    await as(developer).get('/me').expect(401);
    await http()
      .post('/api/auth/sign-in/email')
      .set('Origin', ORIGIN)
      .send({ email: developer.email, password: PASSWORD })
      .expect(401);

    // Out of the Users list.
    const list = await as(admin).get('/team/users').expect(200);
    expect(
      list.body.rows.some((row: { id: string }) => row.id === developer.id),
    ).toBe(false);

    // The open request: unassigned, back to Under Review, with the reason.
    const request = await stored(code);
    expect(request.assigneeId).toBeNull();
    expect(request.status).toBe('UNDER_REVIEW');
    expect(request.messages.at(-1)).toMatchObject({
      kind: 'SYSTEM',
      body: "Unassigned because Priya Nair's account was deleted",
    });
    // The history: the reply keeps its author.
    expect(
      request.messages.find((message) => message.kind === 'STAFF_REPLY')
        ?.authorId,
    ).toBe(developer.id);

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: 'user.deleted', entityId: developer.id },
    });
    expect(audit.actorId).toBe(admin.id);

    // Gone already: deleting, disabling or resending again is "not found".
    await as(admin).post(`/team/users/${developer.id}/delete`).expect(404);
    await as(admin).post(`/team/users/${developer.id}/disable`).expect(404);
    await as(admin).post(`/team/users/${developer.id}/invitation`).expect(404);
  });

  it('adding the email again asks, then Restore brings the same account and its history back', async () => {
    const customer = await customerWithProject('Olivia Grant', 'Skyline');
    const developer = await person('DEVELOPER', 'Daniyal Ahmed');
    const code = await newRequest(customer, 'Payments fail');
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: developer.id })
      .expect(200);
    await as(developer)
      .post(`/team/requests/${code}/messages`, {
        kind: 'reply',
        body: 'On it.',
      })
      .expect(200);
    await as(admin).post(`/team/users/${developer.id}/delete`).expect(200);

    const asked = await as(admin)
      .post('/team/users', {
        name: 'Daniyal Ahmed',
        email: developer.email,
        role: 'DEVELOPER',
      })
      .expect(409);
    expect(asked.body).toMatchObject({
      code: 'PREVIOUS_ACCOUNT',
      previous: { name: 'Daniyal Ahmed', requests: 1, company: null },
    });

    const restored = await as(admin)
      .post('/team/users', {
        name: 'Daniyal Ahmed',
        email: developer.email,
        role: 'MANAGER',
        previous: 'restore',
      })
      .expect(201);
    expect(restored.body.id).toBe(developer.id);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: developer.id } }),
    ).toMatchObject({
      status: 'INVITED',
      name: 'Daniyal Ahmed',
      email: developer.email,
      role: 'MANAGER',
      deletedAt: null,
      deletedEmail: null,
    });
    // Their reply is theirs again, under the new name.
    const reply = (await stored(code)).messages.find(
      (message) => message.kind === 'STAFF_REPLY',
    );
    expect(reply?.authorId).toBe(developer.id);
    expect(
      await prisma.auditLog.count({
        where: { action: 'user.restored', entityId: developer.id },
      }),
    ).toBe(1);

    // The new invitation works: they can sign in again.
    await activate(developer.email, 'Daniyal Ahmed', 'MANAGER');
  });

  it('Start fresh makes a new account and does not offer the old one again', async () => {
    const developer = await person('DEVELOPER', 'Aisha Khan');
    await as(admin).post(`/team/users/${developer.id}/delete`).expect(200);

    const fresh = await as(admin)
      .post('/team/users', {
        name: 'Aisha Khan',
        email: developer.email,
        role: 'DEVELOPER',
        previous: 'fresh',
      })
      .expect(201);
    expect(fresh.body.id).not.toBe(developer.id);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: developer.id } }),
    ).toMatchObject({ status: 'DELETED', deletedEmail: null });

    // The same email on the other side never asks about a team account.
    await as(admin)
      .post('/team/customers', {
        name: 'Aisha Khan',
        email: developer.email,
        company: 'Khan Travel',
        projects: [{ name: 'Khan Travel website', type: 'WEBSITE' }],
      })
      .expect(201);
  });
});

describe('deleting a customer', () => {
  it('ends the contact account, closes open requests, hides the customer and can be restored', async () => {
    // The test database keeps every run's customers: a name of its own.
    const company = `Northwind ${Date.now()}`;
    const customer = await customerWithProject('Ben Carter', company);
    const open = await newRequest(customer, 'Cannot log in');
    const resolved = await newRequest(customer, 'Typo on the home page');
    await as(admin)
      .post(`/team/requests/${resolved}/resolve`, { summary: 'Fixed.' })
      .expect(200);

    await as(admin)
      .post(`/team/customers/${customer.customerId}/delete`)
      .expect(200);

    // The customer: out of the list, its page gone, its contact signed out.
    expect(
      await prisma.customer.findUniqueOrThrow({
        where: { id: customer.customerId },
      }),
    ).toMatchObject({ company: `${company} (deleted)` });
    const list = await as(admin)
      .get(`/team/customers?q=${encodeURIComponent(company)}`)
      .expect(200);
    expect(list.body.total).toBe(0);
    await as(admin).get(`/team/customers/${customer.customerId}`).expect(404);
    await as(customer).get('/me').expect(401);
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: customer.id } }),
    ).toMatchObject({ status: 'DELETED', deletedEmail: customer.email });

    // The open request is closed with the reason; the resolved one is left.
    const closed = await stored(open);
    expect(closed.status).toBe('CLOSED');
    expect(closed.messages.at(-1)).toMatchObject({
      kind: 'SYSTEM',
      body: 'Closed because the customer account was deleted',
    });
    expect((await stored(resolved)).status).toBe('RESOLVED');
    expect(
      await prisma.auditLog.count({
        where: { action: 'customer.deleted', entityId: customer.customerId },
      }),
    ).toBe(1);

    // Added again: asked, then restored with its projects and requests.
    const body = {
      name: 'Ben Carter',
      email: customer.email,
      company: `${company} Travel`,
      projects: [{ name: 'Northwind app', type: 'WEB_APPLICATION' }],
    };
    const asked = await as(admin).post('/team/customers', body).expect(409);
    expect(asked.body).toMatchObject({
      code: 'PREVIOUS_ACCOUNT',
      previous: {
        name: 'Ben Carter',
        company,
        requests: 2,
        projects: 1,
      },
    });
    const restored = await as(admin)
      .post('/team/customers', { ...body, previous: 'restore' })
      .expect(201);
    expect(restored.body.id).toBe(customer.customerId);
    const page = await as(admin)
      .get(`/team/customers/${customer.customerId}`)
      .expect(200);
    expect(page.body.company).toBe(`${company} Travel`);
    expect(page.body.contact).toMatchObject({
      id: customer.id,
      status: 'INVITED',
      email: customer.email,
    });
    expect(
      page.body.projects.map((project: { name: string }) => project.name),
    ).toEqual([`${company} website`, 'Northwind app']);
    expect(page.body.requests).toHaveLength(2);
  });
});
