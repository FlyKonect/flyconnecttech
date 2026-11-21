import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { InvitationsService } from '../../../src/accounts/invitations.service.js';
import { AppModule } from '../../../src/app.module.js';
import { configureApp } from '../../../src/app.setup.js';
import {
  EmailService,
  type OutgoingEmail,
} from '../../../src/email/email.service.js';
import type { Role } from '../../../src/generated/prisma/client.js';
import { PrismaService } from '../../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../../totp.js';

/**
 * The whole app on the test database, with emails kept in `sent` instead
 * of going out, and people made through the real invitation and sign-in
 * (team members with two-factor). For the newer database tests.
 *
 *   const t = await startTestApp('@modules.test');
 *   const admin = await t.person('ADMIN', 'Emma Clarke');
 *   await t.as(admin).get('/team/projects').expect(200);
 */

const PASSWORD = 'Skyline-2027';
const ORIGIN = 'http://localhost:3001';

/** A tiny real PNG picture (the backend checks a file's first bytes). */
export const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from('a small test picture'),
]);

export type Person = {
  id: string;
  name: string;
  email: string;
  cookie: string;
  customerId: string | null;
};

export type TestApp = Awaited<ReturnType<typeof startTestApp>>;

export async function startTestApp(domain: string) {
  const sent: OutgoingEmail[] = [];
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(EmailService)
    .useValue({
      send: async (email: OutgoingEmail) => {
        sent.push(email);
      },
    })
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  configureApp(app);
  await app.init();
  const prisma = app.get(PrismaService);
  const invitations = app.get(InvitationsService);

  const http = () => request(app.getHttpServer());
  let counter = 0;
  const uniqueEmail = (label: string) =>
    `${label}-${Date.now()}-${counter++}${domain}`;

  function cookieFrom(response: request.Response): string {
    const raw = response.headers['set-cookie'] as unknown as
      string[] | undefined;
    if (!raw?.length) throw new Error('No cookie was set.');
    return raw.map((cookie) => cookie.split(';')[0]).join('; ');
  }

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
    return { id: userId, name, email, cookie, customerId: customerId ?? null };
  }

  const as = (who: Person) => ({
    get: (path: string) => http().get(path).set('Cookie', who.cookie),
    post: (path: string, body: object = {}) =>
      http().post(path).set('Cookie', who.cookie).send(body),
    /** Multipart, for routes that take files. */
    upload: (path: string) => http().post(path).set('Cookie', who.cookie),
  });

  /** Emails to this person whose subject matches. */
  const emailsTo = (who: Person, subject: string | RegExp) =>
    sent.filter(
      (email) =>
        email.to === who.email &&
        (typeof subject === 'string'
          ? email.subject === subject
          : subject.test(email.subject)),
    );

  /** Their notifications whose text matches. */
  const noticesFor = (who: Person, text: RegExp) =>
    prisma.notification
      .findMany({ where: { userId: who.id }, orderBy: { createdAt: 'asc' } })
      .then((rows) => rows.filter((row) => text.test(row.text)));

  return {
    app,
    prisma,
    sent,
    http,
    person,
    as,
    emailsTo,
    noticesFor,
    close: () => app.close(),
  };
}
