import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Builds a small, ready-to-run copy of the site in .next/standalone.
  // That copy is what gets uploaded to the hosting (see docs/deploy.md).
  output: "standalone",
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
