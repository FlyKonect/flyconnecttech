import {
  averageBetween,
  countChange,
  dayWords,
  firstResponseChange,
  reopenedShare,
  resolutionChange,
  resolutionWords,
  ukWeek,
} from './report-math.js';

const DAY = 24 * 60;

describe('the words on Reports & Analytics', () => {
  it('compares the first response with last month', () => {
    expect(firstResponseChange(82, 100, 'October')).toEqual({
      text: '18% faster than October',
      tone: 'better',
    });
    expect(firstResponseChange(118, 100, 'October')).toEqual({
      text: '18% slower than October',
      tone: 'worse',
    });
    expect(firstResponseChange(100, 100, 'October')?.text).toBe(
      'Same as October',
    );
    expect(firstResponseChange(100, null, 'October')).toBeNull();
    expect(firstResponseChange(null, 100, 'October')).toBeNull();
  });

  it('writes resolution times in days, or hours under a day', () => {
    expect(resolutionWords(2.6 * DAY)).toBe('2.6 days');
    expect(resolutionWords(DAY)).toBe('1 day');
    expect(resolutionWords(18 * 60)).toBe('18h');
    expect(resolutionWords(45)).toBe('45m');
    expect(dayWords(2)).toBe('2 days');
  });

  it('compares resolution times in days', () => {
    expect(resolutionChange(2.6 * DAY, 3 * DAY)).toEqual({
      text: '0.4 days faster',
      tone: 'better',
    });
    expect(resolutionChange(3 * DAY, 2 * DAY)).toEqual({
      text: '1 day slower',
      tone: 'worse',
    });
    expect(resolutionChange(DAY, DAY + 30)?.text).toBe('Same as last month');
  });

  it('compares counts with last month', () => {
    expect(countChange(38, 32)).toEqual({
      text: '+6 vs last month',
      tone: 'better',
    });
    expect(countChange(30, 32)).toEqual({
      text: '−2 vs last month',
      tone: 'worse',
    });
    expect(countChange(5, 5).text).toBe('Same as last month');
  });

  it('gives reopened requests as a share of resolved ones', () => {
    expect(reopenedShare(2, 38)).toBe('5% of resolved');
    expect(reopenedShare(0, 0)).toBeNull();
  });

  it('averages the time between two moments', () => {
    const from = new Date('2026-11-01T09:00:00Z');
    expect(
      averageBetween([
        { from, to: new Date('2026-11-01T10:00:00Z') },
        { from, to: new Date('2026-11-01T12:00:00Z') },
        { from, to: null },
      ]),
    ).toBe(120);
    expect(averageBetween([])).toBeNull();
  });
});

describe('this UK week', () => {
  it('runs from Monday to Sunday, at UK midnight', () => {
    // Thursday 12 November 2026 (GMT).
    const { days, end } = ukWeek(new Date('2026-11-12T15:00:00Z'));
    expect(days[0].toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(days[6].toISOString()).toBe('2026-11-15T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-16T00:00:00.000Z');
  });

  it('follows the clock change at the end of October', () => {
    // Wednesday 21 October 2026: the clocks go back on Sunday 25 October.
    const { days, end } = ukWeek(new Date('2026-10-21T12:00:00Z'));
    // Monday to Sunday start in summer time (UTC+1)…
    expect(days[0].toISOString()).toBe('2026-10-18T23:00:00.000Z');
    expect(days[6].toISOString()).toBe('2026-10-24T23:00:00.000Z');
    // …and the next Monday in winter time, so that Sunday has 25 hours.
    expect(end.toISOString()).toBe('2026-10-26T00:00:00.000Z');
  });

  it('treats Sunday as the last day of the week', () => {
    const { days } = ukWeek(new Date('2026-11-15T20:00:00Z'));
    expect(days[0].toISOString()).toBe('2026-11-09T00:00:00.000Z');
  });
});
