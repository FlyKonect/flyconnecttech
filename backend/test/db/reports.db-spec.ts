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
import type { Prisma, Role } from '../../src/generated/prisma/client.js';
import { defaultSettings } from '../../src/settings/defaults.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { ReportsService } from '../../src/reports/reports.service.js';
import { secretFromUri, totp } from '../totp.js';

// Reports & Analytics and Settings on a real database (docs/01 §5,
// screens 31 and 33): every number from known requests, who may see what,
// and saving the settings changes the next request's SLA due time.

const DOMAIN = '@reports.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const sent: OutgoingEmail[] = [];

let app: NestExpressApplication;
let prisma: PrismaService;
let invitations: InvitationsService;
let reports: ReportsService;

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

function cookieFrom(response: request.Response): string {
  const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) throw new Error('No cookie was set.');
  return raw.map((cookie) => cookie.split(';')[0]).join('; ');
}

type Person = { id: string; email: string; cookie: string };

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
  return { id: userId, email, cookie };
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
let customerId: string;
let busyProject: string;
let quietProject: string;

const at = (iso: string) => new Date(iso);

function makeRequest(
  extra: Partial<Prisma.SupportRequestUncheckedCreateInput>,
  projectId = busyProject,
) {
  return prisma.$transaction(async (tx) =>
    tx.supportRequest.create({
      data: {
        code: await nextCode(tx, 'request'),
        title: 'A request for the reports',
        description: 'Made by the reports test.',
        type: 'TECHNICAL_ISSUE',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        customerId,
        projectId,
        ...extra,
      },
    }),
  );
}

async function project(name: string) {
  return (
    await prisma.$transaction(async (tx) =>
      tx.project.create({
        data: {
          code: await nextCode(tx, 'project'),
          name,
          type: 'WEBSITE',
          customerId,
        },
      }),
    )
  ).id;
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
  reports = app.get(ReportsService);

  // The reports count everything: start from no requests, and only this
  // file's developers and admins.
  await prisma.supportRequest.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.updateMany({
    where: {
      role: { in: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DEVELOPER'] },
      status: 'ACTIVE',
    },
    data: { status: 'DISABLED' },
  });

  superAdmin = await person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
  developer = await person('DEVELOPER', 'Daniyal Ahmed');
  customer = await person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
  customerId = (
    await prisma.user.findUniqueOrThrow({
      where: { id: customer.id },
    })
  ).customerId!;
  busyProject = await project('Bluewave booking website');
  quietProject = await project('Bluewave agent portal');
});

afterAll(async () => {
  // Back to the defaults for the other test files.
  await prisma?.setting.deleteMany({});
  await app?.close();
});

describe('Reports & Analytics', () => {
  // Wednesday 18 November 2026; last month is October.
  const now = at('2026-11-18T12:00:00Z');

  it('works every card, chart and row out from the requests', async () => {
    const dev = { assigneeId: developer.id };
    // First replies: 60 and 120 minutes this month, 120 last month.
    await makeRequest({
      ...dev,
      createdAt: at('2026-11-02T09:00:00Z'),
      firstResponseAt: at('2026-11-02T10:00:00Z'),
    });
    await makeRequest({
      ...dev,
      createdAt: at('2026-11-03T09:00:00Z'),
      firstResponseAt: at('2026-11-03T11:00:00Z'),
    });
    await makeRequest({
      createdAt: at('2026-10-05T09:00:00Z'),
      firstResponseAt: at('2026-10-05T11:00:00Z'),
    });
    // Resolved: 2 and 3 days this month, 3 days last month.
    const reopened = await makeRequest({
      ...dev,
      status: 'RESOLVED',
      createdAt: at('2026-11-01T00:00:00Z'),
      resolvedAt: at('2026-11-03T00:00:00Z'),
    });
    await makeRequest({
      ...dev,
      status: 'RESOLVED',
      createdAt: at('2026-11-04T00:00:00Z'),
      resolvedAt: at('2026-11-07T00:00:00Z'),
    });
    await makeRequest({
      status: 'CLOSED',
      createdAt: at('2026-10-01T00:00:00Z'),
      resolvedAt: at('2026-10-04T00:00:00Z'),
    });
    // Reopened once this month.
    await prisma.requestStatusChange.create({
      data: {
        requestId: reopened.id,
        from: 'RESOLVED',
        to: 'IN_PROGRESS',
        createdAt: at('2026-11-10T10:00:00Z'),
      },
    });
    // This week: 2 on Monday, 1 on Tuesday, 3 on Wednesday (one on the
    // quieter project).
    for (const day of ['16', '16', '17', '18', '18']) {
      await makeRequest({ createdAt: at(`2026-11-${day}T10:00:00Z`) });
    }
    await makeRequest({ createdAt: at('2026-11-18T08:00:00Z') }, quietProject);

    const report = await reports.report({}, now);
    expect(report.cards).toEqual([
      {
        label: 'Avg. first response',
        value: '1h 30m',
        change: { text: '25% faster than October', tone: 'better' },
        note: null,
      },
      {
        label: 'Avg. resolution time',
        value: '2.5 days',
        change: { text: '0.5 days faster', tone: 'better' },
        note: null,
      },
      {
        label: 'Resolved this month',
        value: '2',
        change: { text: '+1 vs last month', tone: 'better' },
        note: null,
      },
      {
        label: 'Reopened requests',
        value: '1',
        change: { text: '50% of resolved', tone: 'better' },
        note: null,
      },
    ]);
    expect(report.week).toEqual([
      { day: 'Mon', count: 2 },
      { day: 'Tue', count: 1 },
      { day: 'Wed', count: 3 },
      { day: 'Thu', count: 0 },
      { day: 'Fri', count: 0 },
      { day: 'Sat', count: 0 },
      { day: 'Sun', count: 0 },
    ]);
    expect(report.projects).toEqual([
      { id: busyProject, name: 'Bluewave booking website', count: 11 },
      { id: quietProject, name: 'Bluewave agent portal', count: 1 },
    ]);
    expect(report.developers).toEqual([
      expect.objectContaining({
        id: developer.id,
        name: 'Daniyal Ahmed',
        jobTitle: 'Tester',
        assigned: 4,
        resolved: 2,
        firstResponse: '1h 30m',
      }),
    ]);
  });

  it('says so when a month has no data yet', async () => {
    const empty = await reports.report({}, at('2031-03-18T12:00:00Z'));
    expect(empty.cards[0]).toMatchObject({
      value: '—',
      change: null,
      note: 'No replies this month yet',
    });
    expect(empty.cards[1].note).toBe('Nothing resolved this month yet');
    expect(empty.cards[2]).toMatchObject({
      value: '0',
      change: { text: 'Same as last month', tone: 'same' },
    });
  });

  it('a date range, a customer or a developer narrows every number', async () => {
    const whole = await reports.report({}, now);
    // The same month as dates: the same counts, compared with the days before.
    const clock = now.toISOString().slice(0, 7);
    const lastDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
    ).getUTCDate();
    const ranged = await reports.report(
      { from: `${clock}-01`, to: `${clock}-${lastDay}` },
      now,
    );
    expect(ranged.cards[2]).toMatchObject({
      label: 'Resolved',
      value: whole.cards[2].value,
    });
    expect(ranged.period.custom).toBe(true);
    expect(ranged.projectsAllTime).toBe(false);

    // Nobody's requests: zeros everywhere, and the SLA cards say so.
    const nobody = await reports.report(
      { customerId: '00000000-0000-0000-0000-000000000000' },
      now,
    );
    expect(nobody.cards[2].value).toBe('0');
    expect(nobody.sla.map((card) => card.label)).toEqual([
      'Reply SLA met',
      'Fix SLA met',
    ]);
    expect(nobody.sla[0]).toMatchObject({ value: '—' });
    expect(whole.filters.developers.length).toBeGreaterThan(0);

    // A range that makes no sense is refused.
    const bad = await as(admin)
      .get('/team/reports?from=2026-11-30&to=2026-11-01')
      .expect(400);
    expect(bad.body.code).toBe('BAD_RANGE');
  });

  it('super admins, admins and managers see it; developers do not', async () => {
    await as(manager).get('/team/reports').expect(200);
    await as(admin).get('/team/reports').expect(200);
    await as(developer).get('/team/reports').expect(403);
  });
});

describe('Settings', () => {
  const defaults = {
    responseTargets: { URGENT: '1h', HIGH: '4h', MEDIUM: '1bd', LOW: '2bd' },
    resolutionTargets: {
      URGENT: '1bd',
      HIGH: '3bd',
      MEDIUM: '5bd',
      LOW: '10bd',
    },
    slaCalendar: defaultSettings.slaCalendar,
    requestRules: { reopenWithinDays: 14 },
    teamNotifications: {
      urgentAlert: true,
      notifyAssigneeOnReply: true,
      dailyDigest: true,
      autoCloseResolvedAfter7Days: false,
    },
  };

  it('only super admins read and save them', async () => {
    const read = await as(superAdmin).get('/team/settings').expect(200);
    expect(read.body).toEqual(defaults);
    await as(admin).get('/team/settings').expect(403);
    await as(manager).post('/team/settings', defaults).expect(403);
  });

  it('refuses a target that is not a time', async () => {
    const bad = await as(superAdmin)
      .post('/team/settings', {
        ...defaults,
        responseTargets: { ...defaults.responseTargets, HIGH: 'soon' },
      })
      .expect(400);
    expect(JSON.stringify(bad.body)).toContain(
      'Write it like 4 hours or 1 business day',
    );
    await as(superAdmin)
      .post('/team/settings', {
        ...defaults,
        responseTargets: { ...defaults.responseTargets, LOW: '45bd' },
      })
      .expect(400);
  });

  it('saving changes the next due time and the switches, with audit entries', async () => {
    const next = {
      ...defaults,
      responseTargets: { ...defaults.responseTargets, MEDIUM: '2h' },
      resolutionTargets: { ...defaults.resolutionTargets, MEDIUM: '3bd' },
      slaCalendar: { bankHolidays: ['2026-12-25', '2026-12-28'] },
      teamNotifications: { ...defaults.teamNotifications, urgentAlert: false },
    };
    const saved = await as(superAdmin).post('/team/settings', next).expect(200);
    expect(saved.body).toEqual(next);

    const logs = await prisma.auditLog.findMany({
      where: { action: 'settings.changed', actorId: superAdmin.id },
    });
    expect(logs.map((log) => log.entityId).sort()).toEqual([
      'resolutionTargets',
      'responseTargets',
      'slaCalendar',
      'teamNotifications',
    ]);
    expect(logs.find((l) => l.entityId === 'responseTargets')?.data).toEqual({
      from: defaults.responseTargets,
      to: next.responseTargets,
    });
    // Saving the same again writes nothing new.
    await as(superAdmin).post('/team/settings', next).expect(200);
    expect(
      await prisma.auditLog.count({
        where: { action: 'settings.changed', actorId: superAdmin.id },
      }),
    ).toBe(4);

    // The next Medium request is due 2 hours after it arrives.
    const send = (priority: string, title: string) =>
      http()
        .post('/portal/requests')
        .set('Cookie', customer.cookie)
        .field('projectId', busyProject)
        .field('type', 'TECHNICAL_ISSUE')
        .field('priority', priority)
        .field('title', title)
        .field('description', 'Sent after the settings changed.')
        .expect(201);
    const medium = await send('MEDIUM', 'Due in two hours');
    const stored = await prisma.supportRequest.findUniqueOrThrow({
      where: { code: medium.body.code },
    });
    expect(stored.dueAt!.getTime() - stored.createdAt.getTime()).toBe(
      2 * 3_600_000,
    );
    // And its fix is due 3 business days later (the new resolution target).
    expect(stored.resolveDueAt).not.toBeNull();
    expect(stored.resolveDueAt!.getTime()).toBeGreaterThan(
      stored.createdAt.getTime() + 2 * 24 * 3_600_000,
    );

    // Not a real date: refused.
    await as(superAdmin)
      .post('/team/settings', {
        ...next,
        slaCalendar: { bankHolidays: ['2026-02-30'] },
      })
      .expect(400);

    // Urgent alerts are switched off: no alert email.
    sent.length = 0;
    const urgent = await send('URGENT', 'Checkout is down');
    expect(
      sent.filter((email) => email.subject.startsWith('Urgent request')),
    ).toHaveLength(0);
    expect(sent.map((email) => email.to)).not.toContain(superAdmin.email);
    expect(urgent.body.code).toMatch(/^TKT-/);
  });
});
