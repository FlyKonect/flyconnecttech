"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { plural } from "@/lib/plural";

/** The deleted account an email belonged to (backend PREVIOUS_ACCOUNT). */
export type PreviousAccount = {
  name: string;
  deletedAt: string | null;
  /** Customers only. */
  company: string | null;
  /** Customers: their requests. Team members: the requests they wrote in. */
  requests: number;
  /** Customers only. */
  projects: number | null;
};

export type PreviousChoice = "restore" | "fresh";

/** The deleted account in an Add user / Add customer answer, if any. */
export function previousAccountIn(failed: unknown): PreviousAccount | null {
  if (!(failed instanceof ApiError) || failed.code !== "PREVIOUS_ACCOUNT") {
    return null;
  }
  const details = failed.details as { previous?: PreviousAccount } | undefined;
  return details?.previous ?? null;
}

const dayFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});

/**
 * "This email had an account before": shown when Add user or Add customer
 * uses the email of an account that was deleted (on the same side). Restore
 * brings the same account back with its history; Start fresh makes a new
 * one and the old history is not offered again.
 */
export function PreviousAccountDialog({
  previous,
  email,
  onChoose,
  onCancel,
}: {
  previous: PreviousAccount;
  email: string;
  onChoose: (choice: PreviousChoice) => Promise<void>;
  onCancel: () => void;
}) {
  const [busy, setBusy] = React.useState<PreviousChoice | null>(null);
  const who = previous.company
    ? `${previous.name} at ${previous.company}`
    : previous.name;
  const when = previous.deletedAt
    ? ` on ${dayFormat.format(new Date(previous.deletedAt))}`
    : "";
  const history = previous.company
    ? `${plural(previous.requests, "support request")} and ${plural(previous.projects ?? 0, "project")}`
    : `replies in ${plural(previous.requests, "support request")}`;

  async function choose(choice: PreviousChoice) {
    setBusy(choice);
    try {
      await onChoose(choice);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? null : onCancel())}>
      <DialogContent>
        <DialogTitle>This email had an account before</DialogTitle>
        <DialogDescription>
          {email} belonged to {who}, deleted{when}. Their history is still kept:{" "}
          {history}.
        </DialogDescription>
        <div className="mt-5 flex flex-col gap-3">
          <ChoiceButton
            title="Restore their history"
            text="The same account comes back with everything it had, using the details you entered. They get a new invitation."
            busy={busy === "restore"}
            disabled={busy !== null}
            onClick={() => choose("restore")}
            primary
          />
          <ChoiceButton
            title="Start fresh"
            text={`A brand-new account. The old history stays under “${previous.name} (deleted)” and won't be offered again.`}
            busy={busy === "fresh"}
            disabled={busy !== null}
            onClick={() => choose("fresh")}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onCancel} disabled={busy !== null}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceButton({
  title,
  text,
  busy,
  disabled,
  onClick,
  primary = false,
}: {
  title: string;
  text: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-left transition-colors disabled:cursor-default disabled:opacity-70 ${
        primary
          ? "border-navy bg-navy text-white hover:bg-[#0d2a6b]"
          : "border-line-2 bg-white text-navy hover:bg-soft"
      }`}
    >
      <span className="text-[15px] font-bold">{busy ? "Working…" : title}</span>
      <span
        className={`text-[13px] leading-[1.5] ${primary ? "text-white/85" : "text-muted-foreground"}`}
      >
        {text}
      </span>
    </button>
  );
}
