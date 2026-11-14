import { newPasswordSchema } from './password-rules.js';
import { hashToken, looksLikeToken, newToken } from './tokens.js';

const problems = (password: string) => {
  const result = newPasswordSchema.safeParse(password);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.message);
};

describe('password rules', () => {
  it('accepts a password that meets all three rules', () => {
    expect(problems('Skyline-2027')).toEqual([]);
    expect(problems('Bluewave2026')).toEqual([]);
  });

  it('needs at least 10 characters', () => {
    expect(problems('Sky-2027')).toEqual(['At least 10 characters']);
  });

  it('needs upper and lower case letters', () => {
    expect(problems('skyline-2027')).toEqual(['Upper and lower case letters']);
    expect(problems('SKYLINE-2027')).toEqual(['Upper and lower case letters']);
  });

  it('needs a number or a symbol', () => {
    expect(problems('SkylineBlue')).toEqual(['At least one number or symbol']);
    expect(problems('Skyline Blue')).toEqual([]);
  });

  it('lists every rule that fails', () => {
    expect(problems('abc')).toEqual([
      'At least 10 characters',
      'Upper and lower case letters',
      'At least one number or symbol',
    ]);
  });
});

describe('link tokens', () => {
  it('are random, URL-safe and stored only as a hash', () => {
    const a = newToken();
    const b = newToken();
    expect(a.token).not.toBe(b.token);
    expect(looksLikeToken(a.token)).toBe(true);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hash).not.toContain(a.token);
    expect(hashToken(a.token)).toBe(a.hash);
  });

  it('rejects anything that is not a token', () => {
    expect(looksLikeToken('')).toBe(false);
    expect(looksLikeToken('short')).toBe(false);
    expect(looksLikeToken('a'.repeat(42) + '!')).toBe(false);
  });
});
