import { z } from 'zod';

/** "true"/"false" in .env, as a real true/false. */
const flag = (fallback: boolean) =>
  z
    .enum(['true', 'false'])
    .default(fallback ? 'true' : 'false')
    .transform((value) => value === 'true');

/**
 * Every setting the backend reads from `.env` (see `.env.example`).
 * They are checked when the app starts, so a missing or wrong value stops the
 * app with a clear message instead of failing later.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  /** The port the backend listens on. */
  PORT: z.coerce.number().int().positive().default(4000),
  /** The website's address. Only this address may call the backend from a browser. */
  FRONTEND_URL: z.url().default('http://localhost:3001'),
  /** This backend's own public address. Sign-in uses it. */
  BACKEND_URL: z.url().default('http://localhost:4000'),
  /** MariaDB address: mysql://USER:PASSWORD@HOST:PORT/DATABASE */
  DATABASE_URL: z
    .string()
    .regex(/^(mysql|mariadb):\/\//, 'must start with mysql:// or mariadb://'),

  /** Signs the sign-in cookies. A long random text, different on every server. */
  AUTH_SECRET: z
    .string()
    .min(32, 'must be at least 32 characters (a long random text)'),
  /**
   * Live only: the main domain, for example "yourdomain.com", so one sign-in
   * works on both yourdomain.com and api.yourdomain.com. Empty on a PC.
   */
  COOKIE_DOMAIN: z.string().optional(),
  /** Live only: true when the hosting's web server sits in front of the app. */
  TRUST_PROXY: flag(false),
  /** Limits on sign-in and password attempts. Only the browser tests turn it off. */
  RATE_LIMITS: flag(true),

  /** Email server. Mailpit in development. */
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  /** true for port 465. Port 587 upgrades to an encrypted connection by itself. */
  SMTP_SECURE: flag(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** The "from" name and address on every email. */
  EMAIL_FROM: z
    .string()
    .min(1)
    .default('FlyConnect Tech Support <info@flyconnecttech.co.uk>'),
  /** Folder for uploaded files. It must not be reachable from the web. */
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
});

export type Env = z.infer<typeof envSchema>;
