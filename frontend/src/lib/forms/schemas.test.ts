import { describe, expect, test } from "vitest";

import {
  demoDetailsSchema,
  firstName,
  messageSchema,
  quoteDefaults,
  quoteSchema,
} from "@/lib/forms/schemas";

const messagesFor = (result: { success: boolean; error?: unknown }) => {
  if (result.success) return {};
  const issues = (
    result.error as { issues: { path: string[]; message: string }[] }
  ).issues;
  return Object.fromEntries(
    issues.map((issue) => [issue.path[0], issue.message]),
  );
};

describe("Get a quote", () => {
  test("an empty form shows the design's three messages", () => {
    expect(messagesFor(quoteSchema.safeParse(quoteDefaults))).toEqual({
      name: "Enter your name",
      email: "Enter a valid work email",
      requirements: "Tell us a little about your project",
    });
  });

  test("spaces alone do not count as an answer", () => {
    const result = quoteSchema.safeParse({
      ...quoteDefaults,
      name: "   ",
      email: "sarah@bluewave.co.uk",
      requirements: "  ",
    });
    expect(messagesFor(result)).toEqual({
      name: "Enter your name",
      requirements: "Tell us a little about your project",
    });
  });

  test("a filled-in form passes, with spaces trimmed", () => {
    const result = quoteSchema.parse({
      ...quoteDefaults,
      name: "  Sarah Mitchell ",
      email: " sarah@bluewave.co.uk ",
      requirements: "A booking site with Amadeus.",
    });
    expect(result.name).toBe("Sarah Mitchell");
    expect(result.email).toBe("sarah@bluewave.co.uk");
  });

  test("rejects an email without a proper domain", () => {
    for (const bad of [
      "sarah",
      "sarah@",
      "sarah@bluewave",
      "sarah@bluewave.c",
    ]) {
      const result = quoteSchema.safeParse({
        ...quoteDefaults,
        name: "Sarah",
        email: bad,
        requirements: "x",
      });
      expect(messagesFor(result)).toEqual({
        email: "Enter a valid work email",
      });
    }
  });
});

describe("Send a message", () => {
  test("uses its own wording", () => {
    const result = messageSchema.safeParse({
      topic: "GENERAL_QUESTION",
      name: "",
      email: "",
      message: "",
    });
    expect(messagesFor(result)).toEqual({
      name: "Enter your name",
      email: "Enter a valid email",
      message: "Write a short message",
    });
  });
});

describe("Book a demo, your details", () => {
  test("name, work email and company are required; phone and notes are not", () => {
    const result = demoDetailsSchema.safeParse({
      name: "",
      email: "",
      company: "",
      phone: "",
      notes: "",
    });
    expect(messagesFor(result)).toEqual({
      name: "Enter your name",
      email: "Enter a valid work email",
      company: "Enter your company name",
    });
  });
});

test("firstName", () => {
  expect(firstName("Sarah Mitchell")).toBe("Sarah");
  expect(firstName("  Omar  ")).toBe("Omar");
  expect(firstName("")).toBe("there");
});
