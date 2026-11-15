"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  projectStatuses,
  projectTypes,
  type ProjectStatus,
  type UserStatus,
} from "@/lib/labels";
import { projectSchema, type NewProjectInput } from "@/lib/team/forms";

import { LineUp } from "./add-customer-form";

/**
 * The customer page's header button: Resend invitation while they are
 * invited, Send password reset link once they are active.
 */
export function AccountButton({
  userId,
  email,
  status,
}: {
  userId: string;
  email: string;
  status: UserStatus;
}) {
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);
  if (status === "DISABLED") return null;
  const invited = status === "INVITED";

  async function send() {
    setBusy(true);
    try {
      await apiFetch(
        `/team/users/${userId}/${invited ? "invitation" : "password-reset"}`,
        { method: "POST" },
      );
      toast(
        invited
          ? `Invitation sent again to ${email}`
          : `Password reset link sent to ${email}`,
      );
    } catch (failed) {
      toast(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant={invited ? "navy" : "outline"}
      onClick={send}
      disabled={busy}
    >
      {busy
        ? "Sending…"
        : invited
          ? "Resend invitation"
          : "Send password reset link"}
    </Button>
  );
}

/** A project's status, as a small dropdown for super admins and admins. */
export function ProjectStatusSelect({
  customerId,
  project,
}: {
  customerId: string;
  project: { id: string; code: string; name: string; status: ProjectStatus };
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = React.useState(false);

  async function change(status: ProjectStatus) {
    setBusy(true);
    try {
      await apiFetch(
        `/team/customers/${customerId}/projects/${project.id}/status`,
        { method: "POST", body: { status } },
      );
      toast(`${project.code} is now ${projectStatuses[status].label}`);
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Select
      aria-label={`Status of ${project.name}`}
      value={project.status}
      disabled={busy}
      onChange={(event) => change(event.target.value as ProjectStatus)}
      className="h-10 w-auto py-0 pr-9 text-[13px] font-bold"
    >
      {Object.entries(projectStatuses).map(([value, { label }]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </Select>
  );
}

/** The "Add project" row under the customer's projects. */
export function AddProjectRow({
  customerId,
  company,
}: {
  customerId: string;
  company: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const form = useForm<NewProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", type: "WEBSITE" },
  });

  const add = form.handleSubmit(async (values) => {
    setError("");
    try {
      await apiFetch(`/team/customers/${customerId}/projects`, {
        method: "POST",
        body: values,
      });
      toast(`Project added for ${company}`);
      form.reset();
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    }
  });

  return (
    <form
      noValidate
      onSubmit={add}
      aria-label="Add project"
      className="mt-3 flex flex-col gap-2 rounded-2xl bg-[#F6F8FC] p-3.5"
    >
      <div className="flex flex-wrap items-start gap-3">
        <Field
          label="New project name"
          error={form.formState.errors.name?.message}
          className="flex-[2_1_220px]"
        >
          <Input
            placeholder="For example: Mobile booking app"
            {...form.register("name")}
          />
        </Field>
        <Field label="Project type" className="flex-[1_1_180px]">
          <Select {...form.register("type")}>
            {Object.entries(projectTypes).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <LineUp>
          <Button
            type="submit"
            className="h-[50px]"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Adding…" : "Add project"}
          </Button>
        </LineUp>
      </div>
      {error ? <FormError>{error}</FormError> : null}
    </form>
  );
}
