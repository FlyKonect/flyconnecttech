"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";

/**
 * The customer's client review of a module: Approve module (it is marked
 * Done) or Request changes (a note is needed; a new round starts). The
 * team is told either way.
 */
export function ModuleReview({
  code,
  moduleId,
  moduleName,
}: {
  code: string;
  moduleId: string;
  moduleName: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = React.useState<"approve" | "changes" | null>(
    null,
  );
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function send(decision: "approve" | "changes") {
    if (decision === "changes" && !note.trim()) {
      setError("Say what should change");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(
        `/portal/projects/${encodeURIComponent(code)}/modules/${moduleId}/review`,
        { method: "POST", body: { decision, note: note.trim() } },
      );
      toast(
        decision === "approve"
          ? `${moduleName} approved. Thank you!`
          : "Thanks. The team has your changes.",
      );
      setAsking(null);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="group"
      aria-label={`Review ${moduleName}`}
      className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3.5"
    >
      <p className="text-sm text-[#92400E]">
        <strong className="block text-[15px] text-[#78350F]">
          Ready for your review
        </strong>
        Have a look, then approve it or tell us what should change.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setNote("");
            setError("");
            setAsking("changes");
          }}
        >
          Request changes
        </Button>
        <Button
          variant="success"
          onClick={() => {
            setNote("");
            setError("");
            setAsking("approve");
          }}
        >
          Approve module
        </Button>
      </div>
      {asking ? (
        <Dialog open onOpenChange={(value) => (value ? null : setAsking(null))}>
          <DialogContent>
            <DialogTitle>
              {asking === "approve"
                ? `Approve ${moduleName}?`
                : `Request changes to ${moduleName}`}
            </DialogTitle>
            <DialogDescription>
              {asking === "approve"
                ? "It is marked Done. Add a note for the team if you like."
                : "Tell the team what should change. They work on it and send it back for your review."}
            </DialogDescription>
            <form
              noValidate
              className="mt-4 flex flex-col gap-3.5"
              onSubmit={(event) => {
                event.preventDefault();
                void send(asking);
              }}
            >
              <Field
                label={
                  asking === "approve"
                    ? "Note (optional)"
                    : "What should change"
                }
                required={asking === "changes"}
                error={error}
              >
                <Textarea
                  rows={4}
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAsking(null)}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={asking === "approve" ? "success" : "navy"}
                  disabled={busy}
                >
                  {busy
                    ? "Sending…"
                    : asking === "approve"
                      ? "Approve module"
                      : "Send changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
