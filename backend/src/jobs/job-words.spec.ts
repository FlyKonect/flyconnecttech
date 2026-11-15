import { dueWords, requestCount, waitingFor } from './job-words.js';

describe('the words in the scheduled emails', () => {
  const now = new Date('2026-11-09T09:00:00Z');
  const hoursAgo = (hours: number) =>
    new Date(now.getTime() - hours * 3_600_000);

  it('counts requests', () => {
    expect(requestCount(1)).toBe('1 request');
    expect(requestCount(3)).toBe('3 requests');
  });

  it('says how long a request has waited', () => {
    expect(waitingFor(hoursAgo(0.5), now)).toBe('Waiting under an hour');
    expect(waitingFor(hoursAgo(1), now)).toBe('Waiting 1 hour');
    expect(waitingFor(hoursAgo(5), now)).toBe('Waiting 5 hours');
    expect(waitingFor(hoursAgo(30), now)).toBe('Waiting 1 day');
    expect(waitingFor(hoursAgo(50), now)).toBe('Waiting 2 days');
  });

  it('gives the SLA due time in UK time, or Overdue', () => {
    expect(dueWords(null, now)).toBeNull();
    expect(dueWords(hoursAgo(1), now)).toBe('Overdue');
    expect(dueWords(new Date('2026-11-10T14:00:00Z'), now)).toBe(
      'Due Tue 10 Nov, 14:00',
    );
  });
});
