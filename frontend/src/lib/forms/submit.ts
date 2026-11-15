import { apiFetch } from "@/lib/api";
import type { DemoRequest, Message, Quote } from "@/lib/forms/schemas";

/**
 * Sends a website form to the backend, which saves the lead, emails the
 * visitor's copy and alerts the team (docs/01, section 2).
 *
 * A failure throws ApiError (lib/api.ts). The backend answers "sent" even
 * to bots caught by the hidden field, so nothing is given away.
 */

export type LeadSubmission =
  | { kind: "demo"; data: DemoRequest }
  | { kind: "quote"; data: Quote }
  | { kind: "message"; data: Message };

export async function submitLead(
  submission: LeadSubmission,
  sourcePage: string,
  /** The hidden "website" field: people leave it empty, bots fill it in. */
  honeypot = "",
): Promise<void> {
  await apiFetch<{ ok: true }>(`/leads/${submission.kind}`, {
    method: "POST",
    body: { ...submission.data, sourcePage, website: honeypot },
  });
}

/** Demo times a scheduled demo already holds, as UTC instants. */
export async function takenDemoSlots(): Promise<Set<string>> {
  const { taken } = await apiFetch<{ taken: string[] }>("/leads/demo-slots");
  return new Set(taken);
}
