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
import { defaultSettings } from '../../src/settings/defaults.js';
import { secretFromUri, totp } from '../totp.js';

// The team panel on a real database (docs/01, section 5): who sees what,
// assigning, replies and internal notes, statuses, emails and dashboards.

const DOMAIN = '@team.test';
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
  const invitation = [...sent].reverse().find((item) => item.to === email);
  const token = JSON.stringify(invitation?.template.props).match(
    /\/invite\/([A-Za-z0-9_-]{43})/,
  )![1];
  await http()
    .post(`/accounts/invitations/${token}/accept`)
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
  return { id: userId, email, name, cookie };
}

let sarah: Person;
let admin: Person;
let manager: Person;
let dev1: Person;
let dev2: Person;
let projectId: string;

const as = (who: Person) => ({
  get: (path: string) => http().get(path).set('Cookie', who.cookie),
  post: (path: string, body: object = {}) =>
    http().post(path).set('Cookie', who.cookie).send(body),
});

/** A new request from Sarah. Returns its code. */
async function newRequest(priority = 'MEDIUM', title = 'Checkout fails') {
  const response = await http()
    .post('/portal/requests')
    .set('Cookie', sarah.cookie)
    .field('projectId', projectId)
    .field('type', 'TECHNICAL_ISSUE')
    .field('priority', priority)
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

const emailsTo = (who: Person, subject: string) =>
  sent.filter((email) => email.to === who.email && email.subject === subject);

async function setTeamNotifications(
  changes: Partial<typeof defaultSettings.teamNotifications>,
) {
  const value = { ...defaultSettings.teamNotifications, ...changes };
  await prisma.setting.upsert({
    where: { key: 'teamNotifications' },
    create: { key: 'teamNotifications', value },
    update: { value },
  });
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

  // Other test files' people are not in the way; this file's leftovers go.
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
  // Developers from other files would show in the dashboards: put them aside.
  await prisma.user.updateMany({
    where: { role: 'DEVELOPER', status: 'ACTIVE' },
    data: { status: 'DISABLED' },
  });
  await setTeamNotifications({});

  sarah = await person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
  dev1 = await person('DEVELOPER', 'Daniyal Ahmed');
  dev2 = await person('DEVELOPER', 'Priya Nair');
  const { customerId } = await prisma.user.findUniqueOrThrow({
    where: { id: sarah.id },
  });
  const project = await prisma.$transaction(async (tx) =>
    tx.project.create({
      data: {
        code: await nextCode(tx, 'project'),
        name: 'Bluewave booking website',
        type: 'TRAVEL_BOOKING_PLATFORM',
        customerId: customerId!,
      },
    }),
  );
  projectId = project.id;
});

afterAll(async () => {
  await setTeamNotifications({});
  await app?.close();
});

describe('new requests reach the team', () => {
  it('an Urgent request alerts the admins by email, unless the setting is off', async () => {
    const code = await newRequest('URGENT');
    const subject = `Urgent request ${code} from Bluewave Holidays`;
    expect(emailsTo(admin, subject)).toHaveLength(1);
    expect(emailsTo(manager, subject)).toHaveLength(0);
    const alert = await prisma.notification.findFirst({
      where: { userId: manager.id, text: subject },
    });
    expect(alert?.kind).toBe('urgent');

    await setTeamNotifications({ urgentAlert: false });
    const quiet = await newRequest('URGENT');
    expect(
      emailsTo(admin, `Urgent request ${quiet} from Bluewave Holidays`),
    ).toHaveLength(0);
    await setTeamNotifications({});
  });
});

describe('who sees what', () => {
  let code: string;
  beforeAll(async () => {
    code = await newRequest();
  });

  it('a developer sees only requests assigned to them', async () => {
    const list = await as(admin).get('/team/requests').expect(200);
    expect(JSON.stringify(list.body.rows)).toContain(code);

    const mine = await as(dev1).get('/team/requests').expect(200);
    expect(JSON.stringify(mine.body.rows)).not.toContain(code);
    await as(dev1).get(`/team/requests/${code}`).expect(404);
    await as(dev1)
      .post(`/team/requests/${code}/messages`, { kind: 'note', body: 'Hi' })
      .expect(404);
    await as(dev1)
      .post(`/team/requests/${code}/status`, { status: 'IN_PROGRESS' })
      .expect(404);
  });

  it('customers are kept out of the team routes, and developers out of assigning', async () => {
    await as(sarah).get('/team/requests').expect(403);
    await as(dev1)
      .post(`/team/requests/${code}/assign`, { developerId: dev1.id })
      .expect(403);
    await as(dev1).get('/team/developers').expect(403);
  });
});

describe('assigning', () => {
  it('moves a new request to Under Review and tells the developer', async () => {
    const code = await newRequest();
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: dev1.id })
      .expect(200);

    const saved = await stored(code);
    expect(saved).toMatchObject({
      assigneeId: dev1.id,
      status: 'UNDER_REVIEW',
    });
    expect(saved.messages.map((m) => m.body)).toContain(
      'Assigned to Daniyal Ahmed by Emma Clarke',
    );
    expect(emailsTo(dev1, `${code} was assigned to you`)).toHaveLength(1);
    const told = await prisma.notification.findFirst({
      where: { userId: dev1.id, text: `${code} was assigned to Daniyal Ahmed` },
    });
    expect(told?.kind).toBe('review');
    const customerTold = await prisma.notification.findFirst({
      where: { userId: sarah.id, text: `${code} moved to Under Review` },
    });
    expect(customerTold).not.toBeNull();

    // Now Daniyal can open it.
    await as(dev1).get(`/team/requests/${code}`).expect(200);

    // A transfer says so, and Daniyal loses it.
    await as(admin)
      .post(`/team/requests/${code}/assign`, {
        developerId: dev2.id,
        transfer: true,
      })
      .expect(200);
    expect((await stored(code)).messages.map((m) => m.body)).toContain(
      'Transferred from Daniyal Ahmed to Priya Nair by Emma Clarke',
    );
    await as(dev1).get(`/team/requests/${code}`).expect(404);
  });

  it('only to an active developer', async () => {
    const code = await newRequest();
    const response = await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: manager.id })
      .expect(400);
    expect(response.body.code).toBe('NOT_A_DEVELOPER');
  });
});

describe('the conversation', () => {
  let code: string;
  beforeAll(async () => {
    code = await newRequest();
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: dev2.id })
      .expect(200);
  });

  it('an internal note never reaches the customer', async () => {
    const before = await stored(code);
    const notesBefore = await prisma.notification.count({
      where: { userId: sarah.id },
    });
    const emailsBefore = sent.length;

    await as(dev2)
      .post(`/team/requests/${code}/messages`, {
        kind: 'note',
        body: 'SECRET-NOTE: the supplier drops leg 3',
      })
      .expect(200);

    const portal = await as(sarah).get(`/portal/requests/${code}`).expect(200);
    expect(JSON.stringify(portal.body)).not.toContain('SECRET-NOTE');
    expect(sent.slice(emailsBefore)).toHaveLength(0);
    expect(
      await prisma.notification.count({ where: { userId: sarah.id } }),
    ).toBe(notesBefore);
    expect((await stored(code)).updatedAt).toEqual(before.updatedAt);

    // The team sees it, marked as a note.
    const team = await as(admin).get(`/team/requests/${code}`).expect(200);
    expect(team.body.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'INTERNAL_NOTE',
          body: 'SECRET-NOTE: the supplier drops leg 3',
        }),
      ]),
    );
  });

  it("a reply sets the first response time and follows the customer's choices", async () => {
    await as(dev2)
      .post(`/team/requests/${code}/messages`, {
        kind: 'reply',
        body: 'We are looking at it now.',
      })
      .expect(200);
    const first = (await stored(code)).firstResponseAt;
    expect(first).not.toBeNull();
    expect(emailsTo(sarah, `Priya Nair replied to ${code}`)).toHaveLength(1);

    await prisma.user.update({
      where: { id: sarah.id },
      data: {
        emailPrefs: {
          replies: false,
          statusChanges: true,
          weeklySummary: false,
        },
      },
    });
    await as(dev2)
      .post(`/team/requests/${code}/messages`, {
        kind: 'reply',
        body: 'A fix is on staging.',
      })
      .expect(200);
    expect(emailsTo(sarah, `Priya Nair replied to ${code}`)).toHaveLength(1);
    expect((await stored(code)).firstResponseAt).toEqual(first);
    await prisma.user.update({
      where: { id: sarah.id },
      data: {
        emailPrefs: {
          replies: true,
          statusChanges: true,
          weeklySummary: false,
        },
      },
    });
  });
});

describe('statuses, priority and the dialogs', () => {
  it("a developer's limits", async () => {
    const code = await newRequest();
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: dev2.id })
      .expect(200);
    const dev = as(dev2);
    await dev
      .post(`/team/requests/${code}/status`, { status: 'CLOSED' })
      .expect(403);
    await dev
      .post(`/team/requests/${code}/status`, { status: 'SUBMITTED' })
      .expect(403);
    await dev
      .post(`/team/requests/${code}/priority`, { priority: 'HIGH' })
      .expect(403);
    await dev.post(`/team/requests/${code}/close`).expect(403);
    await dev
      .post(`/team/requests/${code}/status`, { status: 'IN_PROGRESS' })
      .expect(200);
    expect((await stored(code)).messages.map((m) => m.body)).toContain(
      'Status changed to In Progress by Priya Nair',
    );
    const detail = await dev.get(`/team/requests/${code}`).expect(200);
    expect(detail.body.can).toEqual({
      assign: false,
      changePriority: false,
      close: false,
      statuses: ['IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED'],
    });
  });

  it('request more info waits for the customer; their reply wakes it and tells the developer', async () => {
    const code = await newRequest();
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: dev2.id })
      .expect(200);
    await as(dev2)
      .post(`/team/requests/${code}/request-info`, {
        body: 'Which booking reference was it?',
      })
      .expect(200);
    const waiting = await stored(code);
    expect(waiting.status).toBe('WAITING_FOR_CUSTOMER');
    expect(waiting.slaPausedAt).not.toBeNull();
    const asked = emailsTo(sarah, `${code} needs more information from you`);
    expect(asked).toHaveLength(1);
    expect(asked[0].template.props).toMatchObject({
      note: 'Which booking reference was it?',
    });

    await http()
      .post(`/portal/requests/${code}/replies`)
      .set('Cookie', sarah.cookie)
      .field('body', 'BW-58213')
      .expect(201);
    expect((await stored(code)).status).toBe('IN_PROGRESS');
    expect(emailsTo(dev2, `Sarah Mitchell replied on ${code}`)).toHaveLength(1);

    // With the setting off, no email.
    await setTeamNotifications({ notifyAssigneeOnReply: false });
    await http()
      .post(`/portal/requests/${code}/replies`)
      .set('Cookie', sarah.cookie)
      .field('body', 'Any news?')
      .expect(201);
    expect(emailsTo(dev2, `Sarah Mitchell replied on ${code}`)).toHaveLength(1);
    await setTeamNotifications({});
  });

  it('resolve asks the customer to confirm; close; priority moves the due time', async () => {
    const code = await newRequest();
    await as(admin)
      .post(`/team/requests/${code}/assign`, { developerId: dev2.id })
      .expect(200);
    await as(dev2)
      .post(`/team/requests/${code}/resolve`, {
        summary: 'The fix is live.',
        email: true,
      })
      .expect(200);
    const resolved = await stored(code);
    expect(resolved.status).toBe('RESOLVED');
    expect(resolved.resolvedAt).not.toBeNull();
    expect(resolved.messages.map((m) => m.body)).toContain('The fix is live.');
    const confirm = emailsTo(
      sarah,
      `${code} was resolved. Please confirm the fix.`,
    );
    expect(confirm).toHaveLength(1);
    expect(confirm[0].template.props).toMatchObject({
      note: 'The fix is live.',
    });

    // Without the email.
    const quiet = await newRequest();
    await as(admin)
      .post(`/team/requests/${quiet}/resolve`, { summary: '', email: false })
      .expect(200);
    expect(
      emailsTo(sarah, `${quiet} was resolved. Please confirm the fix.`),
    ).toHaveLength(0);

    // Close.
    await as(admin).post(`/team/requests/${quiet}/close`).expect(200);
    const closed = await stored(quiet);
    expect(closed.status).toBe('CLOSED');
    expect(closed.messages.map((m) => m.body)).toContain(
      'Emma Clarke closed this request',
    );

    // Priority: Urgent is due 1 hour after the request arrived.
    const urgent = await newRequest('LOW');
    await as(manager)
      .post(`/team/requests/${urgent}/priority`, { priority: 'URGENT' })
      .expect(200);
    const changed = await stored(urgent);
    expect(changed.priority).toBe('URGENT');
    expect(changed.dueAt!.getTime() - changed.createdAt.getTime()).toBe(
      60 * 60 * 1000,
    );
    expect(changed.messages.map((m) => m.body)).toContain(
      'Priority changed to Urgent',
    );
  });
});

describe('the dashboards and the sidebar numbers', () => {
  it('each role gets its own; developers count only their own requests', async () => {
    const adminDash = await as(admin).get('/team/dashboard').expect(200);
    expect(adminDash.body).toMatchObject({
      role: 'ADMIN',
      customers: { total: expect.any(Number), invited: expect.any(Number) },
      team: { active: expect.any(Number) },
    });
    expect(adminDash.body.counts.all).toBeGreaterThan(5);
    expect(adminDash.body.firstResponse.thisMonth).not.toBeNull();
    expect(
      adminDash.body.newRequests.every(
        (row: { status: string }) => row.status === 'SUBMITTED',
      ),
    ).toBe(true);
    expect(
      adminDash.body.workload.map((d: { name: string }) => d.name),
    ).toEqual(['Daniyal Ahmed', 'Priya Nair']);

    const managerDash = await as(manager).get('/team/dashboard').expect(200);
    expect(managerDash.body.team).toBeNull();
    expect(managerDash.body.unassignedRequests.length).toBeGreaterThan(0);

    const devDash = await as(dev2).get('/team/dashboard').expect(200);
    expect(devDash.body.role).toBe('DEVELOPER');
    const mine = await prisma.supportRequest.count({
      where: { assigneeId: dev2.id },
    });
    expect(devDash.body.counts.all).toBe(mine);
    expect(devDash.body).not.toHaveProperty('customers');

    const summary = await as(dev1).get('/team/summary').expect(200);
    expect(summary.body.requests.all).toBe(
      await prisma.supportRequest.count({ where: { assigneeId: dev1.id } }),
    );
  });

  it('the list filters by tab, priority and assignee', async () => {
    const list = await as(admin)
      .get(
        `/team/requests?status=submitted&priority=URGENT&assignee=unassigned`,
      )
      .expect(200);
    expect(list.body.rows.length).toBeGreaterThan(0);
    expect(
      list.body.rows.every(
        (row: { status: string; priority: string; assignee: unknown }) =>
          row.status === 'SUBMITTED' &&
          row.priority === 'URGENT' &&
          row.assignee === null,
      ),
    ).toBe(true);
    expect(list.body.tabs.all).toBeGreaterThanOrEqual(list.body.tabs.new);
    expect(list.body.rows[0].customer).toEqual({
      company: 'Bluewave Holidays',
      name: 'Sarah Mitchell',
    });
  });
});
