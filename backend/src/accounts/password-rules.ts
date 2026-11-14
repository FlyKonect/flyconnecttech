import { z } from 'zod';

/**
 * Password rules (docs/01, "Accept invitation"): at least 10 characters,
 * upper and lower case letters, and at least one number or symbol.
 * The frontend shows the same three rules as a checklist.
 */
export const passwordRules = [
  {
    message: 'At least 10 characters',
    test: (value: string) => value.length >= 10,
  },
  {
    message: 'Upper and lower case letters',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    message: 'At least one number or symbol',
    test: (value: string) => /[^A-Za-z]/.test(value),
  },
] as const;

export const newPasswordSchema = z
  .string()
  // Long enough for any passphrase; scrypt hashing of huge inputs is slow.
  .max(128, 'Use at most 128 characters')
  .superRefine((value, ctx) => {
    for (const rule of passwordRules) {
      if (!rule.test(value))
        ctx.addIssue({ code: 'custom', message: rule.message });
    }
  });
