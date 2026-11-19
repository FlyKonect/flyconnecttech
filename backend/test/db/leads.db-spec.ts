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
import { offeredDemoSlots } from '../../src/leads/lead-rules.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { secretFromUri, totp } from '../totp.js';

// Website leads on a real database (docs/01 §2, §6 and §7): the public
// forms, the demo, quote and message flows, owners, convert and who may
// do what.

const DOMAIN = '@leads.test';
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

async function person(role: Role, name: string): Promise<Person> {
  const email = uniqueEmail(role.toLowerCase());
  const { userId } = await invitations.inviteUser(
    { name, email, role, jobTitle: 'Tester' },
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
  return { id: userId, email, name, cookie };
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

/** A website slot, as the Book a demo calendar offers it. */
const slot = (index: number) => offeredDemoSlots()[index].toISOString();
let nextSlot = 0;

const emailsTo = (to: string) => sent.filter((email) => email.to === to);

/** The website forms' emails go out just after the answer: wait a moment. */
async function eventually(check: () => void, ms = 5000) {
  const deadline = Date.now() + ms;
  for (;;) {
    try {
      check();
      return;
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

async function bookDemo(changes: Record<string, unknown> = {}) {
  const email = uniqueEmail('olivia');
  await http()
    .post('/leads/demo')
    .send({
      topic: 'TRAVEL_BOOKING_PLATFORM',
      preferredStart: slot(nextSlot++),
      name: 'Olivia Grant',
      email,
      company: 'Skyhaven Travel',
      notes: 'Please also show the agent dashboard.',
      sourcePage: '/travel-technology',
      ...changes,
    })
    .expect(200);
  return prisma.demoRequest.findFirstOrThrow({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
}

async function askQuote(changes: Record<string, unknown> = {}) {
  const email = uniqueEmail('hannah');
  await http()
    .post('/leads/quote')
    .send({
      projectType: 'API_INTEGRATION',
      budget: 'FROM_15K_TO_50K',
      timeline: 'WITHIN_3_6_MONTHS',
      name: 'Hannah Weber',
      email,
      company: 'Alpenblick Hotels',
      requirements: 'Connect our booking engine to our channel manager.',
      sourcePage: '/contact',
      ...changes,
    })
    .expect(200);
  return prisma.quoteRequest.findFirstOrThrow({ where: { email } });
}

async function sendMessage(email = uniqueEmail('laura')) {
  await http()
    .post('/leads/message')
    .send({
      topic: 'PARTNERSHIP',
      name: 'Laura Bennett',
      email,
      message: 'We are a small UX studio and often need a partner.',
      sourcePage: '/contact',
    })
    .expect(200);
  return prisma.contactMessage.findFirstOrThrow({ where: { email } });
}

const activityOf = (leadId: string) =>
  prisma.leadActivity.findMany({
    where: { leadId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
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

  // This file's leftovers go, so their demo slots are free again.
  const where = { email: { endsWith: DOMAIN } };
  const leads = [
    ...(await prisma.demoRequest.findMany({ where, select: { id: true } })),
    ...(await prisma.quoteRequest.findMany({ where, select: { id: true } })),
    ...(await prisma.contactMessage.findMany({ where, select: { id: true } })),
  ];
  await prisma.leadActivity.deleteMany({
    where: { leadId: { in: leads.map((lead) => lead.id) } },
  });
  await prisma.demoRequest.deleteMany({ where });
  await prisma.quoteRequest.deleteMany({ where });
  await prisma.contactMessage.deleteMany({ where });
  const old = await prisma.user.findMany({
    where,
    select: { id: true, customerId: true },
  });
  const customerIds = old.flatMap((u) => (u.customerId ? [u.customerId] : []));
  await prisma.project.deleteMany({
    where: { customerId: { in: customerIds } },
  });
  await prisma.user.deleteMany({ where: { id: { in: old.map((u) => u.id) } } });
  await prisma.customer.deleteMany({ where: { id: { in: customerIds } } });
  // Other files' people would get the alerts too: put them aside.
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
});

afterAll(async () => {
  await app?.close();
});

describe('the website forms', () => {
  it('a demo request is saved, the team is told and the visitor gets a copy', async () => {
    const demo = await bookDemo();
    expect(demo).toMatchObject({
      status: 'NEW',
      sourcePage: 'Travel Technology',
      company: 'Skyhaven Travel',
    });
    expect(demo.code).toMatch(/^DEM-\d{4}-\d{3,}$/);

    const [first] = await activityOf(demo.id);
    expect(first.body).toBe('Demo requested from the Travel Technology page');

    const text = `New demo request ${demo.code} from Olivia Grant, Skyhaven Travel`;
    for (const who of [superAdmin, admin, manager]) {
      const notes = await prisma.notification.findMany({
        where: { userId: who.id, text },
      });
      expect(notes).toHaveLength(1);
      expect(notes[0].href).toBe(`/team/leads/demos/${demo.code}`);
      await eventually(() =>
        expect(emailsTo(who.email).map((email) => email.subject)).toContain(
          text,
        ),
      );
    }
    expect(
      await prisma.notification.count({
        where: { userId: developer.id, text },
      }),
    ).toBe(0);
    expect(emailsTo(developer.email).map((e) => e.subject)).not.toContain(text);
    await eventually(() =>
      expect(emailsTo(demo.email).map((e) => e.subject)).toEqual([
        'Your FlyConnect Tech demo request',
      ]),
    );
  });

  it('a bot filling the hidden field gets "sent" and nothing is saved', async () => {
    const email = uniqueEmail('bot');
    const answer = await http()
      .post('/leads/quote')
      .send({
        projectType: 'OTHER',
        budget: 'NOT_SURE',
        name: 'Bot',
        email,
        requirements: 'Buy now',
        website: 'https://spam.example',
      })
      .expect(200);
    expect(answer.body).toEqual({ ok: true });
    expect(await prisma.quoteRequest.count({ where: { email } })).toBe(0);
    expect(emailsTo(email)).toHaveLength(0);
  });

  it('refuses bad input and times that are not offered', async () => {
    await http()
      .post('/leads/message')
      .send({ topic: 'PARTNERSHIP', name: '', email: 'no', message: '' })
      .expect(400);
    const notASlot = await http()
      .post('/leads/demo')
      .send({
        topic: 'API_INTEGRATIONS',
        preferredStart: '2026-01-01T10:00:00.000Z',
        name: 'Late',
        email: uniqueEmail('late'),
        company: 'Late Ltd',
      })
      .expect(400);
    expect(notASlot.body.code).toBe('NOT_A_SLOT');
  });

  it('a quote request is saved with its details and the visitor gets a copy', async () => {
    const quote = await askQuote({ timeline: undefined, company: '' });
    expect(quote).toMatchObject({
      status: 'NEW',
      sourcePage: 'Contact & Quote',
      timeline: null,
      company: null,
    });
    await eventually(() =>
      expect(emailsTo(quote.email).map((e) => e.subject)).toEqual([
        'We received your quote request',
      ]),
    );
  });

  it('a message from a customer is linked to them; messages get no copy', async () => {
    const { customerId } = await invitations.inviteUser(
      {
        name: 'Sarah Mitchell',
        email: uniqueEmail('sarah'),
        role: 'CUSTOMER',
        company: 'Bluewave Holidays',
      },
      admin.id,
    );
    const customerEmail = (await prisma.user.findFirstOrThrow({
      where: { customerId },
    }))!.email;
    const message = await sendMessage(customerEmail);
    expect(message.customerId).toBe(customerId);
    expect(emailsTo(customerEmail).map((e) => e.subject)).not.toContain(
      'About your message to FlyConnect Tech',
    );
    const detail = await as(admin)
      .get(`/team/leads/messages/${message.code}`)
      .expect(200);
    expect(detail.body.customer).toMatchObject({
      id: customerId,
      company: 'Bluewave Holidays',
    });
    expect(detail.body.converted).toBe(false);
  });
});

describe('demo requests', () => {
  it('confirm sends the calendar invite and takes the slot', async () => {
    const demo = await bookDemo();
    const start = demo.preferredStart.toISOString();
    const confirmed = await as(admin)
      .post(`/team/leads/demos/${demo.code}/confirm`, {
        start,
        hostId: manager.id,
        videoLink: 'https://meet.example.com/abc',
      })
      .expect(200);
    expect(confirmed.body).toMatchObject({
      status: 'SCHEDULED',
      emailSent: true,
    });

    const saved = await prisma.demoRequest.findUniqueOrThrow({
      where: { id: demo.id },
    });
    expect(saved).toMatchObject({
      status: 'SCHEDULED',
      hostId: manager.id,
      // Nobody owned it: the host does now.
      ownerId: manager.id,
      videoLink: 'https://meet.example.com/abc',
    });
    expect(saved.scheduledSlot?.toISOString()).toBe(start);

    const invite = emailsTo(demo.email).find((email) => email.calendar);
    expect(invite?.subject).toMatch(
      /^Your FlyConnect Tech demo is confirmed: /,
    );
    expect(invite?.calendar?.method).toBe('REQUEST');
    expect(invite?.calendar?.content).toContain(
      `DTSTART:${start.replace(/[-:]/g, '').replace('.000', '')}`,
    );
    const lines = (await activityOf(demo.id)).map((a) => [a.kind, a.body]);
    expect(lines).toContainEqual([
      'SYSTEM',
      expect.stringMatching(/^Confirmed for .+ UK time by Emma Clarke$/),
    ]);
    expect(lines).toContainEqual([
      'EMAIL',
      expect.stringContaining('your FlyConnect Tech demo is confirmed for'),
    ]);
    // The host hears about it; the person who did it doesn't.
    expect(
      await prisma.notification.count({
        where: {
          userId: manager.id,
          text: { startsWith: `${demo.code} demo confirmed` },
        },
      }),
    ).toBe(1);
    expect(
      await prisma.notification.count({
        where: { userId: admin.id, text: { startsWith: `${demo.code} demo` } },
      }),
    ).toBe(0);

    // The website shows the slot as taken, and nobody can take it again.
    const slots = await http().get('/leads/demo-slots').expect(200);
    expect(slots.body.taken).toContain(start);
    const again = await http()
      .post('/leads/demo')
      .send({
        topic: 'API_INTEGRATIONS',
        preferredStart: start,
        name: 'Marco Bellini',
        email: uniqueEmail('marco'),
        company: 'Riva Charters',
      })
      .expect(409);
    expect(again.body.code).toBe('SLOT_TAKEN');
    const other = await bookDemo();
    const clash = await as(admin)
      .post(`/team/leads/demos/${other.code}/confirm`, {
        start,
        hostId: admin.id,
      })
      .expect(409);
    expect(clash.body.code).toBe('SLOT_TAKEN');
  });

  it('reschedule moves it; complete frees the slot; the order is enforced', async () => {
    const demo = await bookDemo();
    await as(manager)
      .post(`/team/leads/demos/${demo.code}/complete`)
      .expect(409);
    await as(manager)
      .post(`/team/leads/demos/${demo.code}/confirm`, {
        start: demo.preferredStart.toISOString(),
        hostId: manager.id,
      })
      .expect(200);
    const later = slot(nextSlot++);
    await as(manager)
      .post(`/team/leads/demos/${demo.code}/confirm`, {
        start: later,
        hostId: manager.id,
      })
      .expect(200);
    const moved = await prisma.demoRequest.findUniqueOrThrow({
      where: { id: demo.id },
    });
    expect(moved.scheduledSlot?.toISOString()).toBe(later);
    expect(
      emailsTo(demo.email).some((email) =>
        email.subject.startsWith('Your FlyConnect Tech demo has moved'),
      ),
    ).toBe(true);
    expect((await activityOf(demo.id)).map((a) => a.body)).toContainEqual(
      expect.stringMatching(/^Rescheduled to /),
    );

    await as(manager)
      .post(`/team/leads/demos/${demo.code}/complete`)
      .expect(200);
    const done = await prisma.demoRequest.findUniqueOrThrow({
      where: { id: demo.id },
    });
    expect(done).toMatchObject({ status: 'COMPLETED', scheduledSlot: null });
  });

  it('cancel, with or without the email, then reopen', async () => {
    const quiet = await bookDemo();
    await as(admin)
      .post(`/team/leads/demos/${quiet.code}/cancel`, {
        reason: 'Duplicate request',
        email: false,
      })
      .expect(200);
    expect(
      emailsTo(quiet.email).filter((e) => /cancelled/.test(e.subject)),
    ).toHaveLength(0);
    const cancelled = await prisma.demoRequest.findUniqueOrThrow({
      where: { id: quiet.id },
    });
    expect(cancelled).toMatchObject({
      status: 'CANCELLED',
      cancelReason: 'Duplicate request',
      ownerId: admin.id,
    });
    expect((await activityOf(quiet.id)).map((a) => a.body)).toContain(
      'Cancelled by Emma Clarke · Duplicate request',
    );

    const booked = await bookDemo();
    await as(admin)
      .post(`/team/leads/demos/${booked.code}/confirm`, {
        start: booked.preferredStart.toISOString(),
        hostId: admin.id,
      })
      .expect(200);
    const answer = await as(admin)
      .post(`/team/leads/demos/${booked.code}/cancel`, {
        reason: 'No longer interested',
        email: true,
      })
      .expect(200);
    expect(answer.body.emailSent).toBe(true);
    const email = emailsTo(booked.email).find((e) =>
      /cancelled/.test(e.subject),
    );
    expect(email?.calendar?.method).toBe('CANCEL');
    expect(
      (await prisma.demoRequest.findUniqueOrThrow({ where: { id: booked.id } }))
        .scheduledSlot,
    ).toBeNull();

    await as(admin).post(`/team/leads/demos/${quiet.code}/reopen`).expect(200);
    const reopened = await prisma.demoRequest.findUniqueOrThrow({
      where: { id: quiet.id },
    });
    expect(reopened).toMatchObject({ status: 'NEW', cancelReason: null });
  });
});

describe('quote requests', () => {
  it('review, estimate, update (the history is kept), won', async () => {
    const quote = await askQuote();
    await as(manager)
      .post(`/team/leads/quotes/${quote.code}/review`)
      .expect(200);
    expect(
      await prisma.quoteRequest.findUniqueOrThrow({ where: { id: quote.id } }),
    ).toMatchObject({ status: 'REVIEWING', ownerId: manager.id });

    const validUntil = new Date(Date.now() + 14 * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const first = await as(admin)
      .post(`/team/leads/quotes/${quote.code}/estimate`, {
        amount: 24000,
        deliveryTime: '6–8 weeks',
        validUntil,
        summary: 'The channel manager and accounting sync.',
      })
      .expect(200);
    expect(first.body).toMatchObject({
      status: 'ESTIMATE_SENT',
      emailSent: true,
    });
    await as(admin)
      .post(`/team/leads/quotes/${quote.code}/estimate`, {
        amount: 22000.5,
        deliveryTime: '6 weeks',
        validUntil,
        summary: '',
      })
      .expect(200);

    const subjects = emailsTo(quote.email).map((e) => e.subject);
    expect(subjects).toContain('Your estimate from FlyConnect Tech');
    expect(subjects).toContain('Your updated estimate from FlyConnect Tech');
    const bodies = (await activityOf(quote.id)).map((a) => a.body);
    expect(bodies).toContain('Estimate of £24,000 sent by Emma Clarke');
    expect(bodies).toContain(
      'Updated estimate of £22,000.50 sent by Emma Clarke',
    );

    await as(admin).post(`/team/leads/quotes/${quote.code}/won`).expect(200);
    const detail = await as(admin)
      .get(`/team/leads/quotes/${quote.code}`)
      .expect(200);
    expect(detail.body.status).toBe('WON');
    expect(
      detail.body.estimates.map((e: { amountCents: number }) => e.amountCents),
    ).toEqual([2_200_050, 2_400_000]);
    // The manager started the review, so they stay the owner.
    expect(detail.body.owner.name).toBe('Sofia Martins');
    expect((await activityOf(quote.id)).map((a) => a.body)).toContain(
      'Marked as won by Emma Clarke · Hannah accepted the estimate',
    );
  });

  it('lost, with a note for the team, then reopen', async () => {
    const quote = await askQuote();
    await as(admin)
      .post(`/team/leads/quotes/${quote.code}/lost`, {
        reason: 'Timing',
        note: 'They will come back next year.',
      })
      .expect(200);
    const lost = await prisma.quoteRequest.findUniqueOrThrow({
      where: { id: quote.id },
    });
    expect(lost).toMatchObject({ status: 'LOST', lostReason: 'Timing' });
    const lines = (await activityOf(quote.id)).map((a) => [a.kind, a.body]);
    expect(lines).toContainEqual(['NOTE', 'They will come back next year.']);
    expect(lines).toContainEqual([
      'SYSTEM',
      'Marked as lost by Emma Clarke · Timing',
    ]);

    await as(admin).post(`/team/leads/quotes/${quote.code}/reopen`).expect(200);
    expect(
      await prisma.quoteRequest.findUniqueOrThrow({ where: { id: quote.id } }),
    ).toMatchObject({ status: 'REVIEWING', lostReason: null });
  });
});

describe('messages, owners and the composer', () => {
  it('an email reply marks it Replied; a note sends nothing; close and reopen', async () => {
    const message = await sendMessage();
    await as(manager)
      .post(`/team/leads/messages/${message.code}/activity`, {
        kind: 'note',
        body: 'Looks like a good partner.',
      })
      .expect(200);
    expect(emailsTo(message.email)).toHaveLength(0);

    await as(manager)
      .post(`/team/leads/messages/${message.code}/activity`, {
        kind: 'email',
        body: 'Hi Laura, thanks for getting in touch.',
      })
      .expect(200);
    expect(emailsTo(message.email).map((e) => e.subject)).toEqual([
      'About your message to FlyConnect Tech',
    ]);
    const replied = await prisma.contactMessage.findUniqueOrThrow({
      where: { id: message.id },
    });
    expect(replied).toMatchObject({ status: 'REPLIED', ownerId: manager.id });
    expect((await activityOf(message.id)).map((a) => [a.kind, a.body])).toEqual(
      expect.arrayContaining([
        ['NOTE', 'Looks like a good partner.'],
        ['EMAIL', 'Hi Laura, thanks for getting in touch.'],
        ['SYSTEM', 'Status changed to Replied'],
      ]),
    );

    await as(manager)
      .post(`/team/leads/messages/${message.code}/close`)
      .expect(200);
    await as(manager)
      .post(`/team/leads/messages/${message.code}/reopen`)
      .expect(200);
    expect(
      (
        await prisma.contactMessage.findUniqueOrThrow({
          where: { id: message.id },
        })
      ).status,
    ).toBe('REPLIED');

    // Never answered: reopening goes back to New.
    const unanswered = await sendMessage();
    await as(manager)
      .post(`/team/leads/messages/${unanswered.code}/close`)
      .expect(200);
    await as(manager)
      .post(`/team/leads/messages/${unanswered.code}/reopen`)
      .expect(200);
    expect(
      (
        await prisma.contactMessage.findUniqueOrThrow({
          where: { id: unanswered.id },
        })
      ).status,
    ).toBe('NEW');
  });

  it('the owner can be set to a lead person, or removed', async () => {
    const quote = await askQuote();
    const owners = await as(admin).get('/team/leads/owners').expect(200);
    expect(owners.body.map((o: { id: string }) => o.id)).toEqual(
      expect.arrayContaining([superAdmin.id, admin.id, manager.id]),
    );
    expect(owners.body.map((o: { id: string }) => o.id)).not.toContain(
      developer.id,
    );
    await as(admin)
      .post(`/team/leads/quotes/${quote.code}/owner`, { ownerId: developer.id })
      .expect(400);
    await as(admin)
      .post(`/team/leads/quotes/${quote.code}/owner`, { ownerId: manager.id })
      .expect(200);
    await as(admin)
      .post(`/team/leads/quotes/${quote.code}/owner`, { ownerId: null })
      .expect(200);
    const bodies = (await activityOf(quote.id)).map((a) => a.body);
    expect(bodies).toContain('Owner set to Sofia Martins by Emma Clarke');
    expect(bodies).toContain('Owner removed by Emma Clarke');
  });

  it('lists have tabs with counts, search, and the newest first', async () => {
    const demo = await bookDemo({ company: `Tatra Trips ${counter}` });
    const list = await as(manager)
      .get(`/team/leads/demos?q=${encodeURIComponent(demo.company)}`)
      .expect(200);
    expect(list.body.rows.map((r: { code: string }) => r.code)).toEqual([
      demo.code,
    ]);
    expect(list.body.all).toBeGreaterThan(0);
    expect(list.body.tabs.NEW).toBeGreaterThan(0);
    const scheduled = await as(manager)
      .get('/team/leads/demos?status=scheduled')
      .expect(200);
    expect(
      scheduled.body.rows.every(
        (r: { status: string }) => r.status === 'SCHEDULED',
      ),
    ).toBe(true);
  });
});

describe('convert to customer', () => {
  it('a completed demo becomes a customer, linked both ways, once', async () => {
    const demo = await bookDemo();
    await as(admin).get(`/team/leads/convert/${demo.code}`).expect(409);
    await as(admin)
      .post(`/team/leads/demos/${demo.code}/confirm`, {
        start: demo.preferredStart.toISOString(),
        hostId: admin.id,
      })
      .expect(200);
    await as(admin).post(`/team/leads/demos/${demo.code}/complete`).expect(200);

    const prefill = await as(admin)
      .get(`/team/leads/convert/${demo.code}`)
      .expect(200);
    expect(prefill.body).toMatchObject({
      lead: { type: 'DEMO', code: demo.code, label: 'demo request' },
      name: 'Olivia Grant',
      email: demo.email,
      company: 'Skyhaven Travel',
      project: {
        name: 'Skyhaven booking platform',
        type: 'TRAVEL_BOOKING_PLATFORM',
      },
    });
    await as(manager).get(`/team/leads/convert/${demo.code}`).expect(403);

    const created = await as(admin)
      .post('/team/customers', {
        name: prefill.body.name,
        email: prefill.body.email,
        company: prefill.body.company,
        projects: [prefill.body.project],
        from: demo.code,
      })
      .expect(201);
    const customer = await prisma.customer.findUniqueOrThrow({
      where: { id: created.body.id },
    });
    expect(customer).toMatchObject({
      sourceLeadType: 'DEMO',
      sourceLeadId: demo.id,
    });
    expect(
      (await prisma.demoRequest.findUniqueOrThrow({ where: { id: demo.id } }))
        .customerId,
    ).toBe(customer.id);
    expect((await activityOf(demo.id)).map((a) => a.body)).toContain(
      `Converted to customer by Emma Clarke. Portal invitation sent to ${demo.email}`,
    );
    expect(
      await prisma.auditLog.count({
        where: { action: 'lead.converted', entityId: demo.id },
      }),
    ).toBe(1);
    const page = await as(admin)
      .get(`/team/customers/${customer.id}`)
      .expect(200);
    expect(page.body.cameFrom).toEqual({ type: 'DEMO', code: demo.code });
    const detail = await as(admin)
      .get(`/team/leads/demos/${demo.code}`)
      .expect(200);
    expect(detail.body.converted).toBe(true);

    // Only once.
    await as(admin).get(`/team/leads/convert/${demo.code}`).expect(409);
  });
});

describe('who may do what', () => {
  it('developers get nothing; managers work on leads', async () => {
    await as(developer).get('/team/leads/demos').expect(403);
    await as(developer).get('/team/leads/owners').expect(403);
    await as(manager).get('/team/leads/quotes').expect(200);
    await as(manager).get('/team/leads/nothing').expect(404);
  });

  it('the sidebar and dashboard count new leads for the lead team only', async () => {
    const summary = await as(admin).get('/team/summary').expect(200);
    expect(summary.body.leads).toEqual({
      demos: expect.any(Number),
      quotes: expect.any(Number),
      messages: expect.any(Number),
    });
    expect(summary.body.leads.demos).toBeGreaterThan(0);
    const dashboard = await as(manager).get('/team/dashboard').expect(200);
    expect(dashboard.body.leads).toMatchObject({
      demos: expect.any(Number),
      estimatesAwaiting: expect.any(Number),
      demosBooked: expect.any(Number),
    });
    const theirs = await as(developer).get('/team/summary').expect(200);
    expect(theirs.body.leads).toBeNull();
  });
});
