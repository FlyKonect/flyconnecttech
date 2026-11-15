import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { AUTH } from './auth/auth.constants.js';
import { AUTH_BASE_PATH, type Auth } from './auth/auth.js';
import type { Env } from './config/env.js';
import { securityHeaders } from './security/security-headers.js';

/**
 * Settings shared by the real server and the whole-app tests, so the tests
 * run the app exactly as it runs live. Create the app with
 * { bodyParser: false }: this function adds the body readers itself.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Live, the hosting's web server sits in front of the app: trust it for
  // the visitor's real address (used by the request limits).
  if (config.get('TRUST_PROXY')) app.set('trust proxy', 1);

  // Security headers on every answer, and no "X-Powered-By: Express".
  const express = app.getHttpAdapter().getInstance();
  express.disable('x-powered-by');
  app.use(
    securityHeaders({ production: config.get('NODE_ENV') === 'production' }),
  );

  // Only the website may call the backend from a browser, with its cookies.
  app.enableCors({ origin: config.get('FRONTEND_URL'), credentials: true });

  // Better Auth reads the raw request itself, so its routes are mounted
  // before the body readers that every other route uses.
  const auth = app.get<Auth>(AUTH);
  express.all(`${AUTH_BASE_PATH}/{*path}`, toNodeHandler(auth));
  app.useBodyParser('json', { limit: '1mb' });
  app.useBodyParser('urlencoded', { extended: false, limit: '1mb' });

  // Every @Body({ schema }) is checked with its Zod rules.
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
}
