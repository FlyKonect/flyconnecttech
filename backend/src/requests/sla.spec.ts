import { defaultSettings } from '../settings/defaults.js';
import {
  addBusinessDays,
  dueTime,
  parseTarget,
  resolveDueTime,
  resumedDueTime,
} from './sla.js';

const targets = defaultSettings.responseTargets;
const at = (iso: string) => new Date(iso);

describe('parseTarget', () => {
  it('reads minutes, hours and business days', () => {
    expect(parseTarget('45m')).toEqual({ minutes: 45 });
    expect(parseTarget('4h')).toEqual({ minutes: 240 });
    expect(parseTarget('2bd')).toEqual({ businessDays: 2 });
    expect(parseTarget(' 1 BD ')).toEqual({ businessDays: 1 });
  });

  it('refuses anything else', () => {
    for (const text of ['', '0h', 'soon', '1 day', '-2h', '1.5h']) {
      expect(parseTarget(text)).toBeNull();
    }
  });
});

describe('addBusinessDays (UK time)', () => {
  it('keeps the time of day on weekdays', () => {
    // Tuesday 10 November 2026, 09:12 UK (GMT).
    expect(addBusinessDays(at('2026-11-10T09:12:00Z'), 1)).toEqual(
      at('2026-11-11T09:12:00Z'),
    );
  });

  it('skips the weekend: Friday 15:00 + 1 is Monday 15:00', () => {
    expect(addBusinessDays(at('2026-11-13T15:00:00Z'), 1)).toEqual(
      at('2026-11-16T15:00:00Z'),
    );
    expect(addBusinessDays(at('2026-11-13T15:00:00Z'), 2)).toEqual(
      at('2026-11-17T15:00:00Z'),
    );
  });

  it('counts a weekend start from Monday 00:00', () => {
    // Saturday 14 November, 10:00 UK: + 1 business day = Tuesday 00:00.
    expect(addBusinessDays(at('2026-11-14T10:00:00Z'), 1)).toEqual(
      at('2026-11-17T00:00:00Z'),
    );
    // Sunday works the same.
    expect(addBusinessDays(at('2026-11-15T23:30:00Z'), 1)).toEqual(
      at('2026-11-17T00:00:00Z'),
    );
  });

  it('uses UK time, not UTC, near midnight in summer', () => {
    // Friday 3 July 2026, 23:30 UTC is Saturday 00:30 in the UK (BST),
    // so the counting starts on Monday 00:00 UK = Sunday 23:00 UTC.
    expect(addBusinessDays(at('2026-07-03T23:30:00Z'), 1)).toEqual(
      at('2026-07-06T23:00:00Z'),
    );
  });

  it('keeps the UK clock time across the October clock change', () => {
    // Friday 23 October 2026, 10:00 BST (09:00 UTC) + 1 business day is
    // Monday 26 October, 10:00 GMT (10:00 UTC).
    expect(addBusinessDays(at('2026-10-23T09:00:00Z'), 1)).toEqual(
      at('2026-10-26T10:00:00Z'),
    );
  });
});

describe('dueTime', () => {
  const created = at('2026-11-13T15:00:00Z'); // a Friday afternoon

  it('counts hours around the clock', () => {
    expect(dueTime(created, 'URGENT', targets)).toEqual(
      at('2026-11-13T16:00:00Z'),
    );
    expect(dueTime(created, 'HIGH', targets)).toEqual(
      at('2026-11-13T19:00:00Z'),
    );
  });

  it('counts business days for Medium and Low', () => {
    expect(dueTime(created, 'MEDIUM', targets)).toEqual(
      at('2026-11-16T15:00:00Z'),
    );
    expect(dueTime(created, 'LOW', targets)).toEqual(
      at('2026-11-17T15:00:00Z'),
    );
  });

  it('falls back to the default when a saved target is broken', () => {
    expect(
      dueTime(created, 'URGENT', { ...targets, URGENT: 'whenever' }),
    ).toEqual(at('2026-11-13T16:00:00Z'));
  });
});

describe('resumedDueTime', () => {
  it('moves the due time later by the time spent waiting', () => {
    expect(
      resumedDueTime(
        at('2026-11-13T16:00:00Z'),
        at('2026-11-13T15:30:00Z'),
        at('2026-11-14T15:30:00Z'),
      ),
    ).toEqual(at('2026-11-14T16:00:00Z'));
  });
});

describe('bank holidays and the fix clock', () => {
  const at = (iso: string) => new Date(iso);
  it('skips a bank holiday like a weekend', () => {
    // Thursday 24 Dec 2026 10:00 + 1: Friday 25 and Monday 28 are holidays.
    expect(
      addBusinessDays(at('2026-12-24T10:00:00Z'), 1, [
        '2026-12-25',
        '2026-12-28',
      ]),
    ).toEqual(at('2026-12-29T10:00:00Z'));
  });

  it('a start on a bank holiday counts from the next business day at 00:00', () => {
    expect(
      addBusinessDays(at('2026-12-25T10:00:00Z'), 1, [
        '2026-12-25',
        '2026-12-28',
      ]),
    ).toEqual(at('2026-12-30T00:00:00Z'));
  });

  it('the fix clock uses the resolution targets', () => {
    // Tuesday 10 Nov 2026, 09:00 UK; High: 3 business days.
    expect(
      resolveDueTime(
        at('2026-11-10T09:00:00Z'),
        'HIGH',
        defaultSettings.resolutionTargets,
      ),
    ).toEqual(at('2026-11-13T09:00:00Z'));
  });
});
