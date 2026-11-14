"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  authErrorMessage,
  destinationAfterSignIn,
} from "@/components/auth/sign-in-messages";
import { FormError, FormNotice } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/routes";

/**
 * Team sign in (screen 16): email, password and the authenticator code.
 * On the very first sign-in there is no code yet: the person is taken to
 * the two-factor setup instead.
 */
export function TeamSignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const notice =
    params.get("activated") === "1"
      ? "Your account is active. Sign in, then set up your authenticator app."
      : params.get("reset") === "1"
        ? "Your password has been changed. Sign in with your new password."
        : params.get("team") === "1"
          ? "This is a team account. Sign in here with your two-factor code."
          : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").replace(/\s+/g, "");
    setError("");
    setBusy(true);
    try {
      const { data, error: failed } = await authClient.signIn.email({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
        rememberMe: false,
      });
      if (failed) {
        setError(authErrorMessage(failed));
        return;
      }

      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        if (!/^\d{6}$/.test(code)) {
          setError("Enter the 6-digit code from your authenticator app.");
          return;
        }
        const verified = await authClient.twoFactor.verifyTotp({
          code,
          trustDevice: false,
        });
        if (verified.error) {
          setError(
            verified.error.status === 429
              ? authErrorMessage(verified.error)
              : "That code is not right. Codes change every 30 seconds: try the newest one.",
          );
          return;
        }
      }

      router.replace(await destinationAfterSignIn());
      router.refresh();
    } catch {
      setError(
        "We could not reach the server. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {notice ? (
        <div className="mt-5">
          <FormNotice variant="info">{notice}</FormNotice>
        </div>
      ) : null}
      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-3.5"
        noValidate
      >
        <Field label="Work email">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
          />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <Field
          label="Two-factor code"
          hint="From your authenticator app. First sign-in? Leave it empty: you will set it up next."
        >
          <Input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]*"
            maxLength={7}
            className="tracking-[0.2em]"
          />
        </Field>
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-[13px] leading-[1.6] text-muted-foreground">
        New team member? Use the link in your invitation email to set your
        password first.{" "}
        <Link
          href={routes.teamForgotPassword}
          className="inline-flex min-h-9 items-center font-bold text-gold-text"
        >
          Forgot password?
        </Link>
      </p>
    </>
  );
}
