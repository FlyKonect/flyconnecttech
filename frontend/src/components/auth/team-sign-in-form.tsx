"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AuthHeading } from "@/components/auth/auth-layouts";
import {
  authErrorMessage,
  destinationAfterSignIn,
} from "@/components/auth/sign-in-messages";
import { FormError, FormNotice } from "@/components/auth/form-message";
import { useVisitKey } from "@/components/auth/use-visit-key";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/routes";

const NO_SERVER =
  "We could not reach the server. Check your connection and try again.";

/** The page's heading before the form has loaded (and on step 1). */
export function TeamSignInHeading() {
  return (
    <>
      <AuthHeading size="card">Team sign in</AuthHeading>
      <p className="mt-2 text-[15px] text-muted-foreground">
        For super admins, admins, managers and developers.
      </p>
    </>
  );
}

/**
 * Team sign in, in two steps:
 * 1. work email and password;
 * 2. only for accounts with two-factor: the code from the authenticator
 *    app, or one of the backup codes saved at setup.
 * On the very first sign-in there is no two-factor yet: step 1 leads
 * straight to the setup.
 *
 * It starts again at step 1, empty, each time the page is shown.
 */
export function TeamSignInForm() {
  return <TeamSignInSteps key={useVisitKey()} />;
}

function TeamSignInSteps() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = React.useState<"password" | "code">("password");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const notice =
    params.get("activated") === "1"
      ? "Your account is active. Sign in, then set up your authenticator app."
      : params.get("reset") === "1"
        ? "Your password has been changed. Sign in with your new password."
        : params.get("team") === "1"
          ? "This is a team account. Sign in here."
          : null;

  async function finish() {
    router.replace(await destinationAfterSignIn());
    router.refresh();
  }

  async function onPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const typed = String(form.get("email") ?? "").trim();
    setError("");
    setBusy(true);
    try {
      const { data, error: failed } = await authClient.signIn.email({
        email: typed,
        password: String(form.get("password")),
        rememberMe: false,
      });
      if (failed) {
        setError(authErrorMessage(failed));
        return;
      }
      setEmail(typed);
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        setStep("code");
        return;
      }
      await finish();
    } catch {
      setError(NO_SERVER);
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <CodeStep
        email={email}
        onSignedIn={finish}
        onStartAgain={(message) => {
          setStep("password");
          setError(message ?? "");
        }}
      />
    );
  }

  return (
    <>
      <TeamSignInHeading />
      {notice ? (
        <div className="mt-5">
          <FormNotice variant="info">{notice}</FormNotice>
        </div>
      ) : null}
      <form
        onSubmit={onPassword}
        className="mt-6 flex flex-col gap-3.5"
        noValidate
      >
        <Field label="Work email">
          <Input
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={email}
            required
            autoFocus={!email}
          />
        </Field>
        <Field label="Password">
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus={Boolean(email)}
          />
        </Field>
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Checking…" : "Continue"}
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

/**
 * Step 2: the authenticator code (6 digits, sent as soon as all six are
 * typed) or a backup code (sent with the button).
 */
function CodeStep({
  email,
  onSignedIn,
  onStartAgain,
}: {
  email: string;
  onSignedIn: () => Promise<void>;
  onStartAgain: (message?: string) => void;
}) {
  const [kind, setKind] = React.useState<"app" | "backup">("app");
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const sending = React.useRef(false);

  async function verify(value: string) {
    if (sending.current) return;
    sending.current = true;
    setError("");
    setBusy(true);
    try {
      const result =
        kind === "app"
          ? await authClient.twoFactor.verifyTotp({
              code: value,
              trustDevice: false,
            })
          : await authClient.twoFactor.verifyBackupCode({
              code: value,
              trustDevice: false,
            });
      if (result.error) {
        const failure = result.error.code ?? "";
        if (failure === "INVALID_TWO_FACTOR_COOKIE") {
          onStartAgain(
            "This sign-in took too long. Enter your password again to get a new code screen.",
          );
          return;
        }
        if (
          result.error.status === 429 ||
          failure === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE"
        ) {
          setError(authErrorMessage({ status: 429 }));
        } else if (failure === "ACCOUNT_TEMPORARILY_LOCKED") {
          setError(
            "Too many wrong codes. Your account is locked for a few minutes: try again later.",
          );
        } else {
          setError(
            kind === "app"
              ? "That code is not right. Codes change every 30 seconds: try the newest one."
              : "That backup code is not right, or it has been used already.",
          );
        }
        setCode("");
        return;
      }
      await onSignedIn();
    } catch {
      setError(NO_SERVER);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = kind === "app" ? code.replace(/\D/g, "") : code.trim();
    if (kind === "app" && value.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (kind === "backup" && !value) {
      setError("Enter one of your backup codes.");
      return;
    }
    void verify(value);
  }

  function onCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (kind === "backup") {
      setCode(event.target.value);
      return;
    }
    const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) void verify(digits);
  }

  function switchKind() {
    setKind(kind === "app" ? "backup" : "app");
    setCode("");
    setError("");
  }

  return (
    <>
      <AuthHeading size="card">Enter your code</AuthHeading>
      <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
        {kind === "app"
          ? "Open your authenticator app and enter the 6-digit code shown for FlyConnect Tech."
          : "Enter one of the backup codes you saved when you set up two-factor sign-in. Each code works once."}
      </p>
      <p className="mt-3 text-sm text-body">
        Signing in as <strong className="text-navy">{email}</strong>
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-5 flex flex-col gap-3.5"
        noValidate
      >
        {kind === "app" ? (
          <Field label="6-digit code">
            <Input
              key="app"
              name="code"
              value={code}
              onChange={onCodeChange}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              readOnly={busy}
              className="h-14 text-center text-2xl font-semibold tracking-[0.5em]"
            />
          </Field>
        ) : (
          <Field label="Backup code">
            <Input
              key="backup"
              name="code"
              value={code}
              onChange={onCodeChange}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              readOnly={busy}
              className="h-14 text-center text-lg font-semibold tracking-[0.15em]"
            />
          </Field>
        )}
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Checking…" : "Verify and sign in"}
        </Button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px]">
        <button
          type="button"
          onClick={switchKind}
          className="inline-flex min-h-9 cursor-pointer items-center font-bold text-gold-text"
        >
          {kind === "app"
            ? "Use a backup code instead"
            : "Use the authenticator app instead"}
        </button>
        <button
          type="button"
          onClick={() => onStartAgain()}
          className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 font-semibold text-body"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Start again
        </button>
      </div>
    </>
  );
}
