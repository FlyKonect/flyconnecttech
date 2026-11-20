/**
 * The account lock (audit, Phase 2): after 10 wrong passwords for one
 * account within 15 minutes, that account cannot sign in for 15 minutes,
 * whatever the address the tries come from. Its owner gets an email. A
 * successful sign-in or a password reset clears the count.
 *
 * Better Auth's own limits (5 tries a minute from one address, auth.ts)
 * still apply on top; this one stops slow guessing from many addresses.
 */

export const LOCK_AFTER_FAILURES = 10;
export const FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_FOR_MS = 15 * 60 * 1000;

export const LOCKED_MESSAGE =
  'Too many wrong passwords. This account is locked for 15 minutes. Try again later, or reset your password.';

export type FailureState = {
  failedSignIns: number;
  failedSignInsSince: Date | null;
  lockedUntil: Date | null;
};

export function isLocked(lockedUntil: Date | null, now: Date): boolean {
  return lockedUntil !== null && lockedUntil > now;
}

/** The account's state after one more wrong password. */
export function afterFailure(
  state: FailureState,
  now: Date,
): FailureState & { locked: boolean } {
  const since = state.failedSignInsSince;
  const fresh = !since || now.getTime() - since.getTime() > FAILURE_WINDOW_MS;
  const count = fresh ? 1 : state.failedSignIns + 1;
  if (count >= LOCK_AFTER_FAILURES) {
    return {
      failedSignIns: 0,
      failedSignInsSince: null,
      lockedUntil: new Date(now.getTime() + LOCK_FOR_MS),
      locked: true,
    };
  }
  return {
    failedSignIns: count,
    failedSignInsSince: fresh ? now : since,
    lockedUntil: state.lockedUntil,
    locked: false,
  };
}
