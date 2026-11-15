import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { hashPassword } from 'better-auth/crypto';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { nextCode } from '../../src/codes/readable-codes.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../src/email/email.service.js';
import type {
  Prisma,
  RequestStatus,
  Role,
} from '../../src/generated/prisma/client.js';
import { AUTO_CLOSE_LINE, JobsService } from '../../src/jobs/jobs.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { defaultSettings } from '../../src/settings/defaults.js';

// The scheduled jobs on a real database (docs/01 §5 Settings and §7): the
// daily digest, auto-close after 7 days and the customer's weekly summary.

const DOMAIN = '@jobs.test';
const DAY = 24 * 60 * 60 * 1000;
const sent: OutgoingEmail[] = [];

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;
let jobs: JobsService;

let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

type Person = { id: string; email: string };
type Customer = Person & { customerId: string; projectId: string };

/** An active account, activated from its invitation. */
async function person(role: Role, name: string): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const { userId } = await invitations.inviteUser(
    { name, email, role, jobTitle: 'Tester' },
    null,
  );
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'ACTIVE' },
  });
  return { id: userId, email };
}

async function customer(
  name: string,
  company: string,
  prefs: { statusChanges?: boolean; weeklySummary?: boolean },
): Promise<Customer> {
  const email = uniqueEmail('customer');
  const { userId, customerId } = await invitations.inviteUser(
    { name, email, role: 'CUSTOMER', company },
    null,
  );
  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'ACTIVE',
      emailPrefs: {
        replies: true,
        statusChanges: true,
        weeklySummary: false,
        ...prefs,
      },
    },
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
  return { id: userId, email, customerId: customerId!, projectId: project.id };
}

/** A request made straight in the database, with the times a test needs. */
function makeRequest(
  owner: Customer,
  status: RequestStatus,
  extra: Partial<Prisma.SupportRequestUncheckedCreateInput> = {},
) {
  return prisma.$transaction(async (tx) =>
    tx.supportRequest.create({
      data: {
        code: await nextCode(tx, 'request'),
        title: `A ${status.toLowerCase()} request`,
        description: 'Made by the jobs test.',
        type: 'TECHNICAL_ISSUE',
        priority: 'MEDIUM',
        status,
        customerId: owner.customerId,
        projectId: owner.projectId,
        ...extra,
      },
    }),
  );
}

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

const emailsTo = (who: Person) => sent.filter((e) => e.to === who.email);
type Rows = { code: string }[];
const codesIn = (email: OutgoingEmail | undefined, list: string) => {
  const props = (email?.template.props ?? {}) as Record<string, Rows>;
  return (props[list] ?? []).map((row) => row.code);
};

let superAdmin: Person;
let admin: Person;
let manager: Person;
let developer: Person;
let sarah: Customer;
let tom: Customer;
let quiet: Customer;

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
  jobs = app.get(JobsService);

  // Other files' people would get the digest too: put them aside.
  await prisma.user.updateMany({
    where: {
      role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      status: 'ACTIVE',
    },
    data: { status: 'DISABLED' },
  });

  superAdmin = await person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
  developer = await person('DEVELOPER', 'Daniyal Ahmed');
  sarah = await customer('Sarah Mitchell', 'Bluewave Holidays', {
    weeklySummary: true,
  });
  tom = await customer('Tom Becker', 'Meridian Freight', {
    statusChanges: false,
  });
  quiet = await customer('Lina Haddad', 'Atlas Outdoor', {
    weeklySummary: true,
  });
});

beforeEach(() => {
  sent.length = 0;
});

afterAll(async () => {
  await setTeamNotifications({});
  await app?.close();
});

describe('the daily digest', () => {
  it('lists the requests waiting for review, for super admins, admins and managers', async () => {
    await setTeamNotifications({ dailyDigest: true });
    // Only this test's requests are waiting.
    await prisma.supportRequest.updateMany({
      where: { status: 'SUBMITTED' },
      data: { status: 'CLOSED' },
    });
    const now = new Date();
    const older = await makeRequest(sarah, 'SUBMITTED', {
      createdAt: new Date(now.getTime() - 2 * DAY),
      dueAt: new Date(now.getTime() - DAY),
    });
    const newer = await makeRequest(tom, 'SUBMITTED', {
      createdAt: new Date(now.getTime() - 3 * 3_600_000),
    });
    await makeRequest(sarah, 'IN_PROGRESS');

    const result = await jobs.dailyDigest(now);
    expect(result.done).toBe('sent to 3 of 3 people, 2 waiting');
    for (const who of [superAdmin, admin, manager]) {
      const [email] = emailsTo(who);
      expect(email.subject).toBe('2 requests waiting for review');
      // Oldest first.
      expect(codesIn(email, 'rows')).toEqual([older.code, newer.code]);
      const [first] = (
        email.template.props as { rows: Record<string, string>[] }
      ).rows;
      expect(first).toMatchObject({
        company: 'Bluewave Holidays',
        priority: 'Medium',
        waiting: 'Waiting 2 days',
        due: 'Overdue',
      });
    }
    expect(emailsTo(developer)).toHaveLength(0);
  });

  it('sends nothing when none are waiting, or when it is switched off', async () => {
    await setTeamNotifications({ dailyDigest: true });
    await prisma.supportRequest.updateMany({
      where: { status: 'SUBMITTED' },
      data: { status: 'CLOSED' },
    });
    expect((await jobs.dailyDigest()).done).toBe(
      'no requests are waiting for review',
    );
    await makeRequest(sarah, 'SUBMITTED');
    await setTeamNotifications({ dailyDigest: false });
    expect((await jobs.dailyDigest()).done).toBe(
      'the daily digest is switched off',
    );
    expect(sent).toHaveLength(0);
  });
});

describe('auto-close after 7 days', () => {
  it('does nothing while the setting is off', async () => {
    await setTeamNotifications({ autoCloseResolvedAfter7Days: false });
    const old = await makeRequest(sarah, 'RESOLVED', {
      resolvedAt: new Date(Date.now() - 8 * DAY),
    });
    expect((await jobs.autoClose()).done).toBe('auto-close is switched off');
    expect(
      (await prisma.supportRequest.findUniqueOrThrow({ where: { id: old.id } }))
        .status,
    ).toBe('RESOLVED');
  });

  it('closes requests resolved 7 days ago, tells the customer, and leaves newer ones', async () => {
    await setTeamNotifications({ autoCloseResolvedAfter7Days: true });
    const now = new Date();
    const old = await makeRequest(sarah, 'RESOLVED', {
      resolvedAt: new Date(now.getTime() - 8 * DAY),
    });
    const recent = await makeRequest(sarah, 'RESOLVED', {
      resolvedAt: new Date(now.getTime() - 6 * DAY),
    });
    const tomsOld = await makeRequest(tom, 'RESOLVED', {
      resolvedAt: new Date(now.getTime() - 9 * DAY),
    });

    await jobs.autoClose(now);

    const closed = await prisma.supportRequest.findUniqueOrThrow({
      where: { id: old.id },
      include: { messages: true, statusChanges: true },
    });
    expect(closed.status).toBe('CLOSED');
    expect(closed.closedAt).toBeTruthy();
    expect(closed.messages.map((m) => [m.kind, m.body])).toContainEqual([
      'SYSTEM',
      AUTO_CLOSE_LINE,
    ]);
    expect(closed.statusChanges).toEqual([
      expect.objectContaining({ from: 'RESOLVED', to: 'CLOSED', byId: null }),
    ]);
    expect(
      await prisma.notification.count({
        where: {
          userId: sarah.id,
          kind: 'closed',
          text: `${old.code} was closed`,
        },
      }),
    ).toBe(1);
    // (The previous test's old request closes too, now the setting is on.)
    expect(emailsTo(sarah).map((e) => e.subject)).toContain(
      `${old.code} was closed`,
    );

    expect(
      (
        await prisma.supportRequest.findUniqueOrThrow({
          where: { id: recent.id },
        })
      ).status,
    ).toBe('RESOLVED');
    // Tom doesn't want status emails: closed, in the app only.
    expect(
      (
        await prisma.supportRequest.findUniqueOrThrow({
          where: { id: tomsOld.id },
        })
      ).status,
    ).toBe('CLOSED');
    expect(emailsTo(tom)).toHaveLength(0);

    // Running again changes nothing for these.
    sent.length = 0;
    await jobs.autoClose(now);
    expect(emailsTo(sarah)).toHaveLength(0);
  });
});

describe('the weekly summary', () => {
  it('goes only to customers who asked, with their own open and finished requests', async () => {
    const now = new Date();
    const open = await makeRequest(sarah, 'IN_PROGRESS');
    const finished = await makeRequest(sarah, 'CLOSED', {
      closedAt: new Date(now.getTime() - 2 * DAY),
    });
    const longAgo = await makeRequest(sarah, 'CLOSED', {
      closedAt: new Date(now.getTime() - 10 * DAY),
    });
    const toms = await makeRequest(tom, 'IN_PROGRESS');

    await jobs.weeklySummary(now);

    const [email] = emailsTo(sarah);
    expect(email.subject).toBe('Your weekly support summary');
    expect(codesIn(email, 'open')).toContain(open.code);
    expect(codesIn(email, 'finished')).toContain(finished.code);
    expect(codesIn(email, 'finished')).not.toContain(longAgo.code);
    expect([
      ...codesIn(email, 'open'),
      ...codesIn(email, 'finished'),
    ]).not.toContain(toms.code);
    // Tom didn't ask; Lina asked but has nothing to report.
    expect(emailsTo(tom)).toHaveLength(0);
    expect(emailsTo(quiet)).toHaveLength(0);
  });
});

describe('who hears about a customer reply', () => {
  it('the admins in the app, when nobody is assigned', async () => {
    const http = request(app.getHttpServer());
    // Sarah signs in, and replies on her request waiting for her.
    await prisma.account.create({
      data: {
        userId: sarah.id,
        accountId: sarah.id,
        providerId: 'credential',
        password: await hashPassword('Skyline-2027'),
      },
    });
    const signedIn = await http
      .post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3001')
      .send({ email: sarah.email, password: 'Skyline-2027' })
      .expect(200);
    const cookie = (signedIn.headers['set-cookie'] as unknown as string[])
      .map((c) => c.split(';')[0])
      .join('; ');
    const waiting = await makeRequest(sarah, 'WAITING_FOR_CUSTOMER');
    await http
      .post(`/portal/requests/${waiting.code}/replies`)
      .set('Cookie', cookie)
      .field('body', 'Here is the screenshot you asked for.')
      .expect(201);
    for (const who of [superAdmin, admin]) {
      expect(
        await prisma.notification.count({
          where: {
            userId: who.id,
            kind: 'reply',
            href: `/team/requests/${waiting.code}`,
          },
        }),
      ).toBe(1);
    }
    expect(
      await prisma.notification.count({
        where: { userId: manager.id, href: `/team/requests/${waiting.code}` },
      }),
    ).toBe(0);
  });
});
