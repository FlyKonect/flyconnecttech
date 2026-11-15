import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/env";
import {
  FALLBACK_SITE_CONTENT,
  parseSiteContent,
  SITE_CONTENT_TAG,
  type SiteContent,
} from "@/lib/site-content";

/**
 * The website's copy of the Website content (testimonials and the
 * live-project link). Kept in the page cache, so pages stay pre-built and
 * fast. It is refreshed at once after a change on the team screen
 * (refreshWebsite()), and at most a minute later in any case.
 *
 * If the backend can't be reached (for example while GitHub builds the
 * site), the pages use the default link and show no testimonials.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(SITE_CONTENT_TAG);
  cacheLife("minutes");
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/website`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return FALLBACK_SITE_CONTENT;
    return parseSiteContent(await response.json());
  } catch {
    return FALLBACK_SITE_CONTENT;
  }
}
