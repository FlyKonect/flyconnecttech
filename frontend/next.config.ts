import type { NextConfig } from "next";

import { env } from "./src/env";
import { securityHeaders } from "./src/lib/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Builds a small, ready-to-run copy of the site in .next/standalone.
  // That copy is what gets uploaded to the hosting (see docs/deploy.md).
  output: "standalone",
  // The development "N" badge sits bottom-right, off the sidebar's account card.
  devIndicators: { position: "bottom-right" },
  // The browser tests run their own copy of the dev server beside yours,
  // so they build into a separate folder (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // This folder is the project. Without these two "root" lines, Next.js picks
  // the parent FlyConnect folder because it also has a package-lock.json.
  outputFileTracingRoot: __dirname,
  // Security headers on every page (src/lib/security-headers.ts).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          apiUrl: env.NEXT_PUBLIC_API_URL,
          siteUrl: env.NEXT_PUBLIC_SITE_URL,
          development: process.env.NODE_ENV === "development",
        }),
      },
    ];
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
