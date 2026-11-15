import { z } from 'zod';

/**
 * Website content (testimonials and the live-project link): the input
 * rules and the shapes the routes answer with. The team screen shows the
 * same wording (frontend/src/lib/team/website-content.ts).
 */

/** Home shows this many testimonials; Case Studies shows one. */
export const HOME_TESTIMONIALS = 3;
export const QUOTE_MAX = 400;

const required = (message: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, `Keep this under ${max} characters`);

/** Empty means "not given": saved as null. */
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters`)
    .optional()
    .transform((value) => value || null);

export const testimonialSchema = z.object({
  quote: required('Write the quote', QUOTE_MAX),
  name: required("Enter the client's name", 120),
  role: optional(120),
  company: optional(160),
  showOnHome: z.boolean(),
  showOnCaseStudy: z.boolean(),
});
export type TestimonialInput = z.output<typeof testimonialSchema>;

/** A full web address: https:// (or http://) and a domain with a dot. */
export function isWebAddress(text: string): boolean {
  try {
    const url = new URL(text);
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export const linkSchema = z.object({
  liveProjectUrl: z
    .string()
    .trim()
    .max(500, 'Keep this under 500 characters')
    .refine(isWebAddress, 'Enter a full web address starting with https://'),
});

/** A testimonial as the public website shows it. */
export type PublicTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  company: string | null;
};

/** GET /website: what the public website shows. */
export type WebsiteContent = {
  liveProjectUrl: string;
  /** The newest ones ticked for Home, at most HOME_TESTIMONIALS. */
  home: PublicTestimonial[];
  /** The newest one ticked for Case Studies. */
  caseStudy: PublicTestimonial | null;
};
