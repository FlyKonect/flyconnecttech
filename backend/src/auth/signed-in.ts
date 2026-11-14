import type { Role, UserStatus } from '../generated/prisma/client.js';

/** The signed-in person, as SessionGuard puts it on the request. */
export type SignedIn = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  customerId: string | null;
  jobTitle: string | null;
  timezone: string;
  twoFactorEnabled: boolean;
  sessionId: string;
};
