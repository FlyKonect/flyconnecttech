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

// Website content on a real database: the testimonials and the
// live-project link that super admins and admins manage, and what the
// public website gets from GET /website.

const DOMAIN = '@website.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const DEFAULT_LINK = 'https://dev.flyconnect.co.uk';
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

const testimonial = (quote: string, extra: object = {}) => ({
  quote,
  name: 'Sarah Mitchell',
  role: 'Managing director',
  company: 'Bluewave Holidays',
  showOnHome: true,
  showOnCaseStudy: false,
  ...extra,
});

let superAdmin: Person;
let admin: Person;
let manager: Person;
let developer: Person;
let customer: Person;

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

  // The public answer counts every testimonial: start from none.
  await prisma.testimonial.deleteMany({});
  await prisma.setting.deleteMany({ where: { key: 'website' } });

  superAdmin = await person('SUPER_ADMIN', 'Hamza Siddiqui');
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
  developer = await person('DEVELOPER', 'Daniyal Ahmed');
  customer = await person('CUSTOMER', 'Sarah Mitchell', 'Bluewave Holidays');
});

afterAll(async () => {
  // Back to the defaults for the other test files.
  await prisma?.testimonial.deleteMany({});
  await prisma?.setting.deleteMany({ where: { key: 'website' } });
  await app?.close();
});

describe('who may manage website content', () => {
  it('super admins and admins; not managers, developers or customers', async () => {
    await as(superAdmin).get('/team/website').expect(200);
    await as(admin).get('/team/website').expect(200);
    for (const who of [manager, developer, customer]) {
      await as(who).get('/team/website').expect(403);
      await as(who)
        .post('/team/website/testimonials', testimonial('Not allowed.'))
        .expect(403);
      await as(who)
        .post('/team/website/link', { liveProjectUrl: 'https://a.example' })
        .expect(403);
    }
    await http().get('/team/website').expect(401);
    expect(await prisma.testimonial.count()).toBe(0);
  });
});

describe('testimonials', () => {
  it('the website gets the 3 newest for Home and the newest for Case Studies', async () => {
    // Five, a minute apart, oldest first.
    const ids: string[] = [];
    for (const [index, extra] of [
      { showOnCaseStudy: true },
      {},
      { showOnHome: false },
      { showOnCaseStudy: true },
      { showOnHome: false, showOnCaseStudy: false },
    ].entries()) {
      const { body } = await as(admin)
        .post(
          '/team/website/testimonials',
          testimonial(`Quote ${index + 1}`, extra),
        )
        .expect(201);
      await prisma.testimonial.update({
        where: { id: body.id },
        data: { createdAt: new Date(Date.UTC(2026, 10, 1, 9, index)) },
      });
      ids.push(body.id);
    }

    // No sign-in needed.
    const { body } = await http().get('/website').expect(200);
    expect(body.liveProjectUrl).toBe(DEFAULT_LINK);
    expect(body.home.map((t: { quote: string }) => t.quote)).toEqual([
      'Quote 4',
      'Quote 2',
      'Quote 1',
    ]);
    expect(body.caseStudy).toEqual({
      id: ids[3],
      quote: 'Quote 4',
      name: 'Sarah Mitchell',
      role: 'Managing director',
      company: 'Bluewave Holidays',
    });

    // The team sees all five, newest first, with who added them.
    const team = await as(superAdmin).get('/team/website').expect(200);
    expect(team.body.testimonials).toHaveLength(5);
    expect(team.body.testimonials[0]).toMatchObject({
      quote: 'Quote 5',
      showOnHome: false,
      showOnCaseStudy: false,
      addedBy: 'Emma Clarke',
    });
  });

  it('edits and removes, each with an audit entry', async () => {
    const { body } = await as(superAdmin)
      .post(
        '/team/website/testimonials',
        testimonial('  Fast and clear.  ', { role: '', company: '' }),
      )
      .expect(201);
    const saved = await prisma.testimonial.findUniqueOrThrow({
      where: { id: body.id },
    });
    expect(saved).toMatchObject({
      quote: 'Fast and clear.',
      role: null,
      company: null,
      createdById: superAdmin.id,
    });

    await as(admin)
      .post(
        `/team/website/testimonials/${body.id}`,
        testimonial('Fast, clear and friendly.', { showOnCaseStudy: true }),
      )
      .expect(200);
    expect(
      await prisma.testimonial.findUniqueOrThrow({ where: { id: body.id } }),
    ).toMatchObject({
      quote: 'Fast, clear and friendly.',
      showOnCaseStudy: true,
    });

    await as(admin)
      .post(`/team/website/testimonials/${body.id}/remove`)
      .expect(200);
    expect(
      await prisma.testimonial.findUnique({ where: { id: body.id } }),
    ).toBeNull();

    const audit = await prisma.auditLog.findMany({
      where: { entityType: 'testimonial', entityId: body.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(audit.map((entry) => [entry.action, entry.actorId])).toEqual([
      ['testimonial.added', superAdmin.id],
      ['testimonial.changed', admin.id],
      ['testimonial.removed', admin.id],
    ]);

    // Gone: editing or removing it again is "not found".
    await as(admin)
      .post(`/team/website/testimonials/${body.id}`, testimonial('Again.'))
      .expect(404);
    await as(admin)
      .post(`/team/website/testimonials/${body.id}/remove`)
      .expect(404);
  });

  it('needs a quote and a name', async () => {
    const { body } = await as(admin)
      .post('/team/website/testimonials', testimonial(' ', { name: '' }))
      .expect(400);
    expect(JSON.stringify(body)).toContain('Write the quote');
    expect(JSON.stringify(body)).toContain("Enter the client's name");
  });
});

describe('the live-project link', () => {
  it('refuses a bad address, saves a good one with an audit entry', async () => {
    const bad = await as(admin)
      .post('/team/website/link', { liveProjectUrl: 'flyconnect.co.uk' })
      .expect(400);
    expect(JSON.stringify(bad.body)).toContain(
      'Enter a full web address starting with https://',
    );
    expect((await http().get('/website').expect(200)).body.liveProjectUrl).toBe(
      DEFAULT_LINK,
    );

    await as(admin)
      .post('/team/website/link', {
        liveProjectUrl: ' https://flyconnect.co.uk ',
      })
      .expect(200);
    expect((await http().get('/website').expect(200)).body.liveProjectUrl).toBe(
      'https://flyconnect.co.uk',
    );
    expect(
      (await as(superAdmin).get('/team/website').expect(200)).body
        .liveProjectUrl,
    ).toBe('https://flyconnect.co.uk');

    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { action: 'settings.changed', entityId: 'website' },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toMatchObject({
      actorId: admin.id,
      data: {
        from: { liveProjectUrl: DEFAULT_LINK },
        to: { liveProjectUrl: 'https://flyconnect.co.uk' },
      },
    });
  });
});
