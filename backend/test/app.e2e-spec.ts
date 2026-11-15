import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

// Smoke test: the whole app starts, set up exactly as the live server.
// The database is replaced by a stand-in, so this runs without Docker.
// The test settings come from test/setup-env.ts.
describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /health answers ok without signing in', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('previews every email at /dev/emails outside production', async () => {
    const http = request(app.getHttpServer());
    const list = await http.get('/dev/emails').expect(200);
    expect(list.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'daily-digest',
          subject: '2 requests waiting for review',
        }),
      ]),
    );
    const html = await http.get('/dev/emails/daily-digest').expect(200);
    expect(html.headers['content-type']).toMatch(/^text\/html/);
    expect(html.text).toContain('Requests waiting for review');
    const text = await http
      .get('/dev/emails/daily-digest?format=text')
      .expect(200);
    expect(text.headers['content-type']).toMatch(/^text\/plain/);
    expect(text.text).toContain('TKT-2026-00125');
    await http.get('/dev/emails/nothing-like-this').expect(404);
  });

  it('every other route needs a signed-in person', () => {
    return request(app.getHttpServer())
      .get('/me')
      .expect(401)
      .expect((response) => {
        expect(response.body.code).toBe('SIGNED_OUT');
      });
  });

  it('there is no sign-up route', () => {
    return request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .send({ email: 'a@example.com', password: 'Skyline-2027', name: 'A' })
      .expect((response) => {
        expect([403, 404]).toContain(response.status);
      });
  });

  it('checks the input of public account routes', () => {
    return request(app.getHttpServer())
      .post('/accounts/password/forgot')
      .send({ email: 'not-an-email' })
      .expect(400);
  });
});
