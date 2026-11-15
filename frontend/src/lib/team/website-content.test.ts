import { describe, expect, test } from "vitest";

import {
  emptyTestimonial,
  isWebAddress,
  placesOf,
  testimonialErrors,
} from "@/lib/team/website-content";

describe("the testimonial form", () => {
  test("needs a quote and a client name", () => {
    expect(testimonialErrors(emptyTestimonial)).toEqual({
      quote: "Write the quote",
      name: "Enter the client's name",
    });
  });

  test("keeps the quote under 400 characters", () => {
    const form = {
      ...emptyTestimonial,
      quote: "x".repeat(401),
      name: "Sarah Mitchell",
    };
    expect(testimonialErrors(form)).toEqual({
      quote: "Keep this under 400 characters",
    });
    expect(testimonialErrors({ ...form, quote: "x".repeat(400) })).toEqual({});
  });
});

describe("the live-project link", () => {
  test("takes full web addresses only", () => {
    expect(isWebAddress("https://dev.flyconnect.co.uk")).toBe(true);
    expect(isWebAddress(" https://flyconnect.co.uk/ ")).toBe(true);
    expect(isWebAddress("dev.flyconnect.co.uk")).toBe(false);
    expect(isWebAddress("javascript:alert(1)")).toBe(false);
  });
});

test("where a testimonial shows", () => {
  expect(placesOf({ showOnHome: true, showOnCaseStudy: true })).toEqual([
    "HOME",
    "CASE_STUDY",
  ]);
  expect(placesOf({ showOnHome: false, showOnCaseStudy: false })).toEqual([]);
});
