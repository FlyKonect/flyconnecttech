import { RateLimiter } from './rate-limit.js';

describe('RateLimiter', () => {
  const rule = { limit: 3, perSeconds: 60 };

  it('allows up to the limit, then refuses', () => {
    const limiter = new RateLimiter();
    const now = 1_000_000;
    expect(limiter.hit('1.2.3.4 POST /x', rule, now)).toBe(true);
    expect(limiter.hit('1.2.3.4 POST /x', rule, now + 1)).toBe(true);
    expect(limiter.hit('1.2.3.4 POST /x', rule, now + 2)).toBe(true);
    expect(limiter.hit('1.2.3.4 POST /x', rule, now + 3)).toBe(false);
  });

  it('counts each address and route separately', () => {
    const limiter = new RateLimiter();
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) limiter.hit('1.2.3.4 POST /x', rule, now);
    expect(limiter.hit('5.6.7.8 POST /x', rule, now)).toBe(true);
    expect(limiter.hit('1.2.3.4 POST /y', rule, now)).toBe(true);
  });

  it('starts again after the time window', () => {
    const limiter = new RateLimiter();
    const now = 1_000_000;
    for (let i = 0; i < 4; i++) limiter.hit('k', rule, now);
    expect(limiter.hit('k', rule, now + 59_000)).toBe(false);
    expect(limiter.hit('k', rule, now + 60_000)).toBe(true);
  });
});
