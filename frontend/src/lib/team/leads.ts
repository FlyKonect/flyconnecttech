import { demoDayShort, demoTime, demoWhenLong } from "@/lib/forms/demo-slots";
import {
  budgets,
  contactStatuses,
  demoStatuses,
  demoTopics,
  messageTopics,
  quoteProjectTypes,
  quoteStatuses,
  timelines,
} from "@/lib/labels";
import { routes } from "@/lib/routes";
import type { LeadDetail, LeadKind } from "@/lib/team/types";

/**
 * The words and rules of a lead's page (docs/01 §6, screens 34 to 42),
 * from the design: the banner, the fact tiles, the suggested email, "How
 * this works" and the buttons for each status.
 */

export const LEAD_PATH: Record<LeadKind, string> = {
  demo: "demos",
  quote: "quotes",
  message: "messages",
};

export const leadListHref = (kind: LeadKind) =>
  `/team/leads/${LEAD_PATH[kind]}`;
export const leadHref = (kind: LeadKind, code: string) =>
  `${leadListHref(kind)}/${code}`;

/** "Demo request", "Quote request", "Message". */
export const KIND_LABEL: Record<LeadKind, string> = {
  demo: "Demo request",
  quote: "Quote request",
  message: "Message",
};

/** The list's plural: "5 demo requests · 2 new". */
export const KIND_PLURAL: Record<LeadKind, string> = {
  demo: "demo requests",
  quote: "quote requests",
  message: "messages",
};

/** "1 demo request", "5 demo requests". */
export const leadCount = (kind: LeadKind, count: number) =>
  `${count} ${count === 1 ? KIND_PLURAL[kind].replace(/s$/, "") : KIND_PLURAL[kind]}`;

/** The status tabs, in order, and their ?status= value. */
export const LEAD_TABS: Record<
  LeadKind,
  { status: string; slug: string; label: string }[]
> = {
  demo: (["NEW", "SCHEDULED", "COMPLETED", "CANCELLED"] as const).map(
    (status) => ({
      status,
      slug: status.toLowerCase(),
      label: demoStatuses[status].label,
    }),
  ),
  quote: (["NEW", "REVIEWING", "ESTIMATE_SENT", "WON", "LOST"] as const).map(
    (status) => ({
      status,
      slug: status.toLowerCase().replace("_", "-"),
      label: quoteStatuses[status].label,
    }),
  ),
  message: (["NEW", "REPLIED", "CLOSED"] as const).map((status) => ({
    status,
    slug: status.toLowerCase(),
    label: contactStatuses[status].label,
  })),
};

/** "Olivia" from "Olivia Grant". */
export const firstOf = (name: string) => name.trim().split(/\s+/)[0] || name;

/** "£24,000", or "£24,000.50" when there are cents. */
export function formatGbp(cents: number): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "23 November 2026", for a date stored at midnight UTC. */
export function longDate(date: string): string {
  const d = new Date(date);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** The demo's time to show: confirmed, or what they picked. */
export const demoStart = (lead: {
  scheduledStart: string | null;
  preferredStart: string;
}) => lead.scheduledStart ?? lead.preferredStart;

/** "Tue 10 Nov, 11:00" */
export const demoShort = (instant: string) =>
  `${demoDayShort(instant)}, ${demoTime(instant)}`;

export type BannerTone = "info" | "ok" | "muted";

/** The line under the header, as the design writes it for each status. */
export function leadBanner(
  lead: LeadDetail,
): { text: string; tone: BannerTone } | null {
  const first = firstOf(lead.name);
  if (lead.converted && lead.customer) {
    return {
      text: `${lead.name} is now a customer · ${lead.customer.company}.`,
      tone: "ok",
    };
  }
  if (lead.kind === "demo") {
    switch (lead.status) {
      case "NEW":
        return {
          text: `${first} was told to expect a calendar invite by email. Confirm the time they picked, or choose another one.`,
          tone: "info",
        };
      case "SCHEDULED": {
        const start = demoStart(lead);
        return {
          text: `Demo booked for ${demoWhenLong(start).replace(", ", " at ")} with ${lead.host?.name ?? "the team"}.`,
          tone: "ok",
        };
      }
      case "COMPLETED":
        return {
          text: `Demo done. When ${first} is ready to start a project, convert them to a customer so they get a client portal invitation.`,
          tone: "info",
        };
      case "CANCELLED":
        return {
          text: lead.cancelReason
            ? `Cancelled: ${lead.cancelReason.toLowerCase()}.`
            : "Cancelled.",
          tone: "muted",
        };
    }
  }
  if (lead.kind === "quote") {
    const latest = lead.estimates[0];
    switch (lead.status) {
      case "NEW":
        return {
          text: `${first} was told to expect next steps, a rough scope and an estimate by email.`,
          tone: "info",
        };
      case "REVIEWING":
        return {
          text: `In review with ${lead.owner?.name ?? "the team"}. Send the estimate when the scope is clear.`,
          tone: "info",
        };
      case "ESTIMATE_SENT":
        return {
          text: latest
            ? `Estimate of ${formatGbp(latest.amountCents)} sent. Valid until ${longDate(latest.validUntil)}.`
            : "Estimate sent.",
          tone: "info",
        };
      case "WON":
        return {
          text: `Estimate accepted. Convert ${first} to a customer to send the client portal invitation and start the project.`,
          tone: "ok",
        };
      case "LOST":
        return {
          text: lead.lostReason
            ? `Lost: ${lead.lostReason.toLowerCase()}.`
            : "Lost.",
          tone: "muted",
        };
    }
  }
  if (lead.kind === "message") {
    if (lead.customer) {
      return {
        text: `${lead.name} is a customer (${lead.customer.company}). Project requests should come through the client portal so the team can track them.`,
        tone: "info",
      };
    }
    if (lead.status === "NEW") {
      return {
        text: "Reply by email below. The reply is saved in the activity.",
        tone: "info",
      };
    }
  }
  return null;
}

/** The fact tiles, and the visitor's own text under them. */
export function leadFacts(lead: LeadDetail): {
  facts: { label: string; value: string }[];
  textLabel: string;
  text: string;
} {
  const page = `${lead.sourcePage} page`;
  if (lead.kind === "demo") {
    const confirmed = lead.scheduledStart && lead.status !== "CANCELLED";
    return {
      facts: [
        { label: "Wants to see", value: demoTopics[lead.topic].label },
        {
          label: confirmed ? "Confirmed time" : "Preferred time",
          value: demoWhenLong(demoStart(lead)),
        },
        { label: "Format", value: "Video call · 30 minutes" },
        { label: "Sent from", value: page },
      ],
      textLabel: `Notes from ${firstOf(lead.name)}`,
      text: lead.notes || "No notes added.",
    };
  }
  if (lead.kind === "quote") {
    return {
      facts: [
        {
          label: "Project type",
          value: quoteProjectTypes[lead.projectType].label,
        },
        { label: "Budget", value: budgets[lead.budget].label },
        {
          label: "Timeline",
          value: lead.timeline
            ? timelines[lead.timeline].label
            : "Not asked on this form",
        },
        { label: "Sent from", value: page },
      ],
      textLabel: "Requirements",
      text: lead.requirements,
    };
  }
  return {
    facts: [
      { label: "Topic", value: messageTopics[lead.topic].label },
      { label: "Sent from", value: page },
    ],
    textLabel: "Message",
    text: lead.message,
  };
}

/** The composer's suggested email (shown as a hint). */
export function suggestedEmail(lead: LeadDetail): string {
  const first = firstOf(lead.name);
  if (lead.kind === "demo") {
    return `Hi ${first}, thanks for booking a demo. We will confirm your time shortly.`;
  }
  if (lead.kind === "quote") {
    return `Hi ${first}, thanks for your quote request. We are reviewing it and will send an estimate soon.`;
  }
  return lead.customer
    ? `Hi ${first}, thanks for your message. Please send this as a support request from your client portal, so the team can track it and keep you updated.`
    : `Hi ${first}, thanks for getting in touch. We would be glad to talk. Are you free for a short call this week?`;
}

/** "How this works", three steps per kind. */
export const HOW_IT_WORKS: Record<LeadKind, [title: string, text: string][]> = {
  demo: [
    ["Confirm the time", "Send the calendar invite with the video call link."],
    ["Run the demo", "Mark it as completed afterwards."],
    [
      "Convert to customer",
      "When they start a project, they get a client portal invitation.",
    ],
  ],
  quote: [
    ["Review the request", "Ask questions by email if the scope is unclear."],
    ["Send the estimate", "Amount, delivery time and what is included."],
    ["Won or lost", "When it is won, convert them to a customer."],
  ],
  message: [
    ["Reply by email", "Your reply is saved in the activity."],
    ["Close the message", "When nothing else is needed."],
    [
      "Existing customers",
      "Point them to the client portal for project requests.",
    ],
  ],
};

export type LeadAction =
  | "confirm"
  | "reschedule"
  | "complete"
  | "cancel"
  | "reopen"
  | "review"
  | "estimate"
  | "updateEstimate"
  | "won"
  | "lost"
  | "close"
  | "reopenMessage"
  | "convert"
  | "openCustomer";

/** The header buttons for the lead's status, in the design's order. */
export function leadActions(lead: LeadDetail): LeadAction[] {
  const convert: LeadAction[] =
    lead.canConvert && !lead.converted ? ["convert"] : [];
  let actions: LeadAction[] = [];
  if (lead.kind === "demo") {
    actions = {
      NEW: ["confirm", "cancel"],
      SCHEDULED: ["complete", "reschedule", "cancel"],
      COMPLETED: convert,
      CANCELLED: ["reopen"],
    }[lead.status] as LeadAction[];
  } else if (lead.kind === "quote") {
    actions = {
      NEW: ["review", "estimate", "lost"],
      REVIEWING: ["estimate", "lost"],
      ESTIMATE_SENT: ["won", "updateEstimate", "lost"],
      WON: convert,
      LOST: ["reopen"],
    }[lead.status] as LeadAction[];
  } else {
    actions = lead.status === "CLOSED" ? ["reopenMessage"] : ["close"];
  }
  return lead.customer ? [...actions, "openCustomer"] : actions;
}

/** Where "Open customer" and "Convert to customer" go. */
export const customerHref = (id: string) => routes.teamCustomer(id);
export const convertHref = (code: string) =>
  `${routes.teamNewCustomer}?from=${encodeURIComponent(code)}`;
