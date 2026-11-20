"use client";

import { ErrorPanel } from "@/components/shell/error-panel";
import { routes } from "@/lib/routes";

/** A portal page that failed to load (for example, the backend is down). */
export default function PortalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorPanel
      {...props}
      backHref={routes.portal}
      backLabel="Back to dashboard"
    />
  );
}
