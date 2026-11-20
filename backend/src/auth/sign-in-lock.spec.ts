import {
  afterFailure,
  isLocked,
  LOCK_AFTER_FAILURES,
  type FailureState,
} from './sign-in-lock.js';

const start: FailureState = {
  failedSignIns: 0,
  failedSignInsSince: null,
  lockedUntil: null,
};
const at = (minutes: number) =>
  new Date(Date.UTC(2026, 10, 20, 9, 0) + minutes * 60_000);

describe('the account lock', () => {
  it('locks for 15 minutes on the 10th wrong password within 15 minutes', () => {
    let state: FailureState = start;
    for (let i = 1; i < LOCK_AFTER_FAILURES; i += 1) {
      const next = afterFailure(state, at(i));
      expect(next.locked).toBe(false);
      state = next;
    }
    const last = afterFailure(state, at(10));
    expect(last.locked).toBe(true);
    expect(last.lockedUntil).toEqual(at(25));
    expect(isLocked(last.lockedUntil, at(24))).toBe(true);
    expect(isLocked(last.lockedUntil, at(26))).toBe(false);
  });

  it('starts counting again when the first wrong try is older than 15 minutes', () => {
    const early = { ...start, failedSignIns: 9, failedSignInsSince: at(0) };
    const later = afterFailure(early, at(16));
    expect(later).toMatchObject({ failedSignIns: 1, locked: false });
    expect(later.failedSignInsSince).toEqual(at(16));
  });
});
