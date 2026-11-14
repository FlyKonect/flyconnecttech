"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { AuthHeading } from "@/components/auth/auth-layouts";
import { FormError } from "@/components/auth/form-message";
import { useNewPassword } from "@/components/auth/new-password-fields";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { routes } from "@/lib/routes";

export type InvitationDetails = {
  email: string;
  name: string;
  phone: string | null;
  area: "portal" | "team";
  roleLabel: string;
  company: string | null;
};

/** Accept the invitation: verify the email and set a password (screen 03). */
export function AcceptInvitationForm({
  token,
  invitation,
}: {
  token: string;
  invitation: InvitationDetails;
}) {
  const router = useRouter();
  const newPassword = useNewPassword();
  const [error, setError] = React.useState("");
  const [nameError, setNameError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    setNameError(name ? "" : "Enter your name");
    const problem = newPassword.check();
    if (!name || problem) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const result = await apiFetch<{ area: "portal" | "team" }>(
        `/accounts/invitations/${token}/accept`,
        {
          method: "POST",
          body: {
            name,
            phone: String(form.get("phone") ?? "").trim() || undefined,
            password: newPassword.password,
          },
        },
      );
      router.replace(
        `${result.area === "team" ? routes.teamSignIn : routes.portalSignIn}?activated=1`,
      );
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <>
      <p className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-[13px] font-bold text-[#15803D]">
        <Check aria-hidden="true" className="size-3.5" />
        Email verified
      </p>
      <div className="mt-3">
        <AuthHeading>Set your password</AuthHeading>
      </div>
      <p className="mt-2.5 text-base leading-[1.6] text-muted-foreground">
        Last step for {invitation.email}. Check your details and choose a
        password.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-6 flex flex-col gap-3.5"
        noValidate
      >
        <Field label="Full name" error={nameError}>
          <Input
            name="name"
            autoComplete="name"
            defaultValue={invitation.name}
            required
          />
        </Field>
        <Field label="Phone (optional)">
          <Input
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={invitation.phone ?? ""}
          />
        </Field>
        {newPassword.fields({
          password: "New password",
          confirm: "Confirm password",
        })}
        <FormError>{error}</FormError>
        <Button
          type="submit"
          size="lg"
          className="h-[52px] text-base"
          disabled={busy}
        >
          {busy ? "Activating…" : "Activate account"}
        </Button>
        <p className="text-[13px] text-muted-foreground">
          {invitation.company
            ? `Company: ${invitation.company} · set by the FlyConnect Tech team`
            : `Role: ${invitation.roleLabel} · set by the FlyConnect Tech team`}
        </p>
      </form>
    </>
  );
}
