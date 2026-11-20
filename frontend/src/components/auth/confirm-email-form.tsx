"use client";

import * as React from "react";
import Link from "next/link";

import { AuthHeading, AuthLead } from "@/components/auth/auth-layouts";
import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { routes } from "@/lib/routes";

/** "Confirm new email": one button, then where to sign in. */
export function ConfirmEmailForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState<"portal" | "team" | null>(null);

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const result = await apiFetch<{ area: "portal" | "team" }>(
        `/accounts/email-change/${encodeURIComponent(token)}/confirm`,
        { method: "POST" },
      );
      setDone(result.area);
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  if (done) {
    return (
      <>
        <AuthHeading>Your new email is confirmed</AuthHeading>
        <AuthLead>
          Sign in with {email} and your usual password. You were signed out on
          every device.
        </AuthLead>
        <div className="mt-7 flex flex-col gap-3">
          <Button asChild size="lg" className="h-[52px] text-base">
            <Link
              href={done === "team" ? routes.teamSignIn : routes.portalSignIn}
            >
              Go to sign in
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthHeading>Confirm your new email</AuthHeading>
      <AuthLead>
        From now on you sign in to FlyConnect Tech with{" "}
        <strong className="break-all text-navy">{email}</strong>. Your password
        stays the same.
      </AuthLead>
      <div className="mt-7 flex flex-col gap-3">
        {error ? <FormError>{error}</FormError> : null}
        <Button
          size="lg"
          className="h-[52px] text-base"
          onClick={confirm}
          disabled={busy}
        >
          {busy ? "Confirming…" : "Confirm new email"}
        </Button>
      </div>
    </>
  );
}
