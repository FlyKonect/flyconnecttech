import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { LAST_ACTIVE_EVERY_MS } from '../../src/auth/session.guard.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../src/email/email.service.js';
import type { Role } from '../../src/generated/prisma/client.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../totp.js';

// Customers and users in the team panel (docs/01, section 5, screens 26 to
// 30): adding customers with projects, the customer page, the Users list,
// adding team members, resending invitations, reset links and disabling.

const DOMAIN = '@customers.test';
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

/** The invitation link's token in the newest email to this address. */
function invitationToken(email: string): string {
  const invitation = [...sent].reverse().find((item) => item.to === email);
  const match = JSON.stringify(invitation?.template.props).match(
    /\/invite\/([A-Za-z0-9_-]{43})/,
  );
  if (!match) throw new Error(`No invitation was sent to ${email}.`);
  return match[1];
}

const signIn = (email: string) =>
  http()
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email, password: PASSWORD });

/** Activates the account from its newest invitation and signs in. */
async function activate(
  email: string,
  role: Role,
  name = 'Hassan Qureshi',
): Promise<string> {
  await http()
    .post(`/accounts/invitations/${invitationToken(email)}/accept`)
    .send({ name, password: PASSWORD })
    .expect(200);
  let cookie = cookieFrom(await signIn(email).expect(200));
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

type Person = { id: string; email: string; name: string; cookie: string };

async function person(role: Role, name: string): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const { userId } = await invitations.inviteUser(
    { name, email, role, jobTitle: 'Tester' },
    null,
  );
  return { id: userId, email, name, cookie: await activate(email, role, name) };
}

const as = (who: Person) => ({
  get: (path: string) => http().get(path).set('Cookie', who.cookie),
  post: (path: string, body: object = {}) =>
    http().post(path).set('Cookie', who.cookie).send(body),
});

const auditOf = (action: string, entityId: string) =>
  prisma.auditLog.findFirst({ where: { action, entityId } });

let superAdmin: Person;
let admin: Person;
let manager: Person;
let developer: Person;

/** Adds a customer as the admin. Returns the new customer's id and email. */
async function addCustomer(
  projects = [
    { name: 'Skyline booking website', type: 'TRAVEL_BOOKING_PLATFORM' },
    { name: 'Skyline agent portal', type: 'AGENT_PORTAL' },
  ],
) {
  const email = uniqueEmail('customer');
  const response = await as(admin)
    .post('/team/customers', {
      name: 'Hassan Qureshi',
      email,
      company: 'Skyline Travel',
      phone: '+92 300 1234567',
      projects,
    })
    .expect(201);
  return { id: response.body.id as string, email, body: response.body };
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

  // This file's leftovers from earlier runs go.
  const old = await prisma.user.findMany({
    where: { email: { endsWith: DOMAIN } },
    select: { id: true, customerId: true },
  });
  const customerIds = old.flatMap((u) => (u.customerId ? [u.customerId] : []));
  await prisma.supportRequest.deleteMany({
    where: { customerId: { in: customerIds } },
  });
  await prisma.project.deleteMany({
    where: { customerId: { in: customerIds } },
  });
  await prisma.user.deleteMany({ where: { id: { in: old.map((u) => u.id) } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });

  superAdmin = await person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
  developer = await person('DEVELOPER', 'Daniyal Ahmed');
});

afterAll(async () => {
  await app?.close();
});

describe('Add customer', () => {
  it('creates the customer, the invited contact and both projects, and emails the invitation', async () => {
    const { id, email, body } = await addCustomer();
    expect(body.emailSent).toBe(true);

    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id },
      include: {
        contactUser: true,
        projects: { orderBy: { createdAt: 'asc' } },
      },
    });
    expect(customer.company).toBe('Skyline Travel');
    expect(customer.createdById).toBe(admin.id);
    expect(customer.contactUser).toMatchObject({
      email,
      name: 'Hassan Qureshi',
      phone: '+92 300 1234567',
      role: 'CUSTOMER',
      status: 'INVITED',
    });
    expect(customer.projects).toHaveLength(2);
    expect(customer.projects.map((p) => p.name)).toEqual([
      'Skyline booking website',
      'Skyline agent portal',
    ]);
    for (const project of customer.projects) {
      expect(project.code).toMatch(/^P-\d{4,}$/);
      expect(project.status).toBe('PLANNING');
    }

    const created = await auditOf('customer.created', id);
    expect(created?.actorId).toBe(admin.id);
    expect(created?.data).toMatchObject({
      company: 'Skyline Travel',
      projects: customer.projects.map((p) => p.code),
    });
    expect(
      await auditOf('user.invited', customer.contactUser!.id),
    ).toBeTruthy();

    const invitation = sent.filter((item) => item.to === email);
    expect(invitation).toHaveLength(1);
    expect(invitation[0].template.props).toMatchObject({
      kind: 'customer',
      company: 'Skyline Travel',
      projects: ['Skyline booking website', 'Skyline agent portal'],
    });
  });

  it('activating shows the customer exactly those projects in the portal', async () => {
    const { email } = await addCustomer();
    const cookie = await activate(email, 'CUSTOMER');
    const projects = await http()
      .get('/portal/projects')
      .set('Cookie', cookie)
      .expect(200);
    expect(
      (projects.body as { name: string }[]).map((p) => p.name).sort(),
    ).toEqual(['Skyline agent portal', 'Skyline booking website']);
  });

  it('refuses an email that already has an account, and missing details', async () => {
    const { email } = await addCustomer();
    const again = await as(admin)
      .post('/team/customers', {
        name: 'Someone else',
        email,
        company: 'Other',
        projects: [{ name: 'Site', type: 'WEBSITE' }],
      })
      .expect(409);
    expect(again.body.code).toBe('EMAIL_TAKEN');

    await as(admin)
      .post('/team/customers', {
        name: 'No projects',
        email: uniqueEmail('none'),
        company: 'Other',
        projects: [],
      })
      .expect(400);
  });
});

describe('who may see and change customers', () => {
  it('a manager can look but not change anything', async () => {
    const { id } = await addCustomer();
    const list = await as(manager).get('/team/customers').expect(200);
    expect(list.body.canManage).toBe(false);
    const detail = await as(manager).get(`/team/customers/${id}`).expect(200);
    expect(detail.body.canManage).toBe(false);
    const projectId = detail.body.projects[0].id as string;

    await as(manager)
      .post('/team/customers', {
        name: 'X',
        email: uniqueEmail('x'),
        company: 'X',
        projects: [{ name: 'X', type: 'WEBSITE' }],
      })
      .expect(403);
    await as(manager)
      .post(`/team/customers/${id}/projects`, { name: 'X', type: 'WEBSITE' })
      .expect(403);
    await as(manager)
      .post(`/team/customers/${id}/projects/${projectId}/status`, {
        status: 'LIVE',
      })
      .expect(403);
    const contactId = detail.body.contact.id as string;
    await as(manager).post(`/team/users/${contactId}/invitation`).expect(403);
  });

  it('a developer gets nothing', async () => {
    const { id } = await addCustomer();
    await as(developer).get('/team/customers').expect(403);
    await as(developer).get(`/team/customers/${id}`).expect(403);
    await as(developer).get('/team/users').expect(403);
  });
});

describe('the customers list and the customer page', () => {
  it('lists the summary and finds customers by project name', async () => {
    const unique = `Lagoon Amadeus ${Date.now()}`;
    const { id } = await addCustomer([
      { name: unique, type: 'API_INTEGRATION' },
    ]);
    const all = await as(admin).get('/team/customers').expect(200);
    expect(all.body.summary.customers).toBeGreaterThan(0);
    expect(all.body.summary.invited).toBeGreaterThan(0);
    expect(all.body.canManage).toBe(true);

    const found = await as(admin)
      .get(`/team/customers?q=${encodeURIComponent(unique.toLowerCase())}`)
      .expect(200);
    expect(found.body.rows).toEqual([
      expect.objectContaining({
        id,
        company: 'Skyline Travel',
        name: 'Hassan Qureshi',
        status: 'INVITED',
        projects: [unique],
        openRequests: 0,
      }),
    ]);
    const none = await as(admin)
      .get('/team/customers?q=nothing-matches-this')
      .expect(200);
    expect(none.body.rows).toEqual([]);
  });

  it('shows projects with open requests, the requests, contact and who added them', async () => {
    const { id, email } = await addCustomer();
    const cookie = await activate(email, 'CUSTOMER');
    const detail0 = await as(admin).get(`/team/customers/${id}`).expect(200);
    const [first] = detail0.body.projects as { id: string }[];
    const sentRequest = await http()
      .post('/portal/requests')
      .set('Cookie', cookie)
      .field('projectId', first.id)
      .field('type', 'TECHNICAL_ISSUE')
      .field('priority', 'MEDIUM')
      .field('title', 'Search returns nothing')
      .field('description', 'Multi-city search returns no results.')
      .expect(201);

    const detail = await as(admin).get(`/team/customers/${id}`).expect(200);
    expect(detail.body).toMatchObject({
      company: 'Skyline Travel',
      addedBy: 'Emma Clarke',
      cameFrom: null,
      canManage: true,
      contact: { email, name: 'Hassan Qureshi', status: 'ACTIVE' },
    });
    expect(detail.body.contact.activatedAt).toBeTruthy();
    expect(detail.body.contact.lastActiveAt).toBeTruthy();
    expect(detail.body.projects[0].openRequests).toBe(1);
    expect(detail.body.projects[1].openRequests).toBe(0);
    expect(detail.body.requests).toEqual([
      expect.objectContaining({
        code: sentRequest.body.code,
        title: 'Search returns nothing',
        status: 'SUBMITTED',
        assignee: null,
      }),
    ]);

    await as(admin)
      .get('/team/customers/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('adds a project and changes its status, with audit entries', async () => {
    const { id } = await addCustomer();
    const added = await as(admin)
      .post(`/team/customers/${id}/projects`, {
        name: 'Mobile booking app',
        type: 'WEB_APPLICATION',
      })
      .expect(201);
    expect(added.body.code).toMatch(/^P-\d{4,}$/);
    expect(await auditOf('project.added', added.body.id)).toBeTruthy();

    await as(admin)
      .post(`/team/customers/${id}/projects/${added.body.id}/status`, {
        status: 'LIVE',
      })
      .expect(200);
    const detail = await as(admin).get(`/team/customers/${id}`).expect(200);
    expect(detail.body.projects).toHaveLength(3);
    expect(detail.body.projects[2]).toMatchObject({
      name: 'Mobile booking app',
      type: 'WEB_APPLICATION',
      status: 'LIVE',
    });
    const changed = await auditOf('project.statusChanged', added.body.id);
    expect(changed?.data).toMatchObject({ from: 'PLANNING', to: 'LIVE' });

    // A project of another customer, or a status that doesn't exist.
    const other = await addCustomer();
    await as(admin)
      .post(`/team/customers/${other.id}/projects/${added.body.id}/status`, {
        status: 'LIVE',
      })
      .expect(404);
    await as(admin)
      .post(`/team/customers/${id}/projects/${added.body.id}/status`, {
        status: 'FINISHED',
      })
      .expect(400);
  });
});

describe('invitations and reset links from the team', () => {
  it('resending makes the old link stop working', async () => {
    const { id } = await addCustomer();
    const { contact } = (await as(admin).get(`/team/customers/${id}`)).body;
    const oldToken = invitationToken(contact.email);

    await as(admin).post(`/team/users/${contact.id}/invitation`).expect(202);
    const newToken = invitationToken(contact.email);
    expect(newToken).not.toBe(oldToken);
    await http().get(`/accounts/invitations/${oldToken}`).expect(410);
    await http().get(`/accounts/invitations/${newToken}`).expect(200);
    expect(await auditOf('invitation.resent', contact.id)).toBeTruthy();
  });

  it('a reset link goes only to active accounts', async () => {
    const { id, email } = await addCustomer();
    const { contact } = (await as(admin).get(`/team/customers/${id}`)).body;
    await as(admin)
      .post(`/team/users/${contact.id}/password-reset`)
      .expect(410);

    await activate(email, 'CUSTOMER');
    await as(admin)
      .post(`/team/users/${contact.id}/password-reset`)
      .expect(202);
    expect(
      sent.filter(
        (item) => item.to === email && /password/i.test(item.subject),
      ),
    ).toHaveLength(1);
    const log = await auditOf('passwordReset.sent', contact.id);
    expect(log?.actorId).toBe(admin.id);
  });
});

describe('the Users list and Add user', () => {
  it('shows the role tiles and the team, to super admins and admins only', async () => {
    const list = await as(admin).get('/team/users').expect(200);
    expect(Object.keys(list.body.byRole)).toEqual([
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'DEVELOPER',
    ]);
    expect(list.body.summary.active).toBeGreaterThanOrEqual(4);
    const rows = list.body.rows as {
      id: string;
      role: string;
      openAssigned: number | null;
      canManage: boolean;
    }[];
    // Never a customer; super admins come first.
    expect(rows.some((row) => row.role === 'CUSTOMER')).toBe(false);
    expect(rows[0].role).toBe('SUPER_ADMIN');
    const mine = rows.find((row) => row.id === admin.id)!;
    expect(mine.canManage).toBe(false);
    expect(rows.find((row) => row.id === superAdmin.id)!.canManage).toBe(false);
    const dev = rows.find((row) => row.id === developer.id)!;
    expect(dev).toMatchObject({ openAssigned: 0, canManage: true });
    expect(rows.find((row) => row.id === manager.id)!.openAssigned).toBeNull();

    await as(manager).get('/team/users').expect(403);
  });

  it('tells the Add user screen which roles each person may give', async () => {
    const forAdmin = await as(admin).get('/team/users/roles').expect(200);
    expect(forAdmin.body.canInvite).toEqual(['ADMIN', 'MANAGER', 'DEVELOPER']);
    expect(forAdmin.body.permissions['settings.manage']).toEqual([
      'SUPER_ADMIN',
    ]);
    const forOwner = await as(superAdmin).get('/team/users/roles').expect(200);
    expect(forOwner.body.canInvite).toEqual([
      'SUPER_ADMIN',
      'ADMIN',
      'MANAGER',
      'DEVELOPER',
    ]);
    await as(manager).get('/team/users/roles').expect(403);
  });

  it('an admin adds a developer but not a super admin; a super admin can', async () => {
    const refused = await as(admin)
      .post('/team/users', {
        name: 'Not allowed',
        email: uniqueEmail('super'),
        role: 'SUPER_ADMIN',
      })
      .expect(403);
    expect(refused.body.message).toBe(
      'Only a super admin can add another super admin.',
    );

    const email = uniqueEmail('ayesha');
    const added = await as(admin)
      .post('/team/users', {
        name: 'Ayesha Raza',
        email,
        jobTitle: 'Frontend developer',
        role: 'DEVELOPER',
      })
      .expect(201);
    expect(added.body.emailSent).toBe(true);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: added.body.id },
    });
    expect(user).toMatchObject({
      role: 'DEVELOPER',
      status: 'INVITED',
      jobTitle: 'Frontend developer',
      createdById: admin.id,
    });
    expect(sent.filter((item) => item.to === email)).toHaveLength(1);
    expect(await auditOf('user.invited', user.id)).toBeTruthy();

    await as(superAdmin)
      .post('/team/users', {
        name: 'Second owner',
        email: uniqueEmail('owner'),
        role: 'SUPER_ADMIN',
      })
      .expect(201);
    await as(manager)
      .post('/team/users', {
        name: 'X',
        email: uniqueEmail('x'),
        role: 'DEVELOPER',
      })
      .expect(403);
  });
});

describe('Disable user', () => {
  it('signs them out at once, keeps them out, and records it', async () => {
    const victim = await person('DEVELOPER', 'Omar Farooq');
    await as(victim).get('/me').expect(200);

    await as(admin).post(`/team/users/${victim.id}/disable`).expect(200);
    await as(victim).get('/me').expect(401);
    const again = await signIn(victim.email);
    expect(again.status).not.toBe(200);
    expect(await prisma.session.count({ where: { userId: victim.id } })).toBe(
      0,
    );
    const log = await auditOf('user.disabled', victim.id);
    expect(log?.actorId).toBe(admin.id);

    const list = await as(admin).get('/team/users').expect(200);
    const row = (list.body.rows as { id: string; status: string }[]).find(
      (item) => item.id === victim.id,
    );
    expect(row?.status).toBe('DISABLED');
  });

  it("an invited person's link stops working", async () => {
    const email = uniqueEmail('bilal');
    const added = await as(admin)
      .post('/team/users', { name: 'Bilal Khan', email, role: 'DEVELOPER' })
      .expect(201);
    const token = invitationToken(email);
    await as(admin).post(`/team/users/${added.body.id}/disable`).expect(200);
    await http().get(`/accounts/invitations/${token}`).expect(410);
  });

  it('not yourself, not a super admin by an admin, not by a manager', async () => {
    const self = await as(admin)
      .post(`/team/users/${admin.id}/disable`)
      .expect(409);
    expect(self.body.code).toBe('CANNOT_DISABLE_SELF');
    await as(admin).post(`/team/users/${superAdmin.id}/disable`).expect(403);
    await as(admin).post(`/team/users/${superAdmin.id}/invitation`).expect(403);
    await as(manager).post(`/team/users/${developer.id}/disable`).expect(403);
  });
});

describe('last active', () => {
  it('is saved when someone uses the app, at most every few minutes', async () => {
    const recent = new Date(Date.now() - 2 * 60 * 1000);
    await prisma.user.update({
      where: { id: manager.id },
      data: { lastActiveAt: recent },
    });
    await as(manager).get('/me').expect(200);
    const unchanged = await prisma.user.findUniqueOrThrow({
      where: { id: manager.id },
    });
    expect(unchanged.lastActiveAt).toEqual(recent);

    const old = new Date(Date.now() - LAST_ACTIVE_EVERY_MS - 60 * 1000);
    await prisma.user.update({
      where: { id: manager.id },
      data: { lastActiveAt: old },
    });
    const before = Date.now();
    await as(manager).get('/me').expect(200);
    const updated = await prisma.user.findUniqueOrThrow({
      where: { id: manager.id },
    });
    expect(updated.lastActiveAt!.getTime()).toBeGreaterThanOrEqual(
      before - 1000,
    );
  });
});
