"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { routes } from "@/lib/routes";

/**
 * Forgot password (screen 04). The answer is the same whether or not the
 * email has an account, so nobody can use this page to test emails.
 */
export function ForgotPasswordForm({ area }: { area: "portal" | "team" }) {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const signIn = area === "team" ? routes.teamSignIn : routes.portalSignIn;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await apiFetch("/accounts/password/forgot", {
        method: "POST",
        // Customer and team accounts are separate: say which one.
        body: { email, side: area === "team" ? "team" : "customer" },
      });
      setSentTo(email);
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  const back = (
    <p className="mt-6 text-center">
      <Link
        href={signIn}
        className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-body"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to sign in
      </Link>
    </p>
  );

  if (sentTo) {
    return (
      <div role="status">
        <p className="mt-6 rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5] px-[18px] py-4 text-[15px] leading-[1.6] text-[#166534]">
          If there is an account for <b>{sentTo}</b>, we have sent it a link to
          choose a new password. The link works once and expires in 48 hours.
          Check your spam folder if it does not arrive.
        </p>
        {back}
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4" noValidate>
        <Field label="Email address">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
          />
        </Field>
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
      {back}
    </>
  );
}
