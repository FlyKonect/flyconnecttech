"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  projectStatuses,
  projectTypes,
  type ProjectStatus,
  type UserStatus,
} from "@/lib/labels";
import { plural } from "@/lib/plural";
import { routes } from "@/lib/routes";
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
      toast(apiErrorMessage(failed), "error");
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
      toast(apiErrorMessage(failed), "error");
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

/** "Edit company": rename the customer's company (super admins and admins). */
export function EditCompanyButton({
  customerId,
  company,
}: {
  customerId: string;
  company: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(company);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter the company name");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/customers/${customerId}/details`, {
        method: "POST",
        body: { company: name.trim() },
      });
      toast("Company name saved");
      setOpen(false);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setName(company);
          setError("");
          setOpen(true);
        }}
      >
        Edit company
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Edit company name</DialogTitle>
          <DialogDescription>
            The new name shows everywhere: lists, requests, reports and emails.
          </DialogDescription>
          <form noValidate onSubmit={save} className="mt-4 flex flex-col gap-4">
            <Field label="Company name" required>
              <Input
                value={name}
                maxLength={160}
                onChange={(event) => setName(event.target.value)}
              />
            </Field>
            {error ? <FormError>{error}</FormError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** "Edit" on a project row: its name and type (super admins and admins). */
export function EditProjectButton({
  customerId,
  project,
}: {
  customerId: string;
  project: { id: string; code: string; name: string; type: string };
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const form = useForm<NewProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      type: project.type as NewProjectInput["type"],
    },
  });

  const save = form.handleSubmit(async (values) => {
    setError("");
    try {
      await apiFetch(`/team/customers/${customerId}/projects/${project.id}`, {
        method: "POST",
        body: values,
      });
      toast(`${project.code} saved`);
      setOpen(false);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label={`Edit ${project.name}`}
        onClick={() => {
          form.reset({
            name: project.name,
            type: project.type as NewProjectInput["type"],
          });
          setError("");
          setOpen(true);
        }}
      >
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Edit {project.code}</DialogTitle>
          <DialogDescription>
            The customer sees the new name in their portal and on their
            requests.
          </DialogDescription>
          <form noValidate onSubmit={save} className="mt-4 flex flex-col gap-4">
            <Field
              label="Project name"
              required
              error={form.formState.errors.name?.message}
            >
              <Input {...form.register("name")} />
            </Field>
            <Field label="Project type">
              <Select {...form.register("type")}>
                {Object.entries(projectTypes).map(([value, { label }]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            {error ? <FormError>{error}</FormError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
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

/**
 * The customer page's "Delete customer" (super admins and admins). The
 * contact's account goes for good, the customer leaves the list and its
 * open requests are closed; projects and requests stay as history, and
 * adding the email again offers to restore them.
 */
export function DeleteCustomerButton({
  customerId,
  company,
  contactName,
  email,
  openRequests,
}: {
  customerId: string;
  company: string;
  contactName: string;
  email: string;
  openRequests: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const first = contactName.split(/\s+/)[0] || contactName;

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/customers/${customerId}/delete`, {
        method: "POST",
      });
      toast(`${company} is deleted`);
      router.replace(routes.teamCustomers);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="dangerOutline" onClick={() => setOpen(true)}>
        Delete customer
      </Button>
      {open ? (
        <Dialog open onOpenChange={(next) => (next ? null : setOpen(false))}>
          <DialogContent>
            <DialogTitle>Delete {company}?</DialogTitle>
            <DialogDescription>
              The customer is deleted for good. This can&apos;t be undone.
            </DialogDescription>
            <ul className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-[1.55] text-body">
              <li>
                {first} can&apos;t sign in to the client portal any more, and
                their personal details are erased.
              </li>
              <li>
                {company} leaves the Customers list, and {email} can be used
                again.
              </li>
              {openRequests ? (
                <li>
                  {plural(openRequests, "open request")}{" "}
                  {openRequests === 1 ? "is" : "are"} closed, with a note saying
                  why. {first} is not emailed.
                </li>
              ) : null}
              <li>
                Its projects and requests stay as history. Adding {email} again
                later offers to restore them.
              </li>
            </ul>
            {error ? (
              <div className="mt-4">
                <FormError>{error}</FormError>
              </div>
            ) : null}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={remove} disabled={busy}>
                {busy ? "Deleting…" : "Delete customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
