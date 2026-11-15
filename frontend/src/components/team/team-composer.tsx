"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Mode = "reply" | "note";

const MODES: Record<
  Mode,
  { tab: string; placeholder: string; note: string; send: string; done: string }
> = {
  reply: {
    tab: "Reply to customer",
    placeholder: "Reply to the customer",
    note: "The customer is notified by email",
    send: "Send to customer",
    done: "Reply sent to the customer",
  },
  note: {
    tab: "Internal note",
    placeholder: "Internal note for the team. Not visible to the customer.",
    note: "Visible to staff only",
    send: "Save internal note",
    done: "Internal note added. The customer cannot see it.",
  },
};

/**
 * The team's composer (screens 22 and 24): "Reply to customer", or an amber
 * "Internal note" that only the team sees.
 */
export function TeamComposer({ code }: { code: string }) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = React.useState<Mode>("reply");
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const note = mode === "note";
  const words = MODES[mode];

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) {
      setError(note ? "Write the note first." : "Write a reply first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/requests/${encodeURIComponent(code)}/messages`, {
        method: "POST",
        body: { kind: mode, body: text.trim() },
      });
      setText("");
      toast(words.done);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={send}
      noValidate
      data-mode={mode}
      className={cn(
        "overflow-hidden rounded-[22px]",
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
        {(Object.keys(MODES) as Mode[]).map((key) => {
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
              {MODES[key].tab}
            </button>
          );
        })}
      </div>
      <textarea
        aria-label={note ? "Internal note" : "Reply to the customer"}
        rows={4}
        value={text}
        maxLength={10000}
        onChange={(event) => setText(event.target.value)}
        placeholder={words.placeholder}
        className="block w-full resize-y bg-transparent px-4 py-3.5 text-[15px] text-navy outline-none placeholder:text-muted-foreground"
      />
      {error ? (
        <div className="px-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5">
        <span className="text-[13px] text-muted-foreground">{words.note}</span>
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
          {busy ? "Saving…" : words.send}
        </button>
      </div>
    </form>
  );
}
