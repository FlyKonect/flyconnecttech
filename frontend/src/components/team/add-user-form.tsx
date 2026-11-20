"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import { FormError } from "@/components/auth/form-message";
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

const ROLE_ORDER: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];

/**
 * Add user (screen 30, left): name, work email, job title and the role
 * cards. Roles this person may not give are greyed out, with the reason.
 */
export function AddUserForm({ canInvite }: { canInvite: TeamRole[] }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const form = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", jobTitle: "", role: "DEVELOPER" },
  });
  const errors = form.formState.errors;
  const first = firstName(
    useWatch({ control: form.control, name: "name" }),
    "them",
  );

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
      <section
        aria-labelledby="member-card"
        className="rounded-[22px] border border-line-2 bg-white p-6"
      >
        <h2 id="member-card" className="text-[17px] font-bold">
          Team member
        </h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
          <Field label="Full name" required error={errors.name?.message}>
            <Input autoComplete="name" {...form.register("name")} />
          </Field>
          <Field label="Work email" required error={errors.email?.message}>
            <Input
              type="email"
              autoComplete="email"
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
              {...form.register("jobTitle")}
            />
          </Field>
        </div>

        <p id="role-label" className="mt-[22px] text-[15px] font-bold">
          Role *
        </p>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <RadioCards
              aria-labelledby="role-label"
              value={field.value}
              onValueChange={(value) => field.onChange(value as TeamRole)}
              className="mt-3 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]"
            >
              {ROLE_ORDER.map((role) => {
                const off = !canInvite.includes(role);
                return (
                  <RadioCard
                    key={role}
                    value={role}
                    disabled={off}
                    showDot="end"
                    title={roles[role].label}
                    description={roleDescriptions[role]}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex-[1_1_260px] text-[13px] text-muted-foreground">
          We email {first} an invitation to verify their email and set a
          password.
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
            {form.formState.isSubmitting ? "Sending…" : "Send invitation"}
          </Button>
        </span>
      </div>
    </form>
  );
}
