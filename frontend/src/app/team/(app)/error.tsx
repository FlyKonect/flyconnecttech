"use client";

import { ErrorPanel } from "@/components/shell/error-panel";
import { routes } from "@/lib/routes";

/** A team page that failed to load (for example, the backend is down). */
export default function TeamError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorPanel
      {...props}
      backHref={routes.team}
      backLabel="Back to dashboard"
    />
  );
}
