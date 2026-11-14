import { z } from "zod";

import {
  budgets,
  demoTopics,
  messageTopics,
  quoteProjectTypes,
  timelines,
  type Budget,
  type DemoTopic,
  type MessageTopic,
  type QuoteProjectType,
  type Timeline,
} from "@/lib/labels";

/**
 * The rules for the three public website forms: Book a demo, Get a quote and
 * Send a message. The error messages are the design's wording.
 *
 * Phase 8 runs the same rules on the backend before anything is saved, so a
 * visitor cannot get round them by skipping the browser.
 */

const keys = <T extends string>(record: Record<T, unknown>) =>
  Object.keys(record) as [T, ...T[]];

/** Text the visitor must fill in: blanks and spaces do not count. */
const required = (message: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, `Keep this under ${max} characters`);

const optional = (max = 200) =>
  z.string().trim().max(max, `Keep this under ${max} characters`);

/** The design's email rule: something@something.xx */
const email = (message: string) =>
  z
    .string()
    .trim()
    .max(200, message)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message);

// ------------------------------------------------------------------ quote

export const quoteSchema = z.object({
  projectType: z.enum(keys<QuoteProjectType>(quoteProjectTypes)),
  budget: z.enum(keys<Budget>(budgets)),
  /** Only on the full form (Contact page). */
  timeline: z.enum(keys<Timeline>(timelines)).optional(),
  name: required("Enter your name", 120),
  email: email("Enter a valid work email"),
  /** Only on the full form. */
  company: optional(160).optional(),
  /** Only on the full form. */
  phone: optional(40).optional(),
  requirements: required("Tell us a little about your project", 5000),
});

export type QuoteInput = z.input<typeof quoteSchema>;
export type Quote = z.output<typeof quoteSchema>;

export const quoteDefaults: QuoteInput = {
  projectType: "TRAVEL_BOOKING_PLATFORM",
  budget: "NOT_SURE",
  timeline: "NOT_SURE",
  name: "",
  email: "",
  company: "",
  phone: "",
  requirements: "",
};

// ---------------------------------------------------------------- message

export const messageSchema = z.object({
  topic: z.enum(keys<MessageTopic>(messageTopics)),
  name: required("Enter your name", 120),
  email: email("Enter a valid email"),
  message: required("Write a short message", 5000),
});

export type MessageInput = z.input<typeof messageSchema>;
export type Message = z.output<typeof messageSchema>;

export const messageDefaults: MessageInput = {
  topic: "GENERAL_QUESTION",
  name: "",
  email: "",
  message: "",
};

// ------------------------------------------------------------------- demo

/** Step 3 of Book a demo: the visitor's details. */
export const demoDetailsSchema = z.object({
  name: required("Enter your name", 120),
  email: email("Enter a valid work email"),
  company: required("Enter your company name", 160),
  phone: optional(40),
  notes: optional(2000),
});

export type DemoDetailsInput = z.input<typeof demoDetailsSchema>;

export const demoDetailsDefaults: DemoDetailsInput = {
  name: "",
  email: "",
  company: "",
  phone: "",
  notes: "",
};

/** The whole demo request, as it will be sent to the backend. */
export const demoRequestSchema = demoDetailsSchema.extend({
  topic: z.enum(keys<DemoTopic>(demoTopics)),
  /** The slot the visitor picked, as a UTC instant (ISO 8601). */
  preferredStart: z.iso.datetime(),
});

export type DemoRequest = z.output<typeof demoRequestSchema>;

// ---------------------------------------------------------------- helpers

/** "Sarah Mitchell" -> "Sarah". Falls back to "there" ("Thanks, there."). */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || "there";
}
