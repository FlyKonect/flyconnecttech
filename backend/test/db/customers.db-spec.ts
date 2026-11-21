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

  it('edits the company name and a project, with audit entries; managers may not', async () => {
    const { id } = await addCustomer();
    await as(admin)
      .post(`/team/customers/${id}/details`, { company: 'Skyline Travel Ltd' })
      .expect(200);
    const detail = await as(admin).get(`/team/customers/${id}`).expect(200);
    expect(detail.body.company).toBe('Skyline Travel Ltd');
    const renamed = await auditOf('customer.updated', id);
    expect(renamed?.data).toMatchObject({
      from: { company: 'Skyline Travel' },
      to: { company: 'Skyline Travel Ltd' },
    });

    const project = detail.body.projects[0] as { id: string };
    await as(admin)
      .post(`/team/customers/${id}/projects/${project.id}`, {
        name: 'Skyline booking engine',
        type: 'WEB_APPLICATION',
      })
      .expect(200);
    const after = await as(admin).get(`/team/customers/${id}`).expect(200);
    expect(after.body.projects[0]).toMatchObject({
      name: 'Skyline booking engine',
      type: 'WEB_APPLICATION',
    });
    expect(await auditOf('project.updated', project.id)).toBeTruthy();

    // Checked, scoped to the customer, and admins only.
    await as(admin)
      .post(`/team/customers/${id}/details`, { company: '  ' })
      .expect(400);
    const other = await addCustomer();
    await as(admin)
      .post(`/team/customers/${other.id}/projects/${project.id}`, {
        name: 'X',
        type: 'WEBSITE',
      })
      .expect(404);
    await as(manager)
      .post(`/team/customers/${id}/details`, { company: 'Nope' })
      .expect(403);
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

describe('Change role and Enable user', () => {
  it('changes a role, which applies at once, with an audit entry', async () => {
    const person_ = await person('MANAGER', 'Ruth Adeyemi');
    await as(person_).get('/team/customers').expect(200);

    await as(admin)
      .post(`/team/users/${person_.id}/role`, { role: 'DEVELOPER' })
      .expect(200);
    // A developer sees no customers: the new role counts from the next click.
    await as(person_).get('/team/customers').expect(403);
    const log = await auditOf('user.roleChanged', person_.id);
    expect(log?.data).toMatchObject({ from: 'MANAGER', to: 'DEVELOPER' });
  });

  it('a developer who becomes a manager hands back their open requests', async () => {
    const dev = await person('DEVELOPER', 'Kofi Mensah');
    const { id } = await addCustomer();
    const detail = await as(admin).get(`/team/customers/${id}`).expect(200);
    const request = await prisma.$transaction(async (tx) =>
      tx.supportRequest.create({
        data: {
          code: `TKT-ROLE-${Date.now() % 100000}`,
          title: 'Hotel search slow',
          description: 'It takes a minute.',
          type: 'TECHNICAL_ISSUE',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          projectId: detail.body.projects[0].id,
          customerId: id,
          assigneeId: dev.id,
        },
      }),
    );
    await as(admin)
      .post(`/team/users/${dev.id}/role`, { role: 'MANAGER' })
      .expect(200);
    const after = await prisma.supportRequest.findUniqueOrThrow({
      where: { id: request.id },
    });
    expect(after.assigneeId).toBeNull();
    expect(after.status).toBe('UNDER_REVIEW');
  });

  it('same limits as Add user: not yourself, admins never to or from super admin', async () => {
    const target = await person('DEVELOPER', 'Ines Duarte');
    const self = await as(admin)
      .post(`/team/users/${admin.id}/role`, { role: 'MANAGER' })
      .expect(409);
    expect(self.body.code).toBe('NOT_YOURSELF');
    await as(admin)
      .post(`/team/users/${target.id}/role`, { role: 'SUPER_ADMIN' })
      .expect(403);
    await as(admin)
      .post(`/team/users/${superAdmin.id}/role`, { role: 'ADMIN' })
      .expect(403);
    await as(manager)
      .post(`/team/users/${target.id}/role`, { role: 'MANAGER' })
      .expect(403);
    await as(admin)
      .post(`/team/users/${target.id}/role`, { role: 'CUSTOMER' })
      .expect(400);
    await as(superAdmin)
      .post(`/team/users/${target.id}/role`, { role: 'SUPER_ADMIN' })
      .expect(200);
  });

  it('enables a disabled account: Active again if activated, Invited if not', async () => {
    const active = await person('DEVELOPER', 'Tariq Aziz');
    await as(admin).post(`/team/users/${active.id}/disable`).expect(200);
    const back = await as(admin)
      .post(`/team/users/${active.id}/enable`)
      .expect(200);
    expect(back.body).toEqual({ status: 'ACTIVE' });
    expect((await signIn(active.email)).status).toBe(200);
    expect(await auditOf('user.enabled', active.id)).toBeTruthy();

    const email = uniqueEmail('never');
    const added = await as(admin)
      .post('/team/users', { name: 'Never Came', email, role: 'DEVELOPER' })
      .expect(201);
    await as(admin).post(`/team/users/${added.body.id}/disable`).expect(200);
    const invited = await as(admin)
      .post(`/team/users/${added.body.id}/enable`)
      .expect(200);
    expect(invited.body).toEqual({ status: 'INVITED' });

    await as(manager).post(`/team/users/${active.id}/enable`).expect(403);
  });
});

describe('Change email', () => {
  const confirmToken = (to: string) => {
    const email = [...sent].reverse().find((item) => item.to === to);
    return JSON.stringify(email?.template.props).match(
      /\/confirm-email\/([A-Za-z0-9_-]{43})/,
    )![1];
  };

  it('someone invited: changes at once and sends a new invitation there', async () => {
    const email = uniqueEmail('first');
    const added = await as(admin)
      .post('/team/users', { name: 'Zara Malik', email, role: 'DEVELOPER' })
      .expect(201);
    const oldToken = invitationToken(email);
    const next = uniqueEmail('second');
    const changed = await as(admin)
      .post(`/team/users/${added.body.id}/email`, { email: next })
      .expect(200);
    expect(changed.body).toEqual({ result: 'changed' });
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: added.body.id },
    });
    expect(user.email).toBe(next);
    expect(invitationToken(next)).toBeTruthy();
    await http().get(`/accounts/invitations/${oldToken}`).expect(410);
    expect(await auditOf('user.emailChanged', added.body.id)).toBeTruthy();
  });

  it('someone active: only once the new address confirms, then signed out everywhere', async () => {
    const who = await person('DEVELOPER', 'Elif Kaya');
    const next = uniqueEmail('elif-new');
    const asked = await as(admin)
      .post(`/team/users/${who.id}/email`, { email: next })
      .expect(200);
    expect(asked.body).toEqual({ result: 'confirmation-sent' });

    // Nothing changes until the link is used.
    expect(
      (await prisma.user.findUniqueOrThrow({ where: { id: who.id } })).email,
    ).toBe(who.email);
    const token = confirmToken(next);
    const shown = await http()
      .get(`/accounts/email-change/${token}`)
      .expect(200);
    expect(shown.body).toEqual({ email: next });

    await http().post(`/accounts/email-change/${token}/confirm`).expect(200);
    const after = await prisma.user.findUniqueOrThrow({
      where: { id: who.id },
    });
    expect(after.email).toBe(next);
    await as(who).get('/me').expect(401);
    expect((await signIn(next)).status).toBe(200);
    expect(sent.some((item) => item.to === who.email)).toBe(true);
    const log = await auditOf('user.emailChanged', who.id);
    expect(log).toMatchObject({ actorId: admin.id });
    expect(log?.data).toMatchObject({ from: who.email, to: next });

    // Once only.
    await http().post(`/accounts/email-change/${token}/confirm`).expect(410);
  });

  it('refuses an email another account uses, and managers may not', async () => {
    const who = await person('DEVELOPER', 'Hugo Laurent');
    const taken = await as(admin)
      .post(`/team/users/${who.id}/email`, { email: manager.email })
      .expect(409);
    expect(taken.body.code).toBe('EMAIL_TAKEN');
    await as(admin)
      .post(`/team/users/${who.id}/email`, { email: 'not-an-email' })
      .expect(400);
    await as(manager)
      .post(`/team/users/${who.id}/email`, { email: uniqueEmail('x') })
      .expect(403);
    await http().get('/accounts/email-change/not-a-token').expect(410);
  });
});

describe('sessions: idle team sessions, two-step reset, signed-in devices', () => {
  const HOUR = 60 * 60 * 1000;

  it('a team session unused for 12 hours ends; a used one carries on', async () => {
    const who = await person('DEVELOPER', 'Idle Isla');
    await as(who).get('/me').expect(200);
    await prisma.session.updateMany({
      where: { userId: who.id },
      data: { updatedAt: new Date(Date.now() - 13 * HOUR) },
    });
    const gone = await as(who).get('/me').expect(401);
    expect(gone.body.reason).toBe('IDLE');
    expect(await prisma.session.count({ where: { userId: who.id } })).toBe(0);
  });

  it('a super admin resets two-step sign-in; admins may not', async () => {
    const who = await person('DEVELOPER', 'Lost Phone');
    await as(admin).post(`/team/users/${who.id}/two-factor-reset`).expect(403);
    await as(superAdmin)
      .post(`/team/users/${who.id}/two-factor-reset`)
      .expect(200);
    const after = await prisma.user.findUniqueOrThrow({
      where: { id: who.id },
    });
    expect(after.twoFactorEnabled).toBe(false);
    expect(await prisma.twoFactor.count({ where: { userId: who.id } })).toBe(0);
    await as(who).get('/me').expect(401);
    expect(await auditOf('user.twoFactorReset', who.id)).toBeTruthy();

    // Signing in again: everything waits for the new two-step setup.
    const again = await signIn(who.email).expect(200);
    await http()
      .get('/team/requests')
      .set('Cookie', cookieFrom(again))
      .expect(403);
  });

  it('lists signed-in devices and signs out everywhere else', async () => {
    const who = await person('MANAGER', 'Two Laptops');
    // Another device: a second session of theirs.
    const other = await prisma.session.create({
      data: {
        token: `other-device-${Date.now()}`,
        userId: who.id,
        expiresAt: new Date(Date.now() + 24 * HOUR),
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      },
    });
    const listed = await as(who).get('/me/sessions').expect(200);
    expect(listed.body.sessions).toHaveLength(2);
    expect(
      listed.body.sessions.filter((s: { current: boolean }) => s.current),
    ).toHaveLength(1);

    const done = await as(who).post('/me/sessions/sign-out-others').expect(200);
    expect(done.body.signedOut).toBe(1);
    await as(who).get('/me').expect(200);
    expect(await prisma.session.count({ where: { id: other.id } })).toBe(0);
  });
});

describe('Download CSV', () => {
  it('admins download requests, customers and leads; managers may not', async () => {
    const { id } = await addCustomer();
    const customers = await as(admin)
      .get('/team/customers/export.csv?q=Skyline')
      .expect(200);
    expect(customers.headers['content-type']).toContain('text/csv');
    expect(customers.headers['content-disposition']).toMatch(
      /attachment; filename="customers-\d{4}-\d{2}-\d{2}\.csv"/,
    );
    expect(customers.text.startsWith('﻿"Company","Contact"')).toBe(true);
    expect(customers.text).toContain('"Skyline Travel"');

    const requests = await as(admin)
      .get('/team/requests/export.csv?status=submitted')
      .expect(200);
    expect(requests.text).toContain('"Code","Title","Status"');
    const demos = await as(admin)
      .get('/team/leads/demos/export.csv')
      .expect(200);
    expect(demos.text).toContain('"Email"');

    // The same lists as Excel; any other format is refused.
    for (const path of [
      '/team/customers/export.xlsx?q=Skyline',
      '/team/requests/export.xlsx?status=submitted',
      '/team/leads/quotes/export.xlsx',
    ]) {
      const excel = await as(admin)
        .get(path)
        .buffer(true)
        .parse((res, done) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => done(null, Buffer.concat(chunks)));
        })
        .expect(200);
      expect(excel.headers['content-type']).toContain('spreadsheetml');
      expect(excel.headers['content-disposition']).toMatch(/\.xlsx"$/);
      expect((excel.body as Buffer).subarray(0, 2).toString('latin1')).toBe(
        'PK',
      );
    }
    await as(admin).get('/team/customers/export.pdf').expect(400);
    await as(manager).get('/team/customers/export.xlsx').expect(403);

    await as(manager).get('/team/customers/export.csv').expect(403);
    await as(manager).get('/team/requests/export.csv').expect(403);
    await as(manager).get('/team/leads/quotes/export.csv').expect(403);

    const logged = await prisma.auditLog.findFirst({
      where: { action: 'export.downloaded', entityId: 'customers' },
      orderBy: { createdAt: 'desc' },
    });
    expect(logged?.actorId).toBe(admin.id);
    expect(id).toBeTruthy();
  });
});

describe("A customer's data as a ZIP", () => {
  it('admins download it from the customer page; managers may not', async () => {
    const { id } = await addCustomer();
    const zip = await as(admin)
      .get(`/team/customers/${id}/export.zip`)
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(zip.headers['content-type']).toContain('application/zip');
    expect(zip.headers['content-disposition']).toMatch(
      /attachment; filename="skyline-travel-data-\d{4}-\d{2}-\d{2}\.zip"/,
    );
    const bytes = zip.body as Buffer;
    expect(bytes.subarray(0, 2).toString('latin1')).toBe('PK');
    // The names inside are stored as plain text in the ZIP's index.
    const names = bytes.toString('latin1');
    for (const file of [
      'README.txt',
      'profile.csv',
      'projects.csv',
      'project-items.csv',
      'project-updates.csv',
      'modules.csv',
      'module-timeline.csv',
      'discussions.csv',
      'discussion-messages.csv',
      'requests.csv',
      'messages.csv',
    ]) {
      expect(names).toContain(file);
    }
    expect(
      await prisma.auditLog.count({
        where: { action: 'export.downloaded', entityId: 'customer-data' },
      }),
    ).toBeGreaterThan(0);
    await as(manager).get(`/team/customers/${id}/export.zip`).expect(403);
  });
});

describe('Activity log', () => {
  it('super admins read who changed what, filtered and paged; admins may not', async () => {
    const who = await person('DEVELOPER', 'Logged Lena');
    await as(admin).post(`/team/users/${who.id}/disable`).expect(200);

    const log = await as(superAdmin)
      .get(`/team/audit?what=accounts&person=${admin.id}&size=10`)
      .expect(200);
    expect(log.body).toMatchObject({ page: 1, pageSize: 10 });
    expect(log.body.groups).toContain('accounts');
    const first = log.body.rows[0] as {
      who: string;
      did: string;
      subject: string;
    };
    expect(first).toMatchObject({ who: 'Emma Clarke', did: 'disabled' });
    expect(first.subject).toBe(who.email);

    // Another group: nothing about accounts.
    const exports = await as(superAdmin)
      .get('/team/audit?what=exports')
      .expect(200);
    for (const row of exports.body.rows as { did: string }[]) {
      expect(row.did).toBe('downloaded a CSV of');
    }
    await as(admin).get('/team/audit').expect(403);
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
