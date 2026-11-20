"use client";

import "./globals.css";

import { ErrorPanel } from "@/components/shell/error-panel";
import { routes } from "@/lib/routes";

/**
 * Last resort, when even the main layout fails. It replaces the whole page,
 * so it brings its own <html>, <body> and styles.
 */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-tint font-sans antialiased">
        <title>Something went wrong · FlyConnect Tech</title>
        <main className="flex flex-1 items-center px-4 py-16">
          <ErrorPanel
            {...props}
            backHref={routes.home}
            backLabel="Go to home page"
          />
        </main>
      </body>
    </html>
  );
}
