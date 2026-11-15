import { z } from 'zod';

/**
 * A customer's "Email me when" choices (screen 15). Stored on the user as
 * JSON; anything missing takes the design's default.
 */
export const emailPrefsSchema = z.object({
  /** The team replies to my request. */
  replies: z.boolean(),
  /** A status changes or more information is needed. */
  statusChanges: z.boolean(),
  /** Weekly summary of my requests (sent from Phase 9). */
  weeklySummary: z.boolean(),
});

export type EmailPrefs = z.infer<typeof emailPrefsSchema>;

export const defaultEmailPrefs: EmailPrefs = {
  replies: true,
  statusChanges: true,
  weeklySummary: false,
};

/** The saved choices, with the defaults for anything missing or broken. */
export function readEmailPrefs(saved: unknown): EmailPrefs {
  const parsed = emailPrefsSchema.partial().safeParse(saved ?? {});
  return { ...defaultEmailPrefs, ...(parsed.success ? parsed.data : {}) };
}
