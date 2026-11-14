import { betterAuth } from 'better-auth';
import { authOptions } from './auth-options.js';

/**
 * Only for Better Auth's schema tool, which reads this file to know which
 * sign-in tables to create. The app does not use it.
 *
 *   npx auth generate --config src/auth/auth.schema.ts --adapter prisma --dialect mysql
 */
export const auth = betterAuth(authOptions);
