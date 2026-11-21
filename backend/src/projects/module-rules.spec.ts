import {
  isLate,
  MAIN_PATH,
  reviewSchema,
  stageMove,
  stagesFor,
} from './module-rules.js';

describe('module stages', () => {
  it('admins choose any stage; developers the working ones; others none', () => {
    expect(stagesFor('ADMIN')).toContain('DONE');
    expect(stagesFor('SUPER_ADMIN')).toContain('NOT_STARTED');
    expect(stagesFor('DEVELOPER')).toEqual([
      'DESIGN',
      'DEVELOPMENT',
      'TESTING',
      'RETEST',
      'CLIENT_REVIEW',
    ]);
    expect(stagesFor('MANAGER')).toEqual([]);
    expect(stagesFor('CUSTOMER')).toEqual([]);
    expect(MAIN_PATH).toEqual([
      'DESIGN',
      'DEVELOPMENT',
      'TESTING',
      'CLIENT_REVIEW',
      'DONE',
    ]);
  });

  it('asking for changes starts a new round, once', () => {
    const review = { stage: 'CLIENT_REVIEW' as const, round: 1, doneAt: null };
    const changes = stageMove(review, 'CHANGES_REQUESTED');
    expect(changes.round).toBe(2);
    expect(
      stageMove({ ...changes, stage: 'CHANGES_REQUESTED' }, 'CHANGES_REQUESTED')
        .round,
    ).toBe(2);
    expect(
      stageMove({ ...changes, stage: 'RETEST' }, 'CLIENT_REVIEW').round,
    ).toBe(2);
  });

  it('Done keeps its first date; leaving Done clears it', () => {
    const now = new Date('2026-11-21T10:00:00Z');
    const done = stageMove(
      { stage: 'CLIENT_REVIEW', round: 1, doneAt: null },
      'DONE',
      now,
    );
    expect(done.doneAt).toEqual(now);
    expect(
      stageMove({ ...done, stage: 'DONE' }, 'DONE', new Date()).doneAt,
    ).toEqual(now);
    expect(
      stageMove({ ...done, stage: 'DONE' }, 'DEVELOPMENT').doneAt,
    ).toBeNull();
  });

  it('is late when the target day has passed and it is not Done', () => {
    const now = new Date('2026-11-21T10:00:00Z');
    const target = new Date('2026-11-20T00:00:00Z');
    expect(isLate({ stage: 'TESTING', targetDate: target }, now)).toBe(true);
    expect(isLate({ stage: 'DONE', targetDate: target }, now)).toBe(false);
    expect(
      isLate(
        { stage: 'TESTING', targetDate: new Date('2026-11-21T00:00:00Z') },
        now,
      ),
    ).toBe(false);
    expect(isLate({ stage: 'TESTING', targetDate: null }, now)).toBe(false);
  });

  it('asking for changes needs a note; approving does not', () => {
    expect(reviewSchema.safeParse({ decision: 'approve' }).success).toBe(true);
    expect(reviewSchema.safeParse({ decision: 'changes' }).success).toBe(false);
    expect(
      reviewSchema.safeParse({ decision: 'changes', note: 'Show the fee' })
        .success,
    ).toBe(true);
  });
});
