import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Builds a small, ready-to-run copy of the site in .next/standalone.
  // That copy is what gets uploaded to the hosting (see docs/deploy.md).
  output: "standalone",
  // The browser tests run their own copy of the dev server beside yours,
  // so they build into a separate folder (see playwright.config.ts).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // This folder is the project. Without these two "root" lines, Next.js picks
  // the parent FlyConnect folder because it also has a package-lock.json.
  outputFileTracingRoot: __dirname,
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
