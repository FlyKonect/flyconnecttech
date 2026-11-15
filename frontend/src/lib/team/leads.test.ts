import { describe, expect, test } from "vitest";

import { parseAmount } from "@/components/team/lead-dialogs";
import { demoWhenLong } from "@/lib/forms/demo-slots";
import {
  formatUsd,
  leadActions,
  leadBanner,
  leadFacts,
  longDate,
  suggestedEmail,
} from "@/lib/team/leads";
import type { DemoDetail, MessageDetail, QuoteDetail } from "@/lib/team/types";

const base = {
  id: "1",
  name: "Olivia Grant",
  email: "olivia@skyhaven.example",
  phone: null,
  sourcePage: "Travel Technology",
  createdAt: "2026-11-09T10:12:00Z",
  owner: null,
  activity: [],
  customer: null,
  converted: false,
  canConvert: true,
};

const demo = (changes: Partial<DemoDetail> = {}): DemoDetail => ({
  ...base,
  kind: "demo",
  code: "DEM-2026-031",
  status: "NEW",
  topic: "TRAVEL_BOOKING_PLATFORM",
  company: "Skyhaven Travel",
  notes: null,
  preferredStart: "2026-11-10T11:00:00Z",
  scheduledStart: null,
  host: null,
  videoLink: null,
  cancelReason: null,
  ...changes,
});

const quote = (changes: Partial<QuoteDetail> = {}): QuoteDetail => ({
  ...base,
  name: "Hannah Weber",
  kind: "quote",
  code: "QUO-2026-042",
  status: "NEW",
  projectType: "API_INTEGRATION",
  budget: "FROM_15K_TO_50K",
  timeline: null,
  company: "Alpenblick Hotels",
  requirements: "Connect our booking engine.",
  lostReason: null,
  estimates: [],
  ...changes,
});

const message = (changes: Partial<MessageDetail> = {}): MessageDetail => ({
  ...base,
  name: "Sarah Mitchell",
  kind: "message",
  code: "MSG-2026-018",
  status: "NEW",
  topic: "EXISTING_PROJECT",
  message: "Could you add a page for our winter sale?",
  ...changes,
});

describe("the buttons for each status", () => {
  test("demos, as the design orders them", () => {
    expect(leadActions(demo())).toEqual(["confirm", "cancel"]);
    expect(leadActions(demo({ status: "SCHEDULED" }))).toEqual([
      "complete",
      "reschedule",
      "cancel",
    ]);
    expect(leadActions(demo({ status: "COMPLETED" }))).toEqual(["convert"]);
    expect(
      leadActions(demo({ status: "COMPLETED", canConvert: false })),
    ).toEqual([]);
    expect(leadActions(demo({ status: "CANCELLED" }))).toEqual(["reopen"]);
  });

  test("quotes and messages", () => {
    expect(leadActions(quote())).toEqual(["review", "estimate", "lost"]);
    expect(leadActions(quote({ status: "ESTIMATE_SENT" }))).toEqual([
      "won",
      "updateEstimate",
      "lost",
    ]);
    expect(leadActions(quote({ status: "WON", converted: true }))).toEqual([]);
    const customer = { id: "c", company: "Bluewave Holidays", phone: null };
    expect(leadActions(message({ customer }))).toEqual([
      "close",
      "openCustomer",
    ]);
    expect(leadActions(message({ status: "CLOSED" }))).toEqual([
      "reopenMessage",
    ]);
  });
});

describe("the banner", () => {
  test("uses the design's sentences", () => {
    expect(leadBanner(demo())?.text).toBe(
      "Olivia was told to expect a calendar invite by email. Confirm the time they picked, or choose another one.",
    );
    expect(
      leadBanner(
        demo({
          status: "SCHEDULED",
          scheduledStart: "2026-11-10T11:00:00Z",
          host: { id: "h", name: "Emma Clarke" },
        }),
      ),
    ).toEqual({
      text: "Demo booked for Tuesday 10 November at 11:00 UK time with Emma Clarke.",
      tone: "ok",
    });
    expect(
      leadBanner(
        quote({ status: "LOST", lostReason: "Chose another provider" }),
      ),
    ).toEqual({ text: "Lost: chose another provider.", tone: "muted" });
    expect(
      leadBanner(
        message({
          customer: { id: "c", company: "Bluewave Holidays", phone: null },
        }),
      )?.text,
    ).toBe(
      "Sarah Mitchell is a customer (Bluewave Holidays). Project requests should come through the client portal so the team can track them.",
    );
  });

  test("a converted lead says so", () => {
    expect(
      leadBanner(
        quote({
          status: "WON",
          converted: true,
          customer: { id: "c", company: "Alpenblick Hotels", phone: null },
        }),
      ),
    ).toEqual({
      text: "Hannah Weber is now a customer · Alpenblick Hotels.",
      tone: "ok",
    });
  });
});

describe("facts and words", () => {
  test("a demo shows its time in UK time", () => {
    const { facts, textLabel, text } = leadFacts(demo());
    expect(facts[1]).toEqual({
      label: "Preferred time",
      value: "Tuesday 10 November, 11:00 UK time",
    });
    expect(facts[3].value).toBe("Travel Technology page");
    expect(textLabel).toBe("Notes from Olivia");
    expect(text).toBe("No notes added.");
    expect(demoWhenLong("2026-06-16T08:30:00Z")).toBe(
      "Tuesday 16 June, 09:30 UK time",
    );
  });

  test("a quote without a timeline says it was not asked", () => {
    expect(leadFacts(quote()).facts[2].value).toBe("Not asked on this form");
  });

  test("the suggested email points customers to the portal", () => {
    expect(
      suggestedEmail(
        message({
          customer: { id: "c", company: "Bluewave Holidays", phone: null },
        }),
      ),
    ).toContain("support request from your client portal");
  });

  test("money and dates", () => {
    expect(formatUsd(2_400_000)).toBe("$24,000");
    expect(longDate("2026-11-23T00:00:00.000Z")).toBe("23 November 2026");
    expect(parseAmount("$24,000")).toBe(24000);
    expect(parseAmount("24,000.50")).toBe(24000.5);
    expect(parseAmount("about that")).toBeNull();
  });
});
