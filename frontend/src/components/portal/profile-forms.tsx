"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BellRing,
  Check,
  KeyRound,
  Lock,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { SignedInDevices } from "@/components/shell/signed-in-devices";
import { useNewPassword } from "@/components/auth/new-password-fields";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { countryOptions } from "@/lib/countries";
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
      className="min-w-0 flex-[1.4_1_440px] overflow-hidden rounded-[22px] border border-line-2 bg-white shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
    >
      {/* Header band: who this is, at a glance. */}
      <div className="relative bg-[linear-gradient(120deg,#021A54_0%,#0C3584_100%)] px-6 pt-6 pb-5 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            name={profile.name}
            tone="gold"
            className="size-16 font-heading text-[22px] ring-4 ring-white/15"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-xl font-bold break-words">
              {profile.name}
            </h2>
            {subtitle ? (
              <p className="text-sm text-on-navy">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      <form onSubmit={save} noValidate className="p-6">
        <SectionTitle icon={UserRound}>Personal details</SectionTitle>
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <Field label="Full name" error={errors.name?.message}>
            <Input
              className="h-12"
              autoComplete="name"
              {...form.register("name")}
            />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input
              className="h-12"
              type="tel"
              autoComplete="tel"
              {...form.register("phone")}
            />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Select
              className="h-12"
              autoComplete="country-name"
              {...form.register("country")}
            >
              <option value="">Choose a country</option>
              {countryOptions(profile.country).map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
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

        <div className="mt-6 border-t border-line-3 pt-5">
          <SectionTitle icon={Lock}>Account</SectionTitle>
          <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
            <ReadOnly label="Email" value={profile.email} />
            {props.area === "team" ? (
              <>
                <ReadOnly
                  label="Role"
                  value={roles[props.profile.role].label}
                />
                {props.profile.jobTitle ? (
                  <ReadOnly label="Job title" value={props.profile.jobTitle} />
                ) : null}
              </>
            ) : (
              <ReadOnly label="Company" value={props.profile.company ?? ""} />
            )}
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            {isTeam
              ? "Your email, role and job title were set when your account was created. Ask a super admin or admin if any needs to change."
              : "Your company and email were set when the FlyConnect Tech team created your account. Ask them if either needs to change."}
          </p>
        </div>

        {isTeam ? null : (
          <fieldset className="mt-6 border-t border-line-3 pt-5">
            <legend className="sr-only">Email me when</legend>
            <SectionTitle icon={BellRing}>Email me when</SectionTitle>
            <div className="mt-3.5 flex flex-col gap-2 [&_label]:text-ink-2">
              {(
                [
                  ["replies", "The team replies to my request"],
                  [
                    "statusChanges",
                    "A status changes or more information is needed",
                  ],
                  ["weeklySummary", "Weekly summary of my requests"],
                ] as const
              ).map(([key, text]) => (
                <div
                  key={key}
                  className="rounded-[14px] border border-line-2 px-4 py-3 transition-colors hover:bg-[#F9FBFE]"
                >
                  <Checkbox {...form.register(`emailPrefs.${key}`)}>
                    {text}
                  </Checkbox>
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <div className="mt-6 flex justify-end border-t border-line-3 pt-5">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            <Check aria-hidden="true" className="size-4" />
            {form.formState.isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}

/** A small section heading inside a profile card, with its icon. */
function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 text-[15px] font-bold">
      <span
        aria-hidden="true"
        className="inline-flex size-7 items-center justify-center rounded-lg bg-tint text-navy-700"
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      {children}
    </h3>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-[13px] font-bold">{label}</p>
      <p
        title={value}
        className="flex h-12 items-center gap-2 truncate rounded-[10px] border border-line-2 bg-[#F6F8FC] px-3.5 text-[15px] font-medium text-body"
      >
        <span className="min-w-0 flex-1 truncate">{value}</span>
        <Lock
          aria-hidden="true"
          className="size-3.5 shrink-0 text-muted-foreground"
        />
      </p>
    </div>
  );
}

/**
 * Profile Settings, right column: Change password (screen 15) and the
 * signed-in devices.
 */
export function ChangePasswordCard({ timeZone }: { timeZone: string }) {
  // A new form after each change, so the fields start empty again.
  const [version, setVersion] = React.useState(0);
  return (
    <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-5 app:sticky app:top-[96px]">
      <section
        aria-labelledby="change-password"
        className="rounded-[22px] border border-line-2 bg-white p-6 shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold-text"
          >
            <KeyRound className="size-[21px]" strokeWidth={1.9} />
          </span>
          <div>
            <h2 id="change-password" className="text-[17px] font-bold">
              Change password
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              Changing it signs you out on your other devices.
            </p>
          </div>
        </div>
        <ChangePasswordForm
          key={version}
          onChanged={() => setVersion((v) => v + 1)}
        />
      </section>
      <SignedInDevices timeZone={timeZone} />
    </div>
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
