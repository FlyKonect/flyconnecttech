import { createHash } from 'node:crypto';
import type { AccountSide, Role } from '../generated/prisma/client.js';

/**
 * Customer accounts and team accounts are separate (docs/02): one email can
 * have one of each, with its own password. Better Auth finds people by a
 * single unique "email", so each account gives it a private key instead,
 * made from the side and the real email. People never see or type it.
 *
 * The migration "account_sides" fills in existing accounts with the same
 * recipe in SQL: keep the two in step.
 */
export function loginKeyFor(email: string, side: AccountSide): string {
  const hash = createHash('sha256').update(normaliseEmail(email)).digest('hex');
  return `${side === 'CUSTOMER' ? 'c' : 't'}.${hash}@accounts.invalid`;
}

/** Customers sign in on the client portal; everyone else on the team panel. */
export function sideOfRole(role: Role): AccountSide {
  return role === 'CUSTOMER' ? 'CUSTOMER' : 'TEAM';
}

/** Emails are kept lower-case, without spaces around them. */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * The side a sign-in page asks for, from the request header the website
 * sends (x-fct-side: "customer" or "team"). Anything else: not said.
 */
export function sideFromHeader(value: string | null | undefined) {
  if (value === 'customer') return 'CUSTOMER' as const;
  if (value === 'team') return 'TEAM' as const;
  return null;
}

/** The request header a sign-in page uses to say which side it is. */
export const SIDE_HEADER = 'x-fct-side';
