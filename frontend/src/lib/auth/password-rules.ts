/**
 * Password rules (docs/01, "Accept invitation"). The backend checks the same
 * three rules (backend/src/accounts/password-rules.ts): keep them in step.
 */
export const passwordRules = [
  {
    label: "At least 10 characters",
    test: (value: string) => value.length >= 10,
  },
  {
    label: "Upper and lower case letters",
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  {
    label: "At least one number or symbol",
    test: (value: string) => /[^A-Za-z]/.test(value),
  },
] as const;

export function meetsPasswordRules(value: string): boolean {
  return passwordRules.every((rule) => rule.test(value));
}
