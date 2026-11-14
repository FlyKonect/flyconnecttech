import type { DemoRequest, Message, Quote } from "@/lib/forms/schemas";

/**
 * TEMPORARY stand-in for sending the website forms (build plan, Phase 2).
 *
 * Nothing is saved and nothing is emailed yet: on a developer's PC the data is
 * only written to the browser console. Phase 8 replaces these three functions
 * with calls to the backend, which saves the lead and emails the team.
 */

export type LeadSubmission =
  | { kind: "demo"; data: DemoRequest }
  | { kind: "quote"; data: Quote }
  | { kind: "message"; data: Message };

export async function submitLead(
  submission: LeadSubmission,
  sourcePage: string,
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[website form, not sent yet]", {
      ...submission,
      sourcePage,
    });
  }
}
