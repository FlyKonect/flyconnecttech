import type { BetterAuthOptions } from 'better-auth';
import { twoFactor } from 'better-auth/plugins';

/**
 * Sign-in settings shared by the app and Better Auth's schema tool.
 *
 * Phase 3 only uses this to create the sign-in tables. Phase 4 adds the
 * database connection, the secret, sessions, emails and the routes.
 */
export const authOptions = {
  appName: 'FlyConnect Tech',
  emailAndPassword: {
    enabled: true,
    // Invite-only: staff create every account (docs/01, section 3).
    disableSignUp: true,
  },
  plugins: [twoFactor({ issuer: 'FlyConnect Tech' })],
  user: {
    // Our fields that sign-in needs to know about, so they come back with the
    // signed-in person. The other fields on users (docs/02) are read and
    // written by our own services, not by Better Auth.
    // input: false means a person can never set them on themselves.
    additionalFields: {
      role: { type: 'string', required: true, input: false },
      status: { type: 'string', required: true, input: false },
      customerId: { type: 'string', required: false, input: false },
      jobTitle: { type: 'string', required: false, input: false },
      timezone: {
        type: 'string',
        required: false,
        defaultValue: 'Europe/London',
        input: false,
      },
    },
  },
  advanced: {
    // UUIDs, like every other table (docs/02).
    database: { generateId: 'uuid' },
  },
} satisfies BetterAuthOptions;
