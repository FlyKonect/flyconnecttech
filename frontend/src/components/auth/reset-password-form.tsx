"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthHeading, AuthLead } from "@/components/auth/auth-layouts";
import { FormError } from "@/components/auth/form-message";
import { useNewPassword } from "@/components/auth/new-password-fields";
import { Button } from "@/components/ui/button";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { routes } from "@/lib/routes";

/** Choose a new password from the emailed link (screen 05). */
export function ResetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const router = useRouter();
  const newPassword = useNewPassword();
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = newPassword.check();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const result = await apiFetch<{ area: "portal" | "team" }>(
        `/accounts/password/reset/${token}`,
        { method: "POST", body: { password: newPassword.password } },
      );
      router.replace(
        `${result.area === "team" ? routes.teamSignIn : routes.portalSignIn}?reset=1`,
      );
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <>
      <AuthHeading>Choose a new password</AuthHeading>
      <AuthLead>For {email}</AuthLead>
      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-3.5"
        noValidate
      >
        {newPassword.fields({
          password: "New password",
          confirm: "Confirm new password",
        })}
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Saving…" : "Update password"}
        </Button>
      </form>
    </>
  );
}
