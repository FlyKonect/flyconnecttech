"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormError } from "@/components/auth/form-message";
import { useNewPassword } from "@/components/auth/new-password-fields";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { roles } from "@/lib/labels";
import type { Profile } from "@/lib/portal/types";
import type { TeamProfile } from "@/lib/team/types";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  phone: z.string().trim().max(40, "Keep it under 40 characters"),
  country: z.string().trim().max(80, "Keep it under 80 characters"),
  timezone: z.string().min(1, "Choose a time zone"),
  // Customers only: the team has no email choices here.
  emailPrefs: z
    .object({
      replies: z.boolean(),
      statusChanges: z.boolean(),
      weeklySummary: z.boolean(),
    })
    .optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;

type ProfileFormProps =
  | { area: "portal"; profile: Profile; timeZones: TimeZoneOption[] }
  | { area: "team"; profile: TeamProfile; timeZones: TimeZoneOption[] };

/** "Europe/London (GMT)". */
type TimeZoneOption = { value: string; label: string };

/**
 * Profile Settings, left card (screen 15), for customers and the team.
 * Customers: company and email are read-only, with their email choices.
 * Team: email, role and job title are read-only.
 */
export function ProfileForm(props: ProfileFormProps) {
  const { profile, timeZones } = props;
  const isTeam = props.area === "team";
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      country: profile.country ?? "",
      timezone: profile.timezone,
      emailPrefs:
        props.area === "portal" ? props.profile.emailPrefs : undefined,
    },
  });
  const errors = form.formState.errors;
  const subtitle =
    props.area === "team"
      ? [roles[props.profile.role].label, props.profile.jobTitle]
          .filter(Boolean)
          .join(" · ")
      : [props.profile.jobTitle, props.profile.company]
          .filter(Boolean)
          .join(" · ");

  const save = form.handleSubmit(async (values) => {
    setError("");
    try {
      const { emailPrefs, ...details } = values;
      await apiFetch(isTeam ? "/team/profile" : "/portal/profile", {
        method: "PATCH",
        body: isTeam ? details : { ...details, emailPrefs },
      });
      toast("Changes saved");
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    }
  });

  return (
    <section
      aria-label="Your profile"
      className="min-w-0 flex-[1.4_1_440px] rounded-[22px] border border-line-2 bg-white p-6"
    >
      <div className="flex items-center gap-4">
        <Avatar
          name={profile.name}
          className="size-16 font-heading text-[22px]"
        />
        <div className="min-w-0">
          <h2 className="font-heading text-xl font-bold break-words">
            {profile.name}
          </h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <form onSubmit={save} noValidate>
        <div className="mt-[22px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <Field label="Full name" error={errors.name?.message}>
            <Input
              className="h-12"
              autoComplete="name"
              {...form.register("name")}
            />
          </Field>
          {props.area === "team" ? (
            <ReadOnly label="Role" value={roles[props.profile.role].label} />
          ) : (
            <ReadOnly label="Company" value={props.profile.company ?? ""} />
          )}
          <ReadOnly label="Email" value={profile.email} />
          <Field label="Phone" error={errors.phone?.message}>
            <Input
              className="h-12"
              type="tel"
              autoComplete="tel"
              {...form.register("phone")}
            />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input
              className="h-12"
              autoComplete="country-name"
              {...form.register("country")}
            />
          </Field>
          <Field label="Time zone" error={errors.timezone?.message}>
            <Select className="h-12" {...form.register("timezone")}>
              {timeZones.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          {isTeam
            ? "Your email, role and job title were set when your account was created. Ask a super admin or admin if any needs to change."
            : "Your company and email were set when the FlyConnect Tech team created your account. Ask them if either needs to change."}
        </p>

        {isTeam ? null : (
          <fieldset className="mt-[22px]">
            <legend className="mb-2.5 text-[15px] font-bold">
              Email me when
            </legend>
            <div className="flex flex-col gap-2.5 [&_label]:text-ink-2">
              <Checkbox {...form.register("emailPrefs.replies")}>
                The team replies to my request
              </Checkbox>
              <Checkbox {...form.register("emailPrefs.statusChanges")}>
                A status changes or more information is needed
              </Checkbox>
              <Checkbox {...form.register("emailPrefs.weeklySummary")}>
                Weekly summary of my requests
              </Checkbox>
            </div>
          </fieldset>
        )}

        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className="mt-[22px]"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-[13px] font-bold">{label}</p>
      <p
        title={value}
        className="flex h-12 items-center truncate rounded-[14px] border border-line-2 bg-[#F6F8FC] px-3.5 text-[15px] font-medium text-body"
      >
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}

/** Profile Settings, right card: Change password (screen 15). */
export function ChangePasswordCard() {
  // A new form after each change, so the fields start empty again.
  const [version, setVersion] = React.useState(0);
  return (
    <section
      aria-labelledby="change-password"
      className="min-w-0 flex-[1_1_300px] rounded-[22px] border border-line-2 bg-white p-6"
    >
      <h2 id="change-password" className="text-[17px] font-bold">
        Change password
      </h2>
      <ChangePasswordForm
        key={version}
        onChanged={() => setVersion((v) => v + 1)}
      />
    </section>
  );
}

function ChangePasswordForm({ onChanged }: { onChanged: () => void }) {
  const toast = useToast();
  const newPassword = useNewPassword();
  const [current, setCurrent] = React.useState("");
  const [currentError, setCurrentError] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setCurrentError(current ? "" : "Enter your current password");
    const problem = newPassword.check();
    if (!current || problem) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await apiFetch("/me/password", {
        method: "POST",
        body: { currentPassword: current, newPassword: newPassword.password },
      });
      toast("Password updated");
      onChanged();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3.5 flex flex-col gap-3.5" noValidate>
      <Field label="Current password" error={currentError}>
        <Input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          required
        />
      </Field>
      {newPassword.fields({
        password: "New password",
        confirm: "Confirm new password",
      })}
      <FormError>{error}</FormError>
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
