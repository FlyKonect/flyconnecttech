import { createHash, randomBytes } from 'node:crypto';

/** Invitation and password reset links last this long (docs/01, section 3). */
export const LINK_LIFETIME_HOURS = 48;

/**
 * A new secret for a link. Only `hash` is saved: someone who reads the
 * database still cannot use the links in it.
 */
export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** A token as it appears in a link: 43 URL-safe characters. */
export function looksLikeToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function linkExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + LINK_LIFETIME_HOURS * 60 * 60 * 1000);
}
