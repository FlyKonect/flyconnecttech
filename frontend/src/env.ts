import { z } from "zod";

// Zod would test once whether it may build code with new Function(), which the
// site's security policy forbids (the browser reports it as a violation).
// This file is read first, so the setting covers every form check.
z.config({ jitless: true });

/**
 * Settings the frontend reads from `.env.local` (see `.env.example`).
 * They are checked once, so a missing or wrong value fails with a clear message.
 *
 * Only names that start with NEXT_PUBLIC_ reach the browser. Never put a
 * secret in one of those.
 */
const schema = z.object({
  /** Where this website runs. */
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3001"),
  /** Where the backend (NestJS) runs. */
  NEXT_PUBLIC_API_URL: z.url().default("http://localhost:4000"),
});

// Next.js only fills in NEXT_PUBLIC_ values when each one is written out in full.
const parsed = schema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || undefined,
});

if (!parsed.success) {
  throw new Error(
    `Frontend settings are wrong. Check frontend/.env.local:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
