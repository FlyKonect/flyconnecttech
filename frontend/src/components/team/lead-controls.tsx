"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { contactStatuses, demoStatuses, quoteStatuses } from "@/lib/labels";
import {
  convertHref,
  customerHref,
  firstOf,
  LEAD_PATH,
  leadActions,
  suggestedEmail,
  type LeadAction,
} from "@/lib/team/leads";
import type { LeadDetail, LeadKind, LeadPerson } from "@/lib/team/types";
import { cn } from "@/lib/utils";

import {
  CancelDemoDialog,
  ConfirmDemoDialog,
  EstimateDialog,
  LostDialog,
} from "./lead-dialogs";

const statusLabel = (kind: LeadKind, status: string) =>
  (kind === "demo"
    ? demoStatuses[status as keyof typeof demoStatuses]
    : kind === "quote"
      ? quoteStatuses[status as keyof typeof quoteStatuses]
      : contactStatuses[status as keyof typeof contactStatuses]
  ).label;

/** The quick status changes: path, and the button's words. */
const SIMPLE: Partial<Record<LeadAction, { path: string; label: string }>> = {
  complete: { path: "complete", label: "Mark as completed" },
  reopen: { path: "reopen", label: "Reopen request" },
  review: { path: "review", label: "Start review" },
  won: { path: "won", label: "Mark as won" },
  close: { path: "close", label: "Mark as closed" },
  reopenMessage: { path: "reopen", label: "Reopen" },
};

type Dialogs = "confirm" | "cancel" | "estimate" | "lost" | null;

/** The buttons in a lead's header, for its status (screens 35, 38, 41). */
export function LeadHeaderActions({
  lead,
  owners,
  meId,
}: {
  lead: LeadDetail;
  owners: LeadPerson[];
  meId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [dialog, setDialog] = React.useState<Dialogs>(null);
  const [busy, setBusy] = React.useState<LeadAction | null>(null);
  const actions = leadActions(lead);
  const close = (open: boolean) => (open ? null : setDialog(null));

  async function simple(action: LeadAction) {
    const step = SIMPLE[action]!;
    setBusy(action);
    try {
      const answer = await apiFetch<{ status: string }>(
        `/team/leads/${LEAD_PATH[lead.kind]}/${lead.code}/${step.path}`,
        { method: "POST" },
      );
      toast(`${lead.code} is now ${statusLabel(lead.kind, answer.status)}`);
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed), "error");
    } finally {
      setBusy(null);
    }
  }

  const button = (action: LeadAction, index: number) => {
    // The first button is the main one, as in the design.
    const main = index === 0;
    if (action === "convert") {
      return (
        <Link
          key={action}
          href={convertHref(lead.code)}
          className={buttonVariants()}
        >
          Convert to customer
        </Link>
      );
    }
    if (action === "openCustomer" && lead.customer) {
      return (
        <Link
          key={action}
          href={customerHref(lead.customer.id)}
          className={buttonVariants({ variant: "outline" })}
        >
          Open customer
        </Link>
      );
    }
    const opens: Partial<Record<LeadAction, [Dialogs, string]>> = {
      confirm: ["confirm", "Confirm time"],
      reschedule: ["confirm", "Reschedule"],
      cancel: ["cancel", "Cancel demo"],
      estimate: ["estimate", "Send estimate"],
      updateEstimate: ["estimate", "Update estimate"],
      lost: ["lost", "Mark as lost"],
    };
    const danger = action === "cancel" || action === "lost";
    const success = action === "complete" || action === "won";
    const variant = danger
      ? "dangerOutline"
      : success
        ? "success"
        : main &&
            action !== "reopen" &&
            action !== "close" &&
            action !== "reopenMessage"
          ? "navy"
          : "outline";
    const open = opens[action];
    if (open) {
      return (
        <Button
          key={action}
          variant={variant}
          onClick={() => setDialog(open[0])}
        >
          {open[1]}
        </Button>
      );
    }
    const step = SIMPLE[action];
    if (!step) return null;
    return (
      <Button
        key={action}
        variant={variant}
        disabled={busy !== null}
        onClick={() => void simple(action)}
      >
        {busy === action ? "Saving…" : step.label}
      </Button>
    );
  };

  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(button)}
      {lead.kind === "demo" ? (
        <>
          {dialog === "confirm" ? (
            <ConfirmDemoDialog
              lead={lead}
              owners={owners}
              defaultHostId={owners.some((o) => o.id === meId) ? meId : null}
              open
              onOpenChange={close}
            />
          ) : null}
          {dialog === "cancel" ? (
            <CancelDemoDialog lead={lead} open onOpenChange={close} />
          ) : null}
        </>
      ) : null}
      {lead.kind === "quote" ? (
        <>
          {dialog === "estimate" ? (
            <EstimateDialog lead={lead} open onOpenChange={close} />
          ) : null}
          {dialog === "lost" ? (
            <LostDialog lead={lead} open onOpenChange={close} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/** Owner: one of the lead team, or Unassigned. */
export function OwnerSelect({
  lead,
  owners,
}: {
  lead: LeadDetail;
  owners: LeadPerson[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  // Someone who left the lead team still shows as the owner.
  const choices =
    lead.owner && !owners.some((o) => o.id === lead.owner!.id)
      ? [lead.owner, ...owners]
      : owners;

  async function change(ownerId: string) {
    setBusy(true);
    try {
      await apiFetch(`/team/leads/${LEAD_PATH[lead.kind]}/${lead.code}/owner`, {
        method: "POST",
        body: { ownerId: ownerId || null },
      });
      const name = choices.find((person) => person.id === ownerId)?.name;
      toast(
        name
          ? `${lead.code} assigned to ${name}`
          : `${lead.code} is unassigned`,
      );
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Select
      aria-label="Owner"
      value={lead.owner?.id ?? ""}
      disabled={busy}
      onChange={(event) => void change(event.target.value)}
    >
      <option value="">Unassigned</option>
      {choices.map((person) => (
        <option key={person.id} value={person.id}>
          {person.name}
        </option>
      ))}
    </Select>
  );
}

type Mode = "email" | "note";

/**
 * The lead's composer: "Email {first}" (sent, and saved in the activity)
 * or an amber "Internal note" only the team sees.
 */
export function LeadComposer({ lead }: { lead: LeadDetail }) {
  const router = useRouter();
  const toast = useToast();
  const first = firstOf(lead.name);
  const suggestion = suggestedEmail(lead);
  // A customer's message starts with the "use the client portal" reply.
  const startText = lead.kind === "message" && lead.customer ? suggestion : "";
  const [mode, setMode] = React.useState<Mode>("email");
  const [text, setText] = React.useState(startText);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const note = mode === "note";

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError(note ? "Write the note first." : "Write the email first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(
        `/team/leads/${LEAD_PATH[lead.kind]}/${lead.code}/activity`,
        { method: "POST", body: { kind: mode, body: text.trim() } },
      );
      setText("");
      toast(
        note
          ? `Internal note added. ${first} cannot see it.`
          : `Email sent to ${lead.email}`,
      );
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  const tabs: [Mode, string][] = [
    ["email", `Email ${first}`],
    ["note", "Internal note"],
  ];

  return (
    <form
      onSubmit={send}
      noValidate
      data-mode={mode}
      className={cn(
        "mt-4 overflow-hidden rounded-[18px]",
        note
          ? "border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB]"
          : "border border-[#CBD5E4] bg-white",
      )}
    >
      <div
        role="group"
        aria-label="Write"
        className="flex gap-1.5 border-b border-[rgba(2,26,84,0.08)] p-2"
      >
        {tabs.map(([key, label]) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setMode(key);
                setError("");
              }}
              className={cn(
                "min-h-[38px] cursor-pointer rounded-[10px] px-3.5 text-[13px] font-bold",
                active
                  ? key === "note"
                    ? "bg-[#F59E0B] text-[#451A03]"
                    : "bg-navy text-white"
                  : "text-body hover:bg-white/60",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      <textarea
        aria-label={note ? "Internal note" : `Email to ${first}`}
        rows={4}
        value={text}
        maxLength={10000}
        onChange={(event) => setText(event.target.value)}
        placeholder={
          note
            ? `Internal note for the team. ${first} cannot see it.`
            : suggestion
        }
        className="block w-full resize-y bg-transparent px-4 py-3.5 text-[15px] text-navy outline-none placeholder:text-muted-foreground"
      />
      {error ? (
        <div className="px-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-[rgba(2,26,84,0.06)] px-3 py-2.5">
        <span className="text-xs text-muted-foreground">
          {note
            ? `Internal note for the team. ${first} cannot see it.`
            : `Emailed to ${lead.email} and saved here.`}
        </span>
        <button
          type="submit"
          disabled={busy}
          className={cn(
            "min-h-11 cursor-pointer rounded-[10px] px-[18px] text-sm font-bold disabled:opacity-60",
            note
              ? "bg-[#F59E0B] text-[#451A03] hover:bg-[#E68F00]"
              : "bg-navy text-white hover:bg-navy-700",
          )}
        >
          {busy ? "Sending…" : note ? "Save internal note" : "Send email"}
        </button>
      </div>
    </form>
  );
}
