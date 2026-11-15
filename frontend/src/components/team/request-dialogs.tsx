"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox, Field, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";

/** The design's resolution summary (screen 25), ready to edit. */
const RESOLVE_TEXT =
  "The fix is live. Please check on your side; you can confirm the resolution or ask for more help on this request.";

type DialogProps = {
  code: string;
  title: string;
  /** The button that opens it. */
  children: React.ReactNode;
};

/** Sends to the backend, then closes, says so and refreshes the page. */
function useSend(code: string) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const send = async (
    path: string,
    body: object,
    done: string,
    close: () => void,
  ) => {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/requests/${encodeURIComponent(code)}/${path}`, {
        method: "POST",
        body,
      });
      close();
      toast(done);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, setError, send };
}

/**
 * The resolve dialog (screen 25): a summary for the customer, and whether to
 * email them and ask them to confirm.
 */
export function ResolveDialog({ code, title, children }: DialogProps) {
  const [open, setOpen] = React.useState(false);
  const [summary, setSummary] = React.useState(RESOLVE_TEXT);
  const [email, setEmail] = React.useState(true);
  const { busy, error, setError, send } = useSend(code);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[540px]">
        <span className="inline-flex size-[52px] items-center justify-center rounded-2xl bg-[#DCFCE7] text-[#15803D]">
          <Check aria-hidden="true" className="size-6" strokeWidth={2.4} />
        </span>
        <DialogTitle className="mt-4">Resolve {code}</DialogTitle>
        <DialogDescription>{title}</DialogDescription>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void send(
              "resolve",
              { summary: summary.trim(), email },
              `${code} marked as resolved`,
              () => setOpen(false),
            );
          }}
        >
          <Field
            label="Resolution summary for the customer"
            className="mt-[18px]"
          >
            <Textarea
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
          <Checkbox
            className="mt-3.5"
            checked={email}
            onChange={(event) => setEmail(event.target.checked)}
          >
            Email the customer and ask them to confirm
          </Checkbox>
          <p className="mt-3.5 rounded-[14px] bg-[#F6F8FC] px-3.5 py-3 text-[13px] leading-[1.55] text-body">
            The customer can confirm the fix (the request closes) or choose
            &quot;I still need help&quot; to reopen it.
          </p>
          {error ? (
            <div className="mt-4">
              <FormError>{error}</FormError>
            </div>
          ) : null}
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="success" size="lg" disabled={busy}>
              {busy ? "Saving…" : "Mark as resolved"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * "Request more info": a message to the customer (the design's question,
 * ready to edit), then the request waits for the customer.
 */
export function RequestInfoDialog({
  code,
  title,
  startText,
  children,
}: DialogProps & { startText: string }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(startText);
  const { busy, error, setError, send } = useSend(code);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogTitle>Request more information</DialogTitle>
        <DialogDescription>
          {code} · {title}
        </DialogDescription>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) {
              setError("Write your question for the customer.");
              return;
            }
            void send(
              "request-info",
              { body: text.trim() },
              "More information requested from the customer",
              () => setOpen(false),
            );
          }}
        >
          <Field label="Message to the customer" className="mt-[18px]">
            <Textarea
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </Field>
          <p className="mt-3.5 rounded-[14px] bg-[#F6F8FC] px-3.5 py-3 text-[13px] leading-[1.55] text-body">
            The request moves to Waiting for Customer, and the customer is
            notified.
          </p>
          {error ? (
            <div className="mt-4">
              <FormError>{error}</FormError>
            </div>
          ) : null}
          <DialogFooter className="mt-5">
            <DialogClose asChild>
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Sending…" : "Send to customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
