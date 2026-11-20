"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";

/**
 * "Change email" for a team member or a customer's contact (super admins
 * and admins). Someone invited: the email changes at once, with a new
 * invitation. Someone active: the new address gets a link to confirm.
 */
export function ChangeEmailDialog({
  user,
  onClose,
}: {
  user: { id: string; name: string; email: string; status: string };
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const first = user.name.split(/\s+/)[0] || user.name;
  const invited = user.status === "INVITED";

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const next = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setError("Enter a valid email address");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { result } = await apiFetch<{
        result: "changed" | "confirmation-sent";
      }>(`/team/users/${user.id}/email`, {
        method: "POST",
        body: { email: next },
      });
      toast(
        result === "changed"
          ? `Email changed. A new invitation went to ${next}`
          : `Confirmation link sent to ${next}`,
      );
      onClose();
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Change {user.name}&apos;s email</DialogTitle>
        <DialogDescription>
          {invited
            ? `${first} hasn't activated the account yet: the email changes now and a new invitation goes to the new address.`
            : `We email a confirmation link to the new address. The email changes when ${first} confirms it, and ${first} is signed out everywhere.`}
        </DialogDescription>
        <form noValidate onSubmit={save} className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Now: <span className="break-all text-body">{user.email}</span>
          </p>
          <Field label="New email address" required>
            <Input
              type="email"
              autoComplete="off"
              value={email}
              maxLength={191}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          {error ? <FormError>{error}</FormError> : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : invited ? "Change email" : "Send link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** The customer page's "Change email" button, for the contact. */
export function ChangeEmailButton({
  user,
}: {
  user: { id: string; name: string; email: string; status: string };
}) {
  const [open, setOpen] = React.useState(false);
  if (user.status === "DISABLED") return null;
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Change email
      </Button>
      {open ? (
        <ChangeEmailDialog user={user} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}
