import type { MetadataRoute } from "next";

import { env } from "@/env";
import { routes } from "@/lib/routes";

/** The 11 public website pages. The portal and team panel are left out. */
const pages = [
  routes.home,
  routes.solutions,
  routes.travel,
  routes.services,
  routes.websiteDevelopment,
  routes.uiUxDesign,
  routes.apiIntegrations,
  routes.caseStudies,
  routes.about,
  routes.contact,
  routes.support,
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({
    url: new URL(path, env.NEXT_PUBLIC_SITE_URL).toString(),
    changeFrequency: "monthly",
    priority: path === routes.home ? 1 : 0.7,
  }));
}
