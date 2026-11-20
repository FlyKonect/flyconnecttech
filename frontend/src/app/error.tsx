"use client";

import { ErrorPanel } from "@/components/shell/error-panel";
import { routes } from "@/lib/routes";

/**
 * Any other page that failed to load: the website, sign-in, invitations.
 * The team panel and the portal have their own, inside their menus.
 */
export default function AppError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex flex-1 items-center bg-tint px-4 py-16">
      <ErrorPanel
        {...props}
        backHref={routes.home}
        backLabel="Go to home page"
      />
    </main>
  );
}
