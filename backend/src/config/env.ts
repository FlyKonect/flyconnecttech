import { z } from 'zod';

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
  /** MariaDB address: mysql://USER:PASSWORD@HOST:PORT/DATABASE */
  DATABASE_URL: z
    .string()
    .regex(/^(mysql|mariadb):\/\//, 'must start with mysql:// or mariadb://'),
  /** Email server. Mailpit in development. */
  SMTP_HOST: z.string().min(1).default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  /** The "from" name and address on every email. */
  EMAIL_FROM: z
    .string()
    .min(1)
    .default('FlyConnect Tech <hello@yourdomain.com>'),
  /** Folder for uploaded files. It must not be reachable from the web. */
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
});

export type Env = z.infer<typeof envSchema>;
