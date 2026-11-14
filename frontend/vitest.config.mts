import { defineConfig } from "vitest/config";

export default defineConfig({
  // Understands the "@/..." import shortcut from tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
