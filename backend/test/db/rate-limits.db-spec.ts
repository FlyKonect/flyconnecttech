import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { PrismaService as Prisma } from '../../src/prisma/prisma.service.js';

// Better Auth's sign-in limits, kept in the database (rate_limits) so every
// app process and every restart count the same tries. The other test files
// switch the limits off; this one switches them on before the app loads.

let app: NestExpressApplication;
let prisma: Prisma;

beforeAll(async () => {
  process.env.RATE_LIMITS = 'true';
  const { AppModule } = await import('../../src/app.module.js');
  const { configureApp } = await import('../../src/app.setup.js');
  const { PrismaService } = await import('../../src/prisma/prisma.service.js');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = moduleRef.createNestApplication<NestExpressApplication>({
    bodyParser: false,
  });
  configureApp(app);
  await app.init();
  prisma = app.get(PrismaService);
  await prisma.rateLimit.deleteMany({});
});

afterAll(async () => {
  await prisma?.rateLimit.deleteMany({});
  await app?.close();
  process.env.RATE_LIMITS = 'false';
});

it('the 6th sign-in try in a minute is refused, counted in the database', async () => {
  const signIn = () =>
    request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('Origin', 'http://localhost:3001')
      .set('x-fct-side', 'customer')
      .send({ email: 'nobody@limits.test', password: 'Wrong-pass-123' });

  for (let i = 0; i < 5; i += 1) {
    expect((await signIn()).status).not.toBe(429);
  }
  expect((await signIn()).status).toBe(429);
  const rows = await prisma.rateLimit.findMany({});
  expect(rows.some((row) => row.key.includes('/sign-in/email'))).toBe(true);
});
