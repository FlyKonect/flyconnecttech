import { existsSync } from 'node:fs';
import path from 'node:path';
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
import { uploadRoot } from '../../src/uploads/file-storage.service.js';
import { secretFromUri, totp } from '../totp.js';

// Projects on a real database: details, "What's included", progress and
// updates; who may see and change them; the customer's My Projects (never
// the team notes); delete and restore.

const DOMAIN = '@projects.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const NOTES = 'Team only: the client pays late, chase invoices early.';
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('a small test picture'),
]);
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

type Person = {
  id: string;
  email: string;
  cookie: string;
  customerId: string | null;
};

async function person(
  role: Role,
  name: string,
  company?: string,
): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const { userId, customerId } = await invitations.inviteUser(
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
  return { id: userId, email, cookie, customerId: customerId ?? null };
}

const as = (who: Person) => ({
  get: (path: string) => http().get(path).set('Cookie', who.cookie),
  post: (path: string, body: object = {}) =>
    http().post(path).set('Cookie', who.cookie).send(body),
});

let superAdmin: Person;
let admin: Person;
let manager: Person;
let developer: Person;
let customer: Person;
let other: Person;

/** A new project for Sarah's company. Returns its code. */
async function newProject(extra: object = {}) {
  const response = await as(admin)
    .post('/team/projects', {
      customerId: customer.customerId,
      name: 'Bluewave booking website',
      type: 'TRAVEL_BOOKING_PLATFORM',
      description: 'Flights and hotels for Bluewave customers.',
      items:
        'Flight search\nHotel search\nStripe payments\nAgent portal\nEmails',
      startDate: '2026-11-02',
      targetDate: '2027-01-15',
      leadId: admin.id,
      ...extra,
    })
    .expect(201);
  return response.body.code as string;
}

/** The items of the project's first module ("General"). */
const items = async (code: string) =>
  (await as(admin).get(`/team/projects/${code}`).expect(200)).body.modules[0]
    .items as {
    id: string;
    title: string;
    status: string;
    doneAt: string | null;
  }[];

/** The id of the project's first module ("General"). */
const generalId = async (code: string) =>
  (await as(admin).get(`/team/projects/${code}`).expect(200)).body.modules[0]
    .id as string;

const audits = (action: string, code: string) =>
  prisma.auditLog.findMany({
    where: { action, data: { path: '$.code', equals: code } },
  });

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
  developer = await person('DEVELOPER', 'Daniyal Ahmed');
  customer = await person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
  other = await person('CUSTOMER', 'Omar Khan', 'Skyline Travel');
});

afterAll(async () => {
  await app?.close();
});

describe('who may see and change projects', () => {
  it('super admins and admins change them, managers only look, developers and customers get nothing', async () => {
    const code = await newProject();
    await as(superAdmin)
      .post(`/team/projects/${code}/status`, { status: 'IN_DESIGN' })
      .expect(200);

    const looked = await as(manager).get(`/team/projects/${code}`).expect(200);
    expect(looked.body.can).toEqual({
      manage: false,
      work: false,
      delete: false,
      viewCustomer: true,
    });
    expect(looked.body.leadChoices).toEqual([]);
    const list = await as(manager).get(`/team/projects?q=${code}`).expect(200);
    expect(list.body.rows.map((row: { code: string }) => row.code)).toEqual([
      code,
    ]);
    for (const path of [
      `/team/projects/${code}/details`,
      `/team/projects/${code}/items`,
      `/team/projects/${code}/updates`,
      `/team/projects/${code}/delete`,
    ]) {
      await as(manager).post(path, {}).expect(403);
    }
    await as(manager)
      .post('/team/projects', { customerId: customer.customerId })
      .expect(403);

    // Developers see only the projects they are on: not this one.
    const theirs = await as(developer).get('/team/projects').expect(200);
    expect(
      theirs.body.rows.map((row: { code: string }) => row.code),
    ).not.toContain(code);
    await as(developer).get(`/team/projects/${code}`).expect(404);
    await as(customer).get(`/team/projects/${code}`).expect(403);
  });
});

describe('details, items and progress', () => {
  it('Add customer saves each project with its description and items', async () => {
    const email = uniqueEmail('new-customer');
    const created = await as(admin)
      .post('/team/customers', {
        name: 'Hassan Qureshi',
        email,
        company: 'Skyline Holidays',
        projects: [
          {
            name: 'Skyline website',
            type: 'WEBSITE',
            description: 'A new website with online booking.',
            items: 'Home page\n\n- Booking form\nContact page',
          },
          { name: 'Support plan', type: 'MAINTENANCE_PLAN' },
        ],
      })
      .expect(201);
    const projects = await prisma.project.findMany({
      where: { customerId: created.body.id },
      orderBy: { code: 'asc' },
      include: { items: { orderBy: { position: 'asc' } } },
    });
    expect(projects[0]).toMatchObject({
      name: 'Skyline website',
      description: 'A new website with online booking.',
    });
    expect(projects[0].items.map((item) => item.title)).toEqual([
      'Home page',
      'Booking form',
      'Contact page',
    ]);
    // "What's included" goes into a first module, "General".
    const modules = await prisma.projectModule.findMany({
      where: { projectId: projects[0].id },
    });
    expect(modules.map((m) => [m.name, m.stage])).toEqual([
      ['General', 'NOT_STARTED'],
    ]);
    expect(projects[1].items).toEqual([]);
    expect(projects[1].description).toBeNull();
  });

  it('edits every detail, keeps the team notes, and refuses bad addresses and leads', async () => {
    const code = await newProject();
    const details = {
      name: 'Bluewave booking platform',
      type: 'TRAVEL_BOOKING_PLATFORM',
      description: 'Flights, hotels and an agent portal.',
      startDate: '2026-11-02',
      targetDate: '2027-02-01',
      liveDate: '',
      supportUntil: '2028-02-01',
      liveUrl: 'https://bluewave.example.com',
      testUrl: 'https://test.bluewave.example.com',
      builtWith: 'Next.js, Amadeus, Stripe',
      leadId: manager.id,
      teamNotes: NOTES,
    };
    await as(admin).post(`/team/projects/${code}/details`, details).expect(200);
    const page = await as(admin).get(`/team/projects/${code}`).expect(200);
    expect(page.body).toMatchObject({
      name: 'Bluewave booking platform',
      targetDate: '2027-02-01',
      liveDate: null,
      supportUntil: '2028-02-01',
      builtWith: 'Next.js, Amadeus, Stripe',
      lead: { id: manager.id, name: 'Sofia Martins' },
      teamNotes: NOTES,
      can: { manage: true, delete: true },
    });
    const [audit] = await audits('project.updated', code);
    expect(audit.data).toMatchObject({
      changed: expect.arrayContaining(['name', 'teamNotes', 'leadId']),
    });

    await as(admin)
      .post(`/team/projects/${code}/details`, {
        ...details,
        liveUrl: 'javascript:alert(1)',
      })
      .expect(400);
    await as(admin)
      .post(`/team/projects/${code}/details`, {
        ...details,
        leadId: customer.id,
      })
      .expect(400);
  });

  it('ticks, moves and removes items, and progress follows', async () => {
    const code = await newProject();
    let list = await items(code);
    expect(list.map((item) => item.title)).toEqual([
      'Flight search',
      'Hotel search',
      'Stripe payments',
      'Agent portal',
      'Emails',
    ]);

    await as(admin)
      .post(`/team/projects/${code}/items/${list[0].id}`, { status: 'DONE' })
      .expect(200);
    await as(admin)
      .post(`/team/projects/${code}/items/${list[1].id}`, {
        status: 'IN_PROGRESS',
      })
      .expect(200);
    await as(admin)
      .post(`/team/projects/${code}/items/${list[4].id}/move`, {
        direction: 'up',
      })
      .expect(200);
    await as(admin)
      .post(`/team/projects/${code}/items/${list[2].id}`, {
        title: 'Stripe and PayPal payments',
        detail: 'Cards first',
      })
      .expect(200);
    await as(admin)
      .post(`/team/projects/${code}/items`, {
        moduleId: await generalId(code),
        lines: 'Reports\nTraining',
      })
      .expect(200);
    await as(admin)
      .post(`/team/projects/${code}/items/${list[3].id}/remove`)
      .expect(200);

    list = await items(code);
    expect(list.map((item) => [item.title, item.status])).toEqual([
      ['Flight search', 'DONE'],
      ['Hotel search', 'IN_PROGRESS'],
      ['Stripe and PayPal payments', 'TODO'],
      ['Emails', 'TODO'],
      ['Reports', 'TODO'],
      ['Training', 'TODO'],
    ]);
    expect(list[0].doneAt).not.toBeNull();
    const page = await as(manager).get(`/team/projects/${code}`).expect(200);
    expect(page.body.progress).toEqual({ done: 1, total: 6, percent: 17 });

    // Leaving Done clears its date.
    await as(admin)
      .post(`/team/projects/${code}/items/${list[0].id}`, { status: 'TODO' })
      .expect(200);
    expect((await items(code))[0].doneAt).toBeNull();
    // Another project's item is not found here.
    const second = await newProject();
    await as(admin)
      .post(`/team/projects/${second}/items/${list[1].id}`, { status: 'DONE' })
      .expect(404);
  });
});

describe('updates', () => {
  it('posts an update with a file: the customer gets a notice and an email, unless they turned it off', async () => {
    const code = await newProject();
    const [first] = await items(code);
    await as(admin)
      .post(`/team/projects/${code}/items/${first.id}`, { status: 'DONE' })
      .expect(200);

    const posted = await http()
      .post(`/team/projects/${code}/updates`)
      .set('Cookie', admin.cookie)
      .field('body', 'Flight search is ready to try on the test site.')
      .attach('files', PNG, 'flight-search.png')
      .expect(200);
    expect(posted.body.emailSent).toBe(true);
    const email = sent.find(
      (item) =>
        item.to === customer.email &&
        item.subject === 'Update on Bluewave booking website',
    );
    expect(JSON.stringify(email?.template.props)).toContain(
      'Progress: 1 of 5 done (20%)',
    );
    const notice = await prisma.notification.findFirst({
      where: { userId: customer.id, href: `/portal/projects/${code}` },
    });
    expect(notice).toMatchObject({ kind: 'project' });

    // Empty updates are refused; the email follows the customer's tick.
    await as(admin)
      .post(`/team/projects/${code}/updates`, { body: '' })
      .expect(400);
    await prisma.user.update({
      where: { id: customer.id },
      data: {
        emailPrefs: {
          replies: true,
          statusChanges: true,
          weeklySummary: false,
          projectUpdates: false,
        },
      },
    });
    const quiet = await as(admin)
      .post(`/team/projects/${code}/updates`, { body: 'Hotel search started.' })
      .expect(200);
    expect(quiet.body.emailSent).toBe(false);
    await prisma.user.update({
      where: { id: customer.id },
      data: { emailPrefs: {} },
    });

    // Edit (no email) and remove (its file goes from the disk too).
    const page = await as(admin).get(`/team/projects/${code}`).expect(200);
    const [newest, withFile] = page.body.updates;
    expect(withFile.files[0].fileName).toBe('flight-search.png');
    const before = sent.length;
    await as(admin)
      .post(`/team/projects/${code}/updates/${newest.id}`, {
        body: 'Hotel search started today.',
      })
      .expect(200);
    expect(sent.length).toBe(before);
    const stored = await prisma.projectFile.findFirstOrThrow({
      where: { updateId: withFile.id },
    });
    const onDisk = path.join(
      uploadRoot(process.env.UPLOAD_DIR!),
      stored.storageKey,
    );
    expect(existsSync(onDisk)).toBe(true);
    await as(admin)
      .post(`/team/projects/${code}/updates/${withFile.id}/remove`)
      .expect(200);
    expect(existsSync(onDisk)).toBe(false);
    expect(await audits('project.updateRemoved', code)).toHaveLength(1);
  });
});

describe("the customer's My Projects", () => {
  it('shows only their own projects, view only, never the team notes', async () => {
    const code = await newProject();
    await as(admin)
      .post(`/team/projects/${code}/details`, {
        name: 'Bluewave booking website',
        type: 'TRAVEL_BOOKING_PLATFORM',
        leadId: admin.id,
        teamNotes: NOTES,
      })
      .expect(200);
    const posted = await http()
      .post(`/team/projects/${code}/updates`)
      .set('Cookie', admin.cookie)
      .field('body', 'Designs attached.')
      .attach('files', PNG, 'designs.png')
      .expect(200);
    expect(posted.body.id).toBeDefined();

    const list = await as(customer).get('/portal/projects').expect(200);
    const row = list.body.find((p: { code: string }) => p.code === code);
    expect(row).toMatchObject({
      lead: 'Emma Clarke',
      progress: { done: 0, total: 5, percent: 0 },
    });
    const page = await as(customer).get(`/portal/projects/${code}`).expect(200);
    expect(JSON.stringify(page.body)).not.toContain(NOTES);
    expect(page.body).not.toHaveProperty('teamNotes');
    expect(page.body.lead).toEqual({ name: 'Emma Clarke', jobTitle: 'Tester' });
    const file = page.body.updates[0].files[0];
    const download = await as(customer)
      .get(`/portal/projects/${code}/files/${file.id}`)
      .expect(200);
    expect(download.headers['content-disposition']).toContain('designs.png');
    expect(download.headers['x-content-type-options']).toBe('nosniff');

    // Another customer: not found, for the page and the file.
    await as(other).get(`/portal/projects/${code}`).expect(404);
    await as(other)
      .get(`/portal/projects/${code}/files/${file.id}`)
      .expect(404);
    expect(
      (await as(other).get('/portal/projects').expect(200)).body.map(
        (p: { code: string }) => p.code,
      ),
    ).not.toContain(code);
    // Customers can't change anything.
    await as(customer).post(`/team/projects/${code}/status`, {}).expect(403);
  });
});

describe('delete and restore', () => {
  it('refuses while requests are open, then hides the project and keeps its history', async () => {
    const code = await newProject();
    const projectId = (
      await prisma.project.findUniqueOrThrow({ where: { code } })
    ).id;
    const opened = await http()
      .post('/portal/requests')
      .set('Cookie', customer.cookie)
      .field('projectId', projectId)
      .field('type', 'TECHNICAL_ISSUE')
      .field('priority', 'MEDIUM')
      .field('title', 'Search is slow')
      .field('description', 'Flight search takes a minute.')
      .expect(201);

    await as(manager).post(`/team/projects/${code}/delete`).expect(403);
    const refused = await as(admin)
      .post(`/team/projects/${code}/delete`)
      .expect(409);
    expect(refused.body).toMatchObject({ code: 'HAS_OPEN_REQUESTS', open: 1 });

    await as(admin)
      .post(`/team/requests/${opened.body.code}/close`)
      .expect(200);
    const deleted = await as(admin)
      .post(`/team/projects/${code}/delete`)
      .expect(200);
    expect(deleted.body).toEqual({ forGood: false });

    const stored = await prisma.project.findUniqueOrThrow({ where: { code } });
    expect(stored.name).toBe('Bluewave booking website (deleted)');
    expect(stored.deletedAt).not.toBeNull();
    // Gone from the portal and from New request.
    await as(customer).get(`/portal/projects/${code}`).expect(404);
    expect(
      (await as(customer).get('/portal/projects').expect(200)).body.map(
        (p: { code: string }) => p.code,
      ),
    ).not.toContain(code);
    await http()
      .post('/portal/requests')
      .set('Cookie', customer.cookie)
      .field('projectId', projectId)
      .field('type', 'TECHNICAL_ISSUE')
      .field('priority', 'MEDIUM')
      .field('title', 'Another one')
      .field('description', 'On the deleted project.')
      .expect(404);
    // On the Deleted tab only; the team page stays readable, not editable.
    const active = await as(admin).get(`/team/projects?q=${code}`).expect(200);
    expect(active.body.total).toBe(0);
    const tab = await as(admin)
      .get(`/team/projects?status=deleted&q=${code}`)
      .expect(200);
    expect(tab.body.rows[0]).toMatchObject({ code });
    const page = await as(admin).get(`/team/projects/${code}`).expect(200);
    expect(page.body.can.manage).toBe(false);
    await as(admin)
      .post(`/team/projects/${code}/items`, {
        moduleId: stored.id,
        lines: 'More',
      })
      .expect(404);

    await as(admin).post(`/team/projects/${code}/restore`).expect(200);
    const back = await prisma.project.findUniqueOrThrow({ where: { code } });
    expect(back).toMatchObject({
      name: 'Bluewave booking website',
      deletedAt: null,
    });
    await as(customer).get(`/portal/projects/${code}`).expect(200);
    expect(await audits('project.deleted', code)).toHaveLength(1);
    expect(await audits('project.restored', code)).toHaveLength(1);
  });

  it('removes a project with no requests, updates, modules or topics for good', async () => {
    const code = await newProject({ items: '' });
    const deleted = await as(superAdmin)
      .post(`/team/projects/${code}/delete`)
      .expect(200);
    expect(deleted.body).toEqual({ forGood: true });
    expect(await prisma.project.findUnique({ where: { code } })).toBeNull();
    expect(
      await prisma.projectItem.count({ where: { project: { code } } }),
    ).toBe(0);
    await as(admin).get(`/team/projects/${code}`).expect(404);
  });
});
