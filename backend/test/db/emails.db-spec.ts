import { jest } from '@jest/globals';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { SendMailOptions } from 'nodemailer';
import { createElement } from 'react';
import request from 'supertest';
import { InvitationsService } from '../../src/accounts/invitations.service.js';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { EmailService, MAX_TRIES } from '../../src/email/email.service.js';
import { company } from '../../src/email/templates/layout.js';
import type { Role } from '../../src/generated/prisma/client.js';
import { JobsService } from '../../src/jobs/jobs.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../totp.js';

// Emails that fail on a real database: they are kept and tried again by
// the send-emails job, then wait on the Failed emails screen (admins),
// where they can be resent or removed. Emails with a sign-in link are
// never kept. The mail server is replaced by a fake that can be "down".

const DOMAIN = '@emails.test';
const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';
const MINUTE = 60_000;

let app: NestExpressApplication;
let prisma: PrismaService;
let email: EmailService;
let jobs: JobsService;
let invitations: InvitationsService;

let serverDown = false;
const delivered: SendMailOptions[] = [];

const http = () => request(app.getHttpServer());
let counter = 0;
const uniqueEmail = (label: string) =>
  `${label}-${Date.now()}-${counter++}${DOMAIN}`;

const message = (to: string, subject: string) => ({
  to,
  subject,
  template: createElement('p', null, 'Hello'),
});

function cookieFrom(response: request.Response): string {
  const raw = response.headers['set-cookie'] as unknown as string[] | undefined;
  if (!raw?.length) throw new Error('No cookie was set.');
  return raw.map((cookie) => cookie.split(';')[0]).join('; ');
}

type Person = { email: string; cookie: string };

async function person(role: Role, name: string): Promise<Person> {
  const address = uniqueEmail(role.toLowerCase());
  await invitations.inviteUser(
    { name, email: address, role, jobTitle: 'Tester' },
    null,
  );
  const mail = [...delivered].reverse().find((item) => item.to === address);
  const html = typeof mail?.html === 'string' ? mail.html : '';
  const token = html.match(/\/invite\/([A-Za-z0-9_-]{43})/)![1];
  await http()
    .post(`/accounts/invitations/${token}/accept`)
    .send({ name, password: PASSWORD })
    .expect(200);
  const signedIn = await http()
    .post('/api/auth/sign-in/email')
    .set('Origin', ORIGIN)
    .send({ email: address, password: PASSWORD })
    .expect(200);
  let cookie = cookieFrom(signedIn);
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
  return { email: address, cookie };
}

const as = (who: Person) => ({
  get: (path: string) => http().get(path).set('Cookie', who.cookie),
  post: (path: string) => http().post(path).set('Cookie', who.cookie).send({}),
});

const rowFor = (to: string) =>
  prisma.emailOutbox.findFirstOrThrow({ where: { to } });

let admin: Person;
let manager: Person;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  configureApp(app);
  await app.init();
  prisma = app.get(PrismaService);
  email = app.get(EmailService);
  jobs = app.get(JobsService);
  invitations = app.get(InvitationsService);

  const transporter = (email as unknown as { transporter: object })
    .transporter as { sendMail: (mail: SendMailOptions) => Promise<unknown> };
  jest
    .spyOn(transporter, 'sendMail')
    .mockImplementation(async (mail: SendMailOptions) => {
      if (serverDown) throw new Error('Connection refused (SMTP down)');
      delivered.push(mail);
      return {};
    });

  await prisma.emailOutbox.deleteMany({});
  admin = await person('ADMIN', 'Emma Clarke');
  manager = await person('MANAGER', 'Sofia Martins');
});

beforeEach(() => {
  serverDown = false;
});

afterAll(async () => {
  await prisma?.emailOutbox.deleteMany({});
  await app?.close();
});

describe('sending', () => {
  it('sends at once, with replies going to the company inbox, and keeps nothing', async () => {
    const to = uniqueEmail('ok');
    await email.send(message(to, 'All good'));
    const mail = delivered.find((item) => item.to === to);
    expect(mail?.replyTo).toBe(company.email);
    expect(await prisma.emailOutbox.count({ where: { to } })).toBe(0);
  });

  it('keeps a failed email for another try, and still reports the failure', async () => {
    serverDown = true;
    const to = uniqueEmail('down');
    await expect(email.send(message(to, 'Your request'))).rejects.toThrow(
      'SMTP down',
    );
    const row = await rowFor(to);
    expect(row).toMatchObject({
      subject: 'Your request',
      attempts: 1,
      sentAt: null,
      gaveUpAt: null,
    });
    expect(row.lastError).toContain('SMTP down');
    expect(row.html).toContain('Hello');
    expect(row.text).toContain('Hello');
  });

  it('never keeps an email with a sign-in link', async () => {
    serverDown = true;
    const to = uniqueEmail('link');
    await expect(
      email.send({ ...message(to, 'Your invitation'), retry: false }),
    ).rejects.toThrow();
    expect(await prisma.emailOutbox.count({ where: { to } })).toBe(0);
  });
});

describe('the send-emails job', () => {
  it('sends a waiting email once its next try is due', async () => {
    serverDown = true;
    const to = uniqueEmail('later');
    await expect(email.send(message(to, 'Later'))).rejects.toThrow();
    serverDown = false;

    // Not due yet: 5 minutes after the failure.
    await jobs.sendEmails(new Date());
    expect((await rowFor(to)).sentAt).toBeNull();

    const result = await jobs.sendEmails(new Date(Date.now() + 6 * MINUTE));
    expect(result.done).toMatch(/\d+ sent/);
    expect((await rowFor(to)).sentAt).not.toBeNull();
    expect(delivered.some((item) => item.to === to)).toBe(true);
  });

  it(`gives up after ${MAX_TRIES} tries, and the email then waits for an admin`, async () => {
    serverDown = true;
    const to = uniqueEmail('gives-up');
    await expect(email.send(message(to, 'Gives up'))).rejects.toThrow();
    let when = Date.now();
    for (let attempt = 2; attempt <= MAX_TRIES; attempt += 1) {
      when += 4 * 60 * MINUTE;
      await jobs.sendEmails(new Date(when));
      expect((await rowFor(to)).attempts).toBe(attempt);
    }
    const row = await rowFor(to);
    expect(row.gaveUpAt).not.toBeNull();

    // Given up: the job leaves it alone.
    await jobs.sendEmails(new Date(when + 24 * 60 * MINUTE));
    expect((await rowFor(to)).attempts).toBe(MAX_TRIES);
  });
});

describe('the Failed emails screen', () => {
  it('is for admins, not managers', async () => {
    await as(admin).get('/team/emails').expect(200);
    await as(manager).get('/team/emails').expect(403);
  });

  it('lists the waiting emails, resends one and removes another', async () => {
    serverDown = true;
    const first = uniqueEmail('resend');
    const second = uniqueEmail('remove');
    await expect(email.send(message(first, 'Resend me'))).rejects.toThrow();
    await expect(email.send(message(second, 'Remove me'))).rejects.toThrow();

    const listed = await as(admin).get('/team/emails').expect(200);
    const items = listed.body.items as { id: string; to: string }[];
    const one = items.find((item) => item.to === first)!;
    const two = items.find((item) => item.to === second)!;
    expect(one).toMatchObject({ state: 'retrying', attempts: 1 });

    // Still down: not sent, and still listed.
    const failed = await as(admin).post(`/team/emails/${one.id}/resend`);
    expect(failed.body).toEqual({ sent: false });

    serverDown = false;
    const resent = await as(admin).post(`/team/emails/${one.id}/resend`);
    expect(resent.body).toEqual({ sent: true });
    await as(admin).post(`/team/emails/${two.id}/dismiss`).expect(200);

    const after = await as(admin).get('/team/emails').expect(200);
    const left = (after.body.items as { to: string }[]).map((item) => item.to);
    expect(left).not.toContain(first);
    expect(left).not.toContain(second);

    // Gone from the list: both answer "not found" now.
    await as(admin).post(`/team/emails/${one.id}/resend`).expect(404);
    await as(manager).post(`/team/emails/${one.id}/resend`).expect(403);
  });
});
