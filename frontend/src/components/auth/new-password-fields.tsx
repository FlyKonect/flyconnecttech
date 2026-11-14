"use client";

import * as React from "react";

import { PasswordChecklist } from "@/components/auth/password-checklist";
import { Field, Input } from "@/components/ui/field";
import { meetsPasswordRules } from "@/lib/auth/password-rules";

/**
 * "New password" and "Confirm password" with the rules checklist, for the
 * invitation and reset screens. `check()` returns an error message, or ""
 * when both fields are fine.
 */
export function useNewPassword() {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [tried, setTried] = React.useState(false);

  const passwordError =
    tried && !meetsPasswordRules(password)
      ? "Choose a password that meets the three rules below."
      : "";
  const confirmError =
    tried && confirm !== password ? "The two passwords are not the same." : "";

  return {
    password,
    check: () => {
      setTried(true);
      if (!meetsPasswordRules(password)) return "Choose a stronger password.";
      if (confirm !== password) return "The two passwords are not the same.";
      return "";
    },
    fields: (labels: { password: string; confirm: string }) => (
      <>
        <Field label={labels.password} error={passwordError}>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </Field>
        <Field label={labels.confirm} error={confirmError}>
          <Input
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        </Field>
        <PasswordChecklist password={password} />
      </>
    ),
  };
}
