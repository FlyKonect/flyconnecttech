"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { requestStatuses, type RequestStatus } from "@/lib/labels";
import type { CustomerAction } from "@/lib/portal/types";

/**
 * The customer's buttons on a request (screen 13): Close request while it is
 * open, Confirm it's fixed / I still need help when Resolved, Reopen request
 * when Closed. The backend says which ones apply.
 */
export function RequestActions({
  code,
  status,
  actions,
}: {
  code: string;
  status: RequestStatus;
  actions: CustomerAction[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState<CustomerAction | null>(null);

  async function run(action: CustomerAction) {
    setBusy(action);
    try {
      const result = await apiFetch<{ status: RequestStatus }>(
        `/portal/requests/${encodeURIComponent(code)}/${action}`,
        { method: "POST" },
      );
      toast(`${code} is now ${requestStatuses[result.status].label}`);
      router.refresh();
    } catch (error) {
      toast(apiErrorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  const button = (
    action: CustomerAction,
    label: string,
    variant: "outline" | "success" | "navy",
  ) => (
    <Button
      key={`${action}-${label}`}
      variant={variant}
      className="h-11 px-4"
      disabled={busy !== null}
      onClick={() => run(action)}
    >
      {busy === action ? "Saving…" : label}
    </Button>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes("close")
        ? button("close", "Close request", "outline")
        : null}
      {actions.includes("confirm")
        ? button("confirm", "Confirm it's fixed", "success")
        : null}
      {actions.includes("reopen")
        ? status === "RESOLVED"
          ? button("reopen", "I still need help", "outline")
          : button("reopen", "Reopen request", "navy")
        : null}
    </div>
  );
}
