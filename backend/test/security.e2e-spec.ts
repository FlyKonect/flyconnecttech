import {
  DiscoveryModule,
  DiscoveryService,
  MetadataScanner,
} from '@nestjs/core';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/app.setup.js';
import { AREA, PUBLIC } from './../src/auth/decorators.js';
import { PrismaService } from './../src/prisma/prisma.service.js';
import { API_POLICY } from './../src/security/security-headers.js';

// Security checks on the whole app: the headers on every answer, and that
// no route is open by mistake. The database is a stand-in, as in
// app.e2e-spec.ts, so this runs without Docker.

type Route = {
  method: string;
  path: string;
  isPublic: boolean;
  area: string | undefined;
};

/**
 * The only routes open without signing in. A new @Public() route must be
 * added here on purpose.
 */
const PUBLIC_ROUTES = [
  'GET /health',
  'GET /dev/emails',
  'GET /dev/emails/:key',
  'GET /accounts/invitations/:token',
  'POST /accounts/invitations/:token/accept',
  'POST /accounts/password/forgot',
  'GET /accounts/password/reset/:token',
  'POST /accounts/password/reset/:token',
  'GET /leads/demo-slots',
  'POST /leads/demo',
  'POST /leads/quote',
  'POST /leads/message',
  'GET /website',
];

const join = (...parts: (string | undefined)[]) =>
  '/' +
  parts
    .flatMap((part) => (part ?? '').split('/'))
    .filter(Boolean)
    .join('/');

/** Every controller route, with its @Public() and @Area() marks. */
function listRoutes(app: NestExpressApplication): Route[] {
  const discovery = app.get(DiscoveryService);
  const scanner = new MetadataScanner();
  const routes: Route[] = [];
  for (const wrapper of discovery.getControllers()) {
    const { instance, metatype } = wrapper;
    if (!instance || !metatype) continue;
    const base = Reflect.getMetadata(PATH_METADATA, metatype) as string;
    const prototype = Object.getPrototypeOf(instance) as object;
    for (const name of scanner.getAllMethodNames(prototype)) {
      const handler = (prototype as Record<string, unknown>)[name] as object;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as
        RequestMethod | undefined;
      if (method === undefined) continue;
      const path = Reflect.getMetadata(PATH_METADATA, handler) as string;
      const mark = <T>(key: string) =>
        (Reflect.getMetadata(key, handler) ??
          Reflect.getMetadata(key, metatype)) as T | undefined;
      routes.push({
        method: RequestMethod[method],
        path: join(base, path),
        isPublic: mark<boolean>(PUBLIC) === true,
        area: mark<string>(AREA),
      });
    }
  }
  return routes;
}

describe('Security (e2e)', () => {
  let app: NestExpressApplication;
  let routes: Route[];

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, DiscoveryModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>({
      bodyParser: false,
    });
    configureApp(app);
    await app.init();
    routes = listRoutes(app);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('sends the security headers on every answer', async () => {
    const http = request(app.getHttpServer());
    for (const answer of [
      await http.get('/health'),
      await http.get('/me'),
      await http.get('/api/auth/get-session'),
    ]) {
      expect(answer.headers['x-content-type-options']).toBe('nosniff');
      expect(answer.headers['x-frame-options']).toBe('DENY');
      expect(answer.headers['referrer-policy']).toBe('no-referrer');
      expect(answer.headers['content-security-policy']).toBe(API_POLICY);
      expect(answer.headers['x-powered-by']).toBeUndefined();
    }
  });

  it('the email previews are pages, so they keep their own styles', async () => {
    const answer = await request(app.getHttpServer()).get(
      '/dev/emails/daily-digest',
    );
    expect(answer.headers['content-security-policy']).toBeUndefined();
    expect(answer.headers['x-content-type-options']).toBe('nosniff');
  });

  it('finds every route', () => {
    // A sanity check that the list below is not empty by mistake.
    expect(routes.length).toBeGreaterThan(50);
  });

  it('only the expected routes are public', () => {
    const open = routes
      .filter((route) => route.isPublic)
      .map((route) => `${route.method} ${route.path}`)
      .sort();
    expect(open).toEqual([...PUBLIC_ROUTES].sort());
  });

  it('every team route is for the team, and every portal route for customers', () => {
    for (const route of routes) {
      if (route.path.startsWith('/team/')) {
        expect(`${route.path}: ${route.area}`).toBe(`${route.path}: team`);
      }
      if (route.path.startsWith('/portal/')) {
        expect(`${route.path}: ${route.area}`).toBe(`${route.path}: portal`);
      }
    }
  });

  it('every other route answers "signed out" without a session', async () => {
    const http = request(app.getHttpServer());
    for (const route of routes.filter((r) => !r.isPublic)) {
      // A made-up value for each changing part, like :code.
      const path = route.path.replace(/:\w+/g, 'TKT-2026-00001');
      const call = http[route.method.toLowerCase() as 'get'](path);
      const answer = await call.send({});
      expect(`${route.method} ${route.path}: ${answer.status}`).toBe(
        `${route.method} ${route.path}: 401`,
      );
      expect(answer.body.code).toBe('SIGNED_OUT');
    }
  });
});
