/**
 * The Website content screen's rules and words, the same as the backend's
 * (backend/src/website/website-rules.ts).
 */

export const QUOTE_MAX = 400;
export const HOME_TESTIMONIALS = 3;

export type TestimonialForm = {
  quote: string;
  name: string;
  role: string;
  company: string;
  showOnHome: boolean;
  showOnCaseStudy: boolean;
};

export const emptyTestimonial: TestimonialForm = {
  quote: "",
  name: "",
  role: "",
  company: "",
  showOnHome: true,
  showOnCaseStudy: false,
};

export type TestimonialErrors = Partial<Record<keyof TestimonialForm, string>>;

const tooLong = (max: number) => `Keep this under ${max} characters`;

/** What is wrong with the form, field by field. Empty when it can be saved. */
export function testimonialErrors(form: TestimonialForm): TestimonialErrors {
  const errors: TestimonialErrors = {};
  const quote = form.quote.trim();
  if (!quote) errors.quote = "Write the quote";
  else if (quote.length > QUOTE_MAX) errors.quote = tooLong(QUOTE_MAX);
  const name = form.name.trim();
  if (!name) errors.name = "Enter the client's name";
  else if (name.length > 120) errors.name = tooLong(120);
  if (form.role.trim().length > 120) errors.role = tooLong(120);
  if (form.company.trim().length > 160) errors.company = tooLong(160);
  return errors;
}

/** A full web address: https:// (or http://) and a domain with a dot. */
export function isWebAddress(text: string): boolean {
  try {
    const url = new URL(text.trim());
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export const LINK_ERROR = "Enter a full web address starting with https://";

/** "Shows on Home and Case Studies", or "Not shown on the website". */
export function placesOf(testimonial: {
  showOnHome: boolean;
  showOnCaseStudy: boolean;
}): ("HOME" | "CASE_STUDY")[] {
  return [
    ...(testimonial.showOnHome ? (["HOME"] as const) : []),
    ...(testimonial.showOnCaseStudy ? (["CASE_STUDY"] as const) : []),
  ];
}
