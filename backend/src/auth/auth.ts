import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';
import type { Env } from '../config/env.js';
import type { PrismaClient } from '../generated/prisma/client.js';
import { authOptions } from './auth-options.js';

/** Where Better Auth's own routes live: /api/auth/sign-in/email and so on. */
export const AUTH_BASE_PATH = '/api/auth';

/** 30 days, for "Keep me signed in". Without it the cookie ends with the browser. */
const SESSION_DAYS = 30;

/**
 * Better Auth routes we do not use. Sign-up does not exist (invite-only),
 * password resets and invitations are our own (hashed, single-use links),
 * and people cannot change their own email, role or account here.
 */
const DISABLED_PATHS = [
  '/sign-up/email',
  '/sign-in/social',
  '/callback/:id',
  '/link-social',
  '/unlink-account',
  '/list-accounts',
  '/account-info',
  '/get-access-token',
  '/refresh-token',
  '/request-password-reset',
  '/reset-password',
  '/reset-password/:token',
  '/send-verification-email',
  '/verify-email',
  '/change-email',
  // Our own POST /me/password applies the password rules (profile.service.ts).
  '/change-password',
  '/update-user',
  '/delete-user',
  '/delete-user/callback',
  // The authenticator app is the only second factor (no email codes).
  '/two-factor/send-otp',
  '/two-factor/verify-otp',
];

export type Auth = ReturnType<typeof createAuth>;

export type AuthEnv = Pick<
  Env,
  | 'NODE_ENV'
  | 'FRONTEND_URL'
  | 'BACKEND_URL'
  | 'AUTH_SECRET'
  | 'COOKIE_DOMAIN'
  | 'RATE_LIMITS'
>;

export function createAuth(prisma: PrismaClient, env: AuthEnv) {
  return betterAuth({
    ...authOptions,
    database: prismaAdapter(prisma, { provider: 'mysql' }),
    secret: env.AUTH_SECRET,
    baseURL: env.BACKEND_URL,
    basePath: AUTH_BASE_PATH,
    trustedOrigins: [env.FRONTEND_URL],
    disabledPaths: DISABLED_PATHS,
    session: {
      expiresIn: 60 * 60 * 24 * SESSION_DAYS,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: env.RATE_LIMITS,
      storage: 'memory',
      window: 60,
      max: 100,
      // Password and code guessing: a few tries a minute per address.
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/two-factor/verify-totp': { window: 60, max: 5 },
        '/two-factor/verify-backup-code': { window: 60, max: 5 },
        '/two-factor/enable': { window: 60, max: 5 },
        '/change-password': { window: 60, max: 5 },
      },
    },
    advanced: {
      ...authOptions.advanced,
      cookiePrefix: 'fct',
      useSecureCookies: env.NODE_ENV === 'production',
      // Live: one sign-in for yourdomain.com and api.yourdomain.com.
      crossSubDomainCookies: env.COOKIE_DOMAIN
        ? { enabled: true, domain: env.COOKIE_DOMAIN }
        : undefined,
    },
    databaseHooks: {
      session: {
        create: {
          // Only active accounts may sign in: not invited ones, not disabled ones.
          before: async (session) => {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { status: true },
            });
            if (user?.status !== 'ACTIVE') {
              throw new APIError('FORBIDDEN', {
                message: 'This account is not active.',
              });
            }
          },
        },
      },
    },
  });
}
