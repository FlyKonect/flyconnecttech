import type { MetadataRoute } from "next";

import { env } from "@/env";

/** Search engines may read the website, but not the portal, team panel or dev pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/team", "/invite", "/reset-password", "/dev"],
    },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
