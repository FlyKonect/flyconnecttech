import { z } from "zod";

/**
 * What the public website shows from the Website content screen: the
 * live-project link and the testimonials (backend GET /website). Read on
 * the server with getSiteContent() from site-content-cache.ts.
 */

/** The cache tag the website's copy is kept under, refreshed after a save. */
export const SITE_CONTENT_TAG = "site-content";

/** Where "View live project" goes when the backend can't be reached. */
export const DEFAULT_LIVE_PROJECT_URL = "https://dev.flyconnect.co.uk";

const testimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  company: z.string().nullable(),
});

const siteContentSchema = z.object({
  liveProjectUrl: z.url({ protocol: /^https?$/ }),
  home: z.array(testimonialSchema),
  caseStudy: testimonialSchema.nullable(),
});

export type SiteTestimonial = z.infer<typeof testimonialSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;

/** Used while the backend can't be reached: the default link, no quotes. */
export const FALLBACK_SITE_CONTENT: SiteContent = {
  liveProjectUrl: DEFAULT_LIVE_PROJECT_URL,
  home: [],
  caseStudy: null,
};

/** The backend's answer, checked. Anything unexpected gives the fallback. */
export function parseSiteContent(data: unknown): SiteContent {
  const parsed = siteContentSchema.safeParse(data);
  return parsed.success ? parsed.data : FALLBACK_SITE_CONTENT;
}

/** "dev.flyconnect.co.uk" from "https://dev.flyconnect.co.uk/". */
export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** "Managing director, Bluewave Holidays", or whichever part is given. */
export function testimonialByline(testimonial: SiteTestimonial): string {
  return [testimonial.role, testimonial.company].filter(Boolean).join(", ");
}

/** "SM" for Sarah Mitchell: shown in the circle beside the name. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}
