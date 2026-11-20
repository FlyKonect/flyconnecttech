"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  authErrorMessage,
  destinationAfterSignIn,
} from "@/components/auth/sign-in-messages";
import { FormError, FormNotice } from "@/components/auth/form-message";
import { useVisitKey } from "@/components/auth/use-visit-key";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { authClient, signInSide } from "@/lib/auth/auth-client";
import { routes } from "@/lib/routes";

/** Customer sign in (screen 01). Empty again each time the page is shown. */
export function SignInForm() {
  return <SignInFields key={useVisitKey()} />;
}

function SignInFields() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const notice =
    params.get("activated") === "1"
      ? "Your account is active. Sign in with your new password."
      : params.get("reset") === "1"
        ? "Your password has been changed. Sign in with your new password."
        : null;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setBusy(true);
    try {
      const { data, error: failed } = await authClient.signIn.email({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
        rememberMe: form.get("keep") === "on",
        fetchOptions: signInSide("customer"),
      });
      if (failed) {
        setError(authErrorMessage(failed));
        return;
      }
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        // A team account with two-factor: its code is asked on Team sign in.
        router.push(`${routes.teamSignIn}?team=1`);
        return;
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
      {notice ? <FormNotice>{notice}</FormNotice> : null}
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
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>
        <div className="flex items-center justify-between gap-3 text-sm">
          <Checkbox name="keep" defaultChecked>
            Keep me signed in
          </Checkbox>
          <Link
            href={routes.portalForgotPassword}
            className="inline-flex min-h-11 items-center font-bold text-gold-text"
          >
            Forgot password?
          </Link>
        </div>
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
    </>
  );
}
