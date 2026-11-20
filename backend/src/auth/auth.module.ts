import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AUTH } from './auth.constants.js';
import { EmailService } from '../email/email.service.js';
import { createAuth } from './auth.js';
import { sendLockedNotice } from './locked-notice.js';
import { SessionGuard } from './session.guard.js';

/**
 * Sign-in for the whole backend. Every route is closed unless it says
 * otherwise (see decorators.ts): the guard runs on every request.
 */
@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, ConfigService, EmailService],
      useFactory: (
        prisma: PrismaService,
        config: ConfigService<Env, true>,
        email: EmailService,
      ) =>
        createAuth(
          prisma,
          {
            NODE_ENV: config.get('NODE_ENV'),
            FRONTEND_URL: config.get('FRONTEND_URL'),
            BACKEND_URL: config.get('BACKEND_URL'),
            AUTH_SECRET: config.get('AUTH_SECRET'),
            COOKIE_DOMAIN: config.get('COOKIE_DOMAIN'),
            RATE_LIMITS: config.get('RATE_LIMITS'),
          },
          {
            onLocked: (account) =>
              sendLockedNotice(
                email,
                config.get('FRONTEND_URL').replace(/\/$/, ''),
                account,
              ),
          },
        ),
    },
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  exports: [AUTH],
})
export class AuthModule {}
