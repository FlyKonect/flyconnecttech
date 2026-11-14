"use client";

import { useEffect, useState } from "react";

import { env } from "@/env";

type Status = "checking" | "connected" | "offline";

const labels: Record<Status, string> = {
  checking: "Checking the backend…",
  connected: "Backend connected",
  offline: "Backend not running",
};

const dots: Record<Status, string> = {
  checking: "bg-muted-foreground",
  connected: "bg-success",
  offline: "bg-danger",
};

/**
 * Setup check only: asks the backend's /health address and shows the answer.
 * It goes away with the placeholder home page in Phase 2.
 */
export function BackendStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${env.NEXT_PUBLIC_API_URL}/health`, { signal: controller.signal })
      .then((response) => setStatus(response.ok ? "connected" : "offline"))
      .catch(() => {
        if (!controller.signal.aborted) setStatus("offline");
      });

    return () => controller.abort();
  }, []);

  return (
    <p
      role="status"
      className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
    >
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${dots[status]}`}
      />
      {labels[status]}
    </p>
  );
}
