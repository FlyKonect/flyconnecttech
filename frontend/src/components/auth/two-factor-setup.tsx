"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

import { AuthHeading } from "@/components/auth/auth-layouts";
import { FormError } from "@/components/auth/form-message";
import { authErrorMessage } from "@/components/auth/sign-in-messages";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Stepper } from "@/components/ui/stepper";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/routes";

type Setup = { uri: string; secret: string; backupCodes: string[] };

/**
 * The authenticator app lists the account under the QR code's label. The
 * backend's sign-in system knows people by a private key (customer and team
 * accounts are separate), so put the real email there instead.
 */
export function withEmailLabel(uri: string, email: string): string {
  const url = new URL(uri);
  const issuer = url.searchParams.get("issuer") ?? "FlyConnect Tech";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}${url.search}`;
}

/**
 * Two-factor setup for team members (docs/01, section 3). Not in the design,
 * so it is built from the design system:
 * 1. confirm the password, 2. scan the code and type the 6 digits,
 * 3. save the backup codes.
 */
export function TwoFactorSetup({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [setup, setSetup] = React.useState<Setup | null>(null);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const step = done ? 3 : setup ? 2 : 1;

  async function start(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get("password"));
    setError("");
    setBusy(true);
    const { data, error: failed } = await authClient.twoFactor.enable({
      password,
    });
    setBusy(false);
    if (failed || !data) {
      setError(
        failed?.status === 400 || failed?.status === 401
          ? "That password is not right."
          : authErrorMessage(failed ?? {}),
      );
      return;
    }
    // We only use authenticator apps, so the answer always has a QR link.
    if (!("totpURI" in data)) {
      setError("We could not start the setup. Please try again.");
      return;
    }
    const secret = new URL(data.totpURI).searchParams.get("secret") ?? "";
    setSetup({
      uri: withEmailLabel(data.totpURI, email),
      secret,
      backupCodes: data.backupCodes,
    });
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code")).replace(
      /\s+/g,
      "",
    );
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setError("");
    setBusy(true);
    const { error: failed } = await authClient.twoFactor.verifyTotp({ code });
    setBusy(false);
    if (failed) {
      setError(
        failed.status === 429
          ? authErrorMessage(failed)
          : "That code is not right. Codes change every 30 seconds: try the newest one.",
      );
      return;
    }
    setDone(true);
  }

  return (
    <>
      <AuthHeading size="card">Set up two-factor sign-in</AuthHeading>
      <p className="mt-2 text-[15px] leading-[1.6] text-muted-foreground">
        Hi {name.split(/\s+/)[0]}. Team accounts need a code from an
        authenticator app, such as Google Authenticator or Microsoft
        Authenticator, each time you sign in.
      </p>
      <Stepper
        className="mt-5"
        steps={["Password", "Scan", "Backup codes"]}
        current={step}
      />

      {step === 1 ? (
        <form
          onSubmit={start}
          className="mt-6 flex flex-col gap-3.5"
          noValidate
        >
          <Field label="Confirm your password">
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
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
            {busy ? "Checking…" : "Continue"}
          </Button>
        </form>
      ) : null}

      {step === 2 && setup ? (
        <form onSubmit={verify} className="mt-6 flex flex-col gap-4" noValidate>
          <p className="text-sm leading-[1.6] text-body">
            Scan this code with your authenticator app, then type the 6-digit
            code it shows.
          </p>
          <div className="self-center rounded-2xl border border-line bg-white p-4">
            <QRCode
              value={setup.uri}
              size={176}
              title="Code to scan with your authenticator app"
            />
          </div>
          <div className="rounded-xl bg-portal-bg px-4 py-3 text-sm">
            <p className="font-semibold text-body">
              Cannot scan? Enter this key:
            </p>
            <p
              data-testid="totp-secret"
              className="mt-1 font-mono text-[15px] font-bold tracking-wider break-all"
            >
              {setup.secret.match(/.{1,4}/g)?.join(" ")}
            </p>
          </div>
          <Field label="6-digit code">
            <Input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              className="tracking-[0.2em]"
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
            {busy ? "Checking…" : "Turn on two-factor"}
          </Button>
        </form>
      ) : null}

      {step === 3 && setup ? (
        <div className="mt-6 flex flex-col gap-4" role="status">
          <p className="rounded-2xl border border-[#BBF7D0] bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#166534]">
            Two-factor sign-in is on.
          </p>
          <p className="text-sm leading-[1.6] text-body">
            Save these backup codes somewhere safe, such as a password manager.
            Each one works once, if you ever lose your phone. You will not see
            them again.
          </p>
          <ul
            aria-label="Backup codes"
            className="grid grid-cols-2 gap-2 rounded-xl bg-portal-bg p-4 font-mono text-[15px] font-bold"
          >
            {setup.backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <Button
            size="lg"
            className="h-[52px] text-base"
            onClick={() => {
              router.replace(routes.team);
              router.refresh();
            }}
          >
            I have saved them. Continue
          </Button>
        </div>
      ) : null}
    </>
  );
}
