import { averageMinutes, byUrgency, ukMonth } from './dashboard-math.js';

describe('ukMonth', () => {
  it('gives this month and the month before, in UK time', () => {
    const now = new Date('2026-11-09T10:00:00Z');
    expect(ukMonth(now)).toEqual({
      start: new Date('2026-11-01T00:00:00Z'),
      end: new Date('2026-12-01T00:00:00Z'),
    });
    // 1 October is in UK summer time, so it starts at 23:00 UTC the day before.
    expect(ukMonth(now, -1)).toEqual({
      start: new Date('2026-09-30T23:00:00Z'),
      end: new Date('2026-11-01T00:00:00Z'),
    });
  });

  it('goes back across the new year', () => {
    expect(ukMonth(new Date('2027-01-15T12:00:00Z'), -1).start).toEqual(
      new Date('2026-12-01T00:00:00Z'),
    );
  });

  it('a UTC time just before midnight can already be next month in the UK', () => {
    // 31 August 23:30 UTC is 1 September 00:30 in the UK.
    expect(ukMonth(new Date('2026-08-31T23:30:00Z')).start).toEqual(
      new Date('2026-08-31T23:00:00Z'),
    );
  });
});

describe('averageMinutes', () => {
  it('averages the time to the first reply', () => {
    const at = (iso: string) => new Date(iso);
    expect(
      averageMinutes([
        {
          createdAt: at('2026-11-02T10:00:00Z'),
          firstResponseAt: at('2026-11-02T11:30:00Z'),
        },
        {
          createdAt: at('2026-11-03T09:00:00Z'),
          firstResponseAt: at('2026-11-03T10:54:00Z'),
        },
      ]),
    ).toBe(102); // 1h 42m
  });

  it('is empty without replies', () => {
    expect(averageMinutes([])).toBeNull();
    expect(
      averageMinutes([{ createdAt: new Date(), firstResponseAt: null }]),
    ).toBeNull();
  });
});

describe('byUrgency', () => {
  it('puts urgent first, then the earliest due', () => {
    const rows = [
      { code: 'a', priority: 'MEDIUM' as const, dueAt: new Date(1000) },
      { code: 'b', priority: 'HIGH' as const, dueAt: new Date(5000) },
      { code: 'c', priority: 'HIGH' as const, dueAt: new Date(2000) },
      { code: 'd', priority: 'URGENT' as const, dueAt: null },
    ];
    expect(rows.sort(byUrgency).map((row) => row.code)).toEqual([
      'd',
      'c',
      'b',
      'a',
    ]);
  });
});
