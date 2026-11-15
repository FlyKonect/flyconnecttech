import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
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
import { RequestEventsService } from '../../src/requests/request-events.service.js';
import { uploadTempDir } from '../../src/uploads/file-storage.service.js';

// The client portal on a real database (docs/01, section 4): requests,
// files, statuses, notifications, profile and password. Emails are caught.

const DOMAIN = '@portal.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const sent: OutgoingEmail[] = [];

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('a small test picture'),
]);
const EXE = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

function lastLink(to: string) {
  const email = [...sent].reverse().find((item) => item.to === to);
  const match = JSON.stringify(email?.template.props).match(
    /\/invite\/([A-Za-z0-9_-]{43})/,
  );
  if (!match) throw new Error(`No invitation for ${to}`);
  return match[1];
}

function cookieFrom(response: request.Response): string {
  const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) throw new Error('No cookie was set.');
  return raw.map((cookie) => cookie.split(';')[0]).join('; ');
}

function signIn(email: string, password = PASSWORD) {
  return http()
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email, password });
}

type Person = { id: string; email: string; name: string; cookie: string };

async function person(role: Role, company?: string): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const name = role === 'CUSTOMER' ? 'Sarah Mitchell' : `Test ${role}`;
  const { userId } = await invitations.inviteUser(
    { name, email, role, company },
    null,
  );
  await http()
    .post(`/accounts/invitations/${lastLink(email)}/accept`)
    .send({ name, password: PASSWORD })
    .expect(200);
  const signedIn = await signIn(email).expect(200);
  return { id: userId, email, name, cookie: cookieFrom(signedIn) };
}

async function projectFor(userId: string, name: string) {
  const { customerId } = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  return prisma.$transaction(async (tx) =>
    tx.project.create({
      data: {
        code: await nextCode(tx, 'project'),
        name,
        type: 'TRAVEL_BOOKING_PLATFORM',
        status: 'LIVE',
        customerId: customerId!,
      },
    }),
  );
}

/** Sends a new request as this customer. */
function sendRequest(
  who: Person,
  projectId: string,
  extra: { priority?: string; files?: [Buffer, string][] } = {},
) {
  const call = http()
    .post('/portal/requests')
    .set('Cookie', who.cookie)
    .field('projectId', projectId)
    .field('type', 'BUG_REPORT')
    .field('priority', extra.priority ?? 'HIGH')
    .field('title', 'Agent commission report shows wrong totals')
    .field(
      'description',
      'Since the October update, the commission report shows totals about 8% higher.',
    )
    .field('url', 'agents.bluewaveholidays.co.uk/reports');
  for (const [content, name] of extra.files ?? []) {
    call.attach('files', content, name);
  }
  return call;
}

const statusOf = async (code: string) =>
  (await prisma.supportRequest.findUniqueOrThrow({ where: { code } })).status;

const setStatus = (code: string, status: 'WAITING_FOR_CUSTOMER' | 'RESOLVED') =>
  prisma.supportRequest.update({
    where: { code },
    data: {
      status,
      slaPausedAt: status === 'WAITING_FOR_CUSTOMER' ? new Date() : null,
    },
  });

let sarah: Person;
let other: Person;
let admin: Person;
let sarahProject: { id: string; name: string };
let otherProject: { id: string };

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

  // Leftovers from an earlier run.
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

  sarah = await person('CUSTOMER', 'Bluewave Holidays');
  other = await person('CUSTOMER', 'Skyline Travel');
  admin = await person('ADMIN');
  sarahProject = await projectFor(sarah.id, 'Bluewave agent portal');
  otherProject = await projectFor(other.id, 'Skyline booking website');
});

afterAll(async () => {
  await app?.close();
});

describe('a new request', () => {
  it('is saved with its file, a due time and its history; the customer gets a copy', async () => {
    const response = await sendRequest(sarah, sarahProject.id, {
      files: [[PNG, 'report-totals.png']],
    }).expect(201);
    const code = response.body.code as string;
    expect(code).toMatch(/^TKT-\d{4}-\d{5}$/);

    const saved = await prisma.supportRequest.findUniqueOrThrow({
      where: { code },
      include: { attachments: true, statusChanges: true },
    });
    expect(saved.status).toBe('SUBMITTED');
    // High: 4 hours.
    expect(saved.dueAt!.getTime() - saved.createdAt.getTime()).toBe(
      4 * 60 * 60 * 1000,
    );
    expect(saved.statusChanges).toMatchObject([
      { from: null, to: 'SUBMITTED', byId: sarah.id },
    ]);
    expect(saved.attachments).toMatchObject([
      {
        fileName: 'report-totals.png',
        contentType: 'image/png',
        size: PNG.length,
      },
    ]);
    const stored = path.join(
      process.env.UPLOAD_DIR!,
      saved.attachments[0].storageKey,
    );
    expect(await readFile(stored)).toEqual(PNG);

    const copy = sent.find(
      (email) =>
        email.to === sarah.email &&
        email.subject === `We received your request ${code}`,
    );
    expect(copy?.template.props).toMatchObject({
      firstName: 'Sarah',
      code,
      projectName: 'Bluewave agent portal',
      typeLabel: 'Bug Report',
      priorityLabel: 'High',
      fileCount: 1,
    });

    const notifications = await prisma.notification.findMany({
      where: { text: { contains: code } },
    });
    // The customer gets no notice about their own request.
    expect(notifications.filter((n) => n.userId === sarah.id)).toEqual([]);
    expect(notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: admin.id,
          kind: 'new',
          text: `New support request ${code} · High`,
          href: `/team/requests/${code}`,
        }),
      ]),
    );
  });

  it('an Urgent request reaches the team as urgent', async () => {
    const { body } = await sendRequest(sarah, sarahProject.id, {
      priority: 'URGENT',
    }).expect(201);
    const note = await prisma.notification.findFirstOrThrow({
      where: { userId: admin.id, text: { contains: body.code } },
    });
    expect(note.kind).toBe('urgent');
  });

  it("can't be about another customer's project", async () => {
    const before = await prisma.supportRequest.count();
    const response = await sendRequest(sarah, otherProject.id).expect(404);
    expect(response.body.code).toBe('PROJECT_NOT_FOUND');
    expect(await prisma.supportRequest.count()).toBe(before);
  });

  it('refuses a program renamed as a picture, and keeps no file', async () => {
    const before = await prisma.supportRequest.count();
    const response = await sendRequest(sarah, sarahProject.id, {
      files: [[EXE, 'photo.png']],
    }).expect(400);
    expect(response.body.code).toBe('FILE_NOT_ACCEPTED');
    expect(await prisma.supportRequest.count()).toBe(before);
    const leftovers = await readdir(
      uploadTempDir(process.env.UPLOAD_DIR!),
    ).catch(() => []);
    expect(leftovers).toEqual([]);
  });

  it('needs a title and a description', async () => {
    await http()
      .post('/portal/requests')
      .set('Cookie', sarah.cookie)
      .field('projectId', sarahProject.id)
      .field('type', 'BUG_REPORT')
      .field('priority', 'LOW')
      .field('title', ' ')
      .field('description', '')
      .expect(400);
  });
});

describe("another customer's request", () => {
  let code: string;
  let fileId: string;

  beforeAll(async () => {
    const { body } = await sendRequest(sarah, sarahProject.id, {
      files: [[PNG, 'private.png']],
    }).expect(201);
    code = body.code;
    fileId = (
      await prisma.attachment.findFirstOrThrow({
        where: { request: { code } },
      })
    ).id;
  });

  it('is "not found" for reading, replying, the buttons and the file', async () => {
    const as = (call: request.Test) => call.set('Cookie', other.cookie);
    await as(http().get(`/portal/requests/${code}`)).expect(404);
    await as(
      http().post(`/portal/requests/${code}/replies`).send({ body: 'Hi' }),
    ).expect(404);
    await as(http().post(`/portal/requests/${code}/close`)).expect(404);
    await as(http().get(`/portal/requests/${code}/files/${fileId}`)).expect(
      404,
    );
    const list = await as(http().get('/portal/requests')).expect(200);
    expect(JSON.stringify(list.body)).not.toContain(code);
    expect(await statusOf(code)).toBe('SUBMITTED');
  });

  it('its owner can download the file, as a download', async () => {
    const response = await http()
      .get(`/portal/requests/${code}/files/${fileId}`)
      .set('Cookie', sarah.cookie)
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(response.headers['content-type']).toBe('image/png');
    expect(response.headers['content-disposition']).toContain('attachment;');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.body).toEqual(PNG);
  });

  it('team members are kept out of the portal routes', async () => {
    const response = await http()
      .get('/portal/requests')
      .set('Cookie', admin.cookie);
    expect(response.status).toBe(403);
  });
});

describe('the conversation', () => {
  let code: string;
  let requestId: string;

  beforeAll(async () => {
    const { body } = await sendRequest(sarah, sarahProject.id).expect(201);
    code = body.code;
    requestId = (
      await prisma.supportRequest.findUniqueOrThrow({ where: { code } })
    ).id;
  });

  it('never shows internal notes or their files to the customer', async () => {
    await prisma.requestMessage.create({
      data: {
        requestId,
        authorId: admin.id,
        kind: 'STAFF_REPLY',
        body: 'Thanks Sarah. We are looking at it.',
      },
    });
    const note = await prisma.requestMessage.create({
      data: {
        requestId,
        authorId: admin.id,
        kind: 'INTERNAL_NOTE',
        body: 'SECRET: the supplier contract ends in March',
      },
    });
    const noteFile = await prisma.attachment.create({
      data: {
        requestId,
        messageId: note.id,
        fileName: 'internal-logs.txt',
        contentType: 'text/plain',
        size: 10,
        storageKey: `requests/${requestId}/internal-${Date.now()}`,
        uploadedById: admin.id,
      },
    });

    const { body } = await http()
      .get(`/portal/requests/${code}`)
      .set('Cookie', sarah.cookie)
      .expect(200);
    const everything = JSON.stringify(body);
    expect(everything).not.toContain('SECRET');
    expect(everything).not.toContain('internal-logs.txt');
    expect(body.messages).toEqual([
      expect.objectContaining({
        kind: 'STAFF_REPLY',
        author: { name: admin.name, you: false },
      }),
    ]);
    await http()
      .get(`/portal/requests/${code}/files/${noteFile.id}`)
      .set('Cookie', sarah.cookie)
      .expect(404);
  });

  it('a reply while waiting moves the request back to In Progress', async () => {
    await setStatus(code, 'WAITING_FOR_CUSTOMER');
    const before = await prisma.supportRequest.findUniqueOrThrow({
      where: { code },
    });

    await http()
      .post(`/portal/requests/${code}/replies`)
      .set('Cookie', sarah.cookie)
      .field('body', 'Here is the booking reference: BW-58213.')
      .attach('files', PNG, 'booking.png')
      .expect(201);

    const after = await prisma.supportRequest.findUniqueOrThrow({
      where: { code },
      include: { statusChanges: true },
    });
    expect(after.status).toBe('IN_PROGRESS');
    expect(after.slaPausedAt).toBeNull();
    expect(after.dueAt!.getTime()).toBeGreaterThanOrEqual(
      before.dueAt!.getTime(),
    );
    expect(after.statusChanges.at(-1)).toMatchObject({
      from: 'WAITING_FOR_CUSTOMER',
      to: 'IN_PROGRESS',
      byId: sarah.id,
    });

    const { body } = await http()
      .get(`/portal/requests/${code}`)
      .set('Cookie', sarah.cookie)
      .expect(200);
    const last = body.messages.slice(-2);
    expect(last[0]).toMatchObject({
      kind: 'CUSTOMER_REPLY',
      body: 'Here is the booking reference: BW-58213.',
      author: { name: sarah.name, you: true },
    });
    expect(last[1]).toMatchObject({
      kind: 'SYSTEM',
      body: 'Status changed to In Progress after the customer replied',
    });
    const replyFile = body.files.find(
      (file: { fileName: string }) => file.fileName === 'booking.png',
    );
    expect(replyFile.messageId).toBe(last[0].id);

    // Nobody is assigned, so the admins hear about it.
    const told = await prisma.notification.findFirst({
      where: { userId: admin.id, text: `Sarah Mitchell replied on ${code}` },
    });
    expect(told).not.toBeNull();
  });

  it('an empty reply with no file is refused', async () => {
    await http()
      .post(`/portal/requests/${code}/replies`)
      .set('Cookie', sarah.cookie)
      .field('body', '   ')
      .expect(400);
  });
});

describe("the customer's buttons", () => {
  it('close, reopen, confirm and "I still need help" work only from the right statuses', async () => {
    const { body } = await sendRequest(sarah, sarahProject.id).expect(201);
    const code = body.code as string;
    const press = (action: string) =>
      http()
        .post(`/portal/requests/${code}/${action}`)
        .set('Cookie', sarah.cookie);

    await press('confirm').expect(409);
    await press('reopen').expect(409);

    await press('close').expect(200);
    expect(await statusOf(code)).toBe('CLOSED');
    await press('close').expect(409);

    await press('reopen').expect(200);
    expect(await statusOf(code)).toBe('IN_PROGRESS');

    await setStatus(code, 'RESOLVED');
    await press('reopen').expect(200); // "I still need help"
    expect(await statusOf(code)).toBe('IN_PROGRESS');

    await setStatus(code, 'RESOLVED');
    await press('confirm').expect(200);
    expect(await statusOf(code)).toBe('CLOSED');

    const detail = await http()
      .get(`/portal/requests/${code}`)
      .set('Cookie', sarah.cookie)
      .expect(200);
    expect(detail.body.actions).toEqual(['reopen']);
    expect(
      detail.body.messages
        .filter((m: { kind: string }) => m.kind === 'SYSTEM')
        .map((m: { body: string }) => m.body),
    ).toEqual([
      'Sarah Mitchell closed this request',
      'Sarah Mitchell requested further assistance. Request reopened.',
      'Sarah Mitchell requested further assistance. Request reopened.',
      'Sarah Mitchell confirmed the resolution. Request closed.',
    ]);
    expect(
      detail.body.history.map((h: { status: string }) => h.status),
    ).toEqual(['SUBMITTED', 'CLOSED', 'IN_PROGRESS', 'IN_PROGRESS', 'CLOSED']);
  });
});

describe('My requests and the Overview numbers', () => {
  beforeAll(async () => {
    // Sending a request gives the customer no notice; the team's actions do.
    // Two notices as a team reply would leave them.
    await prisma.notification.createMany({
      data: ['TKT-TEST-1', 'TKT-TEST-2'].map((code) => ({
        userId: sarah.id,
        kind: 'reply' as const,
        text: `Emma Clarke replied to ${code}`,
        href: `/portal/requests/${code}`,
      })),
    });
  });

  it('counts each tab and searches by code or title', async () => {
    const { body } = await http()
      .get('/portal/requests?tab=open')
      .set('Cookie', sarah.cookie)
      .expect(200);
    const total = await prisma.supportRequest.count({
      where: { project: { id: sarahProject.id } },
    });
    expect(body.tabs.all).toBe(total);
    expect(
      body.rows.every((row: { status: string }) =>
        ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'].includes(row.status),
      ),
    ).toBe(true);
    expect(body.rows[0]).toMatchObject({
      project: { name: 'Bluewave agent portal' },
      assignee: null,
    });

    const code = body.rows[0].code as string;
    const found = await http()
      .get(`/portal/requests?q=${code}`)
      .set('Cookie', sarah.cookie)
      .expect(200);
    expect(found.body.rows.map((r: { code: string }) => r.code)).toEqual([
      code,
    ]);

    const summary = await http()
      .get('/portal/summary')
      .set('Cookie', sarah.cookie)
      .expect(200);
    expect(summary.body.requests.total).toBe(total);
    expect(summary.body.unreadNotifications).toBeGreaterThan(0);
  });

  it('notifications: list, read one, mark all as read, only your own', async () => {
    const list = await http()
      .get('/notifications')
      .set('Cookie', sarah.cookie)
      .expect(200);
    const first = list.body.items[0];
    expect(first.read).toBe(false);

    // Someone else can't mark it read.
    await http()
      .post(`/notifications/${first.id}/read`)
      .set('Cookie', other.cookie)
      .expect(200);
    expect(
      (await prisma.notification.findUniqueOrThrow({ where: { id: first.id } }))
        .readAt,
    ).toBeNull();

    await http()
      .post(`/notifications/${first.id}/read`)
      .set('Cookie', sarah.cookie)
      .expect(200);
    await http()
      .post('/notifications/read-all')
      .set('Cookie', sarah.cookie)
      .expect(200);
    const after = await http()
      .get('/notifications')
      .set('Cookie', sarah.cookie)
      .expect(200);
    expect(after.body.unread).toBe(0);
  });
});

describe("the team's emails to the customer follow the customer's choices", () => {
  it('replies and status changes are emailed only when wanted', async () => {
    const { body } = await sendRequest(sarah, sarahProject.id).expect(201);
    const saved = await prisma.supportRequest.findUniqueOrThrow({
      where: { code: body.code },
    });
    const events = app.get(RequestEventsService);

    expect(await events.emailTeamReply(saved, 'Daniyal Ahmed', 'Fixed?')).toBe(
      true,
    );
    expect(await events.emailStatusChanged(saved, 'RESOLVED')).toBe(true);
    const resolved = sent.at(-1)!;
    expect(resolved.subject).toBe(
      `${body.code} was resolved. Please confirm the fix.`,
    );

    await http()
      .patch('/portal/profile')
      .set('Cookie', sarah.cookie)
      .send({
        name: 'Sarah Mitchell',
        timezone: 'Europe/London',
        emailPrefs: {
          replies: false,
          statusChanges: false,
          weeklySummary: false,
        },
      })
      .expect(200);
    expect(await events.emailTeamReply(saved, 'Daniyal Ahmed', 'Hi')).toBe(
      false,
    );
    expect(await events.emailStatusChanged(saved, 'CLOSED')).toBe(false);
  });
});

describe('profile and password', () => {
  it('updates name, phone, country, time zone and choices, but never company or email', async () => {
    const { body } = await http()
      .patch('/portal/profile')
      .set('Cookie', sarah.cookie)
      .send({
        name: 'Sarah J. Mitchell',
        phone: '+44 20 7946 0321',
        country: 'United Kingdom',
        timezone: 'Asia/Karachi',
        emailPrefs: {
          replies: true,
          statusChanges: false,
          weeklySummary: true,
        },
        email: 'hacker@example.com',
        company: 'Someone Else Ltd',
      })
      .expect(200);
    expect(body).toMatchObject({
      name: 'Sarah J. Mitchell',
      email: sarah.email,
      company: 'Bluewave Holidays',
      timezone: 'Asia/Karachi',
      emailPrefs: { replies: true, statusChanges: false, weeklySummary: true },
    });

    await http()
      .patch('/portal/profile')
      .set('Cookie', sarah.cookie)
      .send({
        name: 'Sarah Mitchell',
        timezone: 'Mars/Olympus',
        emailPrefs: {
          replies: true,
          statusChanges: true,
          weeklySummary: false,
        },
      })
      .expect(400);
  });

  it('changes the password with the rules, and signs out other devices', async () => {
    const customer = await person('CUSTOMER', 'Password Test Ltd');
    const otherDevice = cookieFrom(await signIn(customer.email).expect(200));
    const change = (currentPassword: string, newPassword: string) =>
      http()
        .post('/me/password')
        .set('Cookie', customer.cookie)
        .send({ currentPassword, newPassword });

    expect(
      (await change('Not-the-password-1', 'Harbour-Light-9').expect(400)).body
        .code,
    ).toBe('WRONG_PASSWORD');
    await change(PASSWORD, 'short').expect(400);
    await change(PASSWORD, 'Harbour-Light-9').expect(200);

    await signIn(customer.email, PASSWORD).expect(401);
    await signIn(customer.email, 'Harbour-Light-9').expect(200);
    await http().get('/me').set('Cookie', customer.cookie).expect(200);
    await http().get('/me').set('Cookie', otherDevice).expect(401);
  });

  it("Better Auth's own password change is switched off", async () => {
    const response = await http()
      .post('/api/auth/change-password')
      .set('Origin', ORIGIN)
      .set('Cookie', sarah.cookie)
      .send({ currentPassword: PASSWORD, newPassword: 'aaaaaaaa' });
    expect(response.status).toBe(404);
  });
});
