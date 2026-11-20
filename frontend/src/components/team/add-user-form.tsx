"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Mail, Send, UserPlus } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { RadioCard, RadioCards } from "@/components/ui/choice";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiErrorMessage, apiFetch } from "@/lib/api";
import { roleDescriptions, roles, type TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import { firstName, newUserSchema, type NewUserInput } from "@/lib/team/forms";

import {
  PreviousAccountDialog,
  previousAccountIn,
  type PreviousAccount,
  type PreviousChoice,
} from "./previous-account-dialog";
import { ROLE_ICONS, RoleAccess } from "./role-permissions";

const ROLE_ORDER: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];

const card = "rounded-[22px] border border-line-2 bg-white p-6";

/**
 * Add user (screen 30): the person, their role, and beside it what the
 * chosen role can do. Roles this person may not give are greyed out, with
 * the reason.
 */
export function AddUserForm({
  canInvite,
  permissions,
}: {
  canInvite: TeamRole[];
  /** The backend's permission table, for the "What a … can do" panel. */
  permissions: Record<string, TeamRole[]>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const form = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", jobTitle: "", role: "DEVELOPER" },
  });
  const errors = form.formState.errors;
  const name = useWatch({ control: form.control, name: "name" });
  const role = useWatch({ control: form.control, name: "role" });
  const first = firstName(name, "them");

  // The email belonged to a deleted team account: ask Restore or Start fresh.
  const [previous, setPrevious] = React.useState<PreviousAccount | null>(null);

  async function submit(values: NewUserInput, choice?: PreviousChoice) {
    setError("");
    try {
      const created = await apiFetch<{ id: string; emailSent: boolean }>(
        "/team/users",
        {
          method: "POST",
          body: {
            ...values,
            jobTitle: values.jobTitle || undefined,
            previous: choice,
          },
        },
      );
      setPrevious(null);
      toast(
        created.emailSent
          ? choice === "restore"
            ? `Account restored. Invitation sent to ${values.email}`
            : `Invitation sent to ${values.email}`
          : "User added, but the invitation email could not be sent. Use Resend invitation.",
      );
      router.push(routes.teamUsers);
    } catch (failed) {
      setPrevious(null);
      const found = previousAccountIn(failed);
      if (found) {
        setPrevious(found);
        return;
      }
      if (failed instanceof ApiError && failed.code === "EMAIL_TAKEN") {
        form.setError(
          "email",
          { message: failed.message },
          { shouldFocus: true },
        );
        return;
      }
      setError(apiErrorMessage(failed));
    }
  }
  const send = form.handleSubmit((values) => submit(values));

  return (
    <div className="flex flex-wrap items-start gap-5">
      <form
        noValidate
        onSubmit={send}
        className="flex min-w-0 flex-[1.5_1_520px] flex-col gap-4"
      >
        {previous ? (
          <PreviousAccountDialog
            previous={previous}
            email={form.getValues("email")}
            onChoose={(choice) => submit(form.getValues(), choice)}
            onCancel={() => setPrevious(null)}
          />
        ) : null}

        <section aria-labelledby="member-card" className={card}>
          <div className="flex items-center gap-3.5">
            {name.trim() ? (
              <Avatar name={name} size="lg" />
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-tint text-navy-700"
              >
                <UserPlus className="size-[22px]" strokeWidth={1.9} />
              </span>
            )}
            <div className="min-w-0">
              <h2 id="member-card" className="text-[17px] font-bold">
                Team member
              </h2>
              <p className="truncate text-[13px] text-muted-foreground">
                {name.trim() || "Their name, work email and job title"}
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
            <Field label="Full name" required error={errors.name?.message}>
              <Input
                autoComplete="name"
                placeholder="e.g. Ayesha Khan"
                {...form.register("name")}
              />
            </Field>
            <Field label="Work email" required error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                {...form.register("email")}
              />
            </Field>
            <Field
              label="Job title (optional)"
              error={errors.jobTitle?.message}
              className="col-span-full"
            >
              <Input
                autoComplete="organization-title"
                placeholder="e.g. Frontend developer"
                {...form.register("jobTitle")}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="role-label" className={card}>
          <h2 id="role-label" className="text-[17px] font-bold">
            Role *
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Decides what they can see and do. The panel beside shows the
            details.
          </p>
          <Controller
            control={form.control}
            name="role"
            render={({ field }) => (
              <RadioCards
                aria-labelledby="role-label"
                value={field.value}
                onValueChange={(value) => field.onChange(value as TeamRole)}
                className="mt-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]"
              >
                {ROLE_ORDER.map((option) => {
                  const off = !canInvite.includes(option);
                  const Icon = ROLE_ICONS[option];
                  return (
                    <RadioCard
                      key={option}
                      value={option}
                      disabled={off}
                      showDot="end"
                      title={
                        <span className="flex items-center gap-2">
                          <Icon
                            aria-hidden="true"
                            className="size-[18px] text-navy-700"
                            strokeWidth={1.9}
                          />
                          {roles[option].label}
                        </span>
                      }
                      description={roleDescriptions[option]}
                    >
                      {off ? (
                        <span className="text-xs font-semibold text-body">
                          Only a super admin can add another super admin
                        </span>
                      ) : null}
                    </RadioCard>
                  );
                })}
              </RadioCards>
            )}
          />
        </section>

        {form.formState.isSubmitted && Object.keys(errors).length ? (
          <p role="alert" className="text-sm font-semibold text-danger">
            Please fill in the highlighted fields.
          </p>
        ) : null}
        {error ? <FormError>{error}</FormError> : null}

        <div className={`${card} flex flex-wrap items-center gap-3 py-4`}>
          <p className="flex min-w-0 flex-[1_1_260px] items-start gap-2 text-[13px] text-muted-foreground">
            <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              We email {first} an invitation to verify their email and set a
              password. The link works for 48 hours.
            </span>
          </p>
          <span className="flex flex-wrap gap-2.5">
            <Link
              href={routes.teamUsers}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              <Send aria-hidden="true" className="size-4" />
              {form.formState.isSubmitting ? "Sending…" : "Send invitation"}
            </Button>
          </span>
        </div>
      </form>

      <RoleAccess role={role} permissions={permissions} />
    </div>
  );
}
