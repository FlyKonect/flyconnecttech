"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-message";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DateInput,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { projectTypes } from "@/lib/labels";
import { routes } from "@/lib/routes";
import { addProjectSchema, type AddProjectInput } from "@/lib/team/forms";
import type { ProjectChoices } from "@/lib/team/types";

const card = "rounded-[22px] border border-line-2 bg-white p-6";

/**
 * Add project (the Projects menu, or "add with details" on a customer's
 * page): the customer, the project, what it includes, and optional dates
 * and lead. Saving opens the new project's page.
 */
export function AddProjectForm({
  choices,
  customerId,
}: {
  choices: ProjectChoices;
  /** From a customer's page: that customer, already chosen. */
  customerId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const chosen = choices.customers.find((c) => c.id === customerId);
  const form = useForm<AddProjectInput>({
    resolver: zodResolver(addProjectSchema),
    defaultValues: {
      customerId: chosen?.id ?? "",
      name: "",
      type: "WEBSITE",
      description: "",
      items: "",
      startDate: "",
      targetDate: "",
      leadId: "",
    },
  });
  const errors = form.formState.errors;
  const back = chosen
    ? { href: routes.teamCustomer(chosen.id), label: `← ${chosen.company}` }
    : { href: routes.teamProjects, label: "← Projects" };

  const save = form.handleSubmit(async (values) => {
    setError("");
    try {
      const created = await apiFetch<{ code: string }>("/team/projects", {
        method: "POST",
        body: values,
      });
      toast(`Project ${created.code} added`);
      router.push(routes.teamProject(created.code));
    } catch (failed) {
      setError(apiErrorMessage(failed));
    }
  });

  return (
    <>
      <div>
        <Link
          href={back.href}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          {back.label}
        </Link>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          The customer sees the project in their client portal straight away,
          with what it includes and its progress.
        </p>
      </div>

      <form
        noValidate
        onSubmit={save}
        className="flex max-w-[880px] min-w-0 flex-col gap-4"
      >
        <section aria-labelledby="project-card" className={card}>
          <h2 id="project-card" className="text-[17px] font-bold">
            Project
          </h2>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
            <Field label="Customer" required error={errors.customerId?.message}>
              <Select {...form.register("customerId")}>
                <option value="">Choose a customer</option>
                {choices.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Project name" required error={errors.name?.message}>
              <Input
                placeholder="For example: Mobile booking app"
                {...form.register("name")}
              />
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
            <Field label="Project lead (optional)">
              <Select {...form.register("leadId")}>
                <option value="">Nobody yet</option>
                {choices.leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.jobTitle
                      ? `${lead.name} · ${lead.jobTitle}`
                      : lead.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Start date (optional)"
              error={errors.startDate?.message}
            >
              <DateInput {...form.register("startDate")} />
            </Field>
            <Field
              label="Target date (optional)"
              error={errors.targetDate?.message}
            >
              <DateInput {...form.register("targetDate")} />
            </Field>
          </div>
        </section>

        <section aria-labelledby="scope-card" className={card}>
          <h2 id="scope-card" className="text-[17px] font-bold">
            What it includes
          </h2>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-3.5">
            <Field
              label="Description (optional)"
              hint="What the project is, in a few lines. The customer sees it."
              error={errors.description?.message}
            >
              <Textarea rows={5} {...form.register("description")} />
            </Field>
            <Field
              label="What's included (optional)"
              hint="One item a line, for example: Flight search. You tick them off on the project's page as the work is done."
              error={errors.items?.message}
            >
              <Textarea rows={5} {...form.register("items")} />
            </Field>
          </div>
        </section>

        {error ? <FormError>{error}</FormError> : null}
        <div className="flex flex-wrap justify-end gap-2.5">
          <Link
            href={back.href}
            className={buttonVariants({ variant: "outline" })}
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Adding…" : "Add project"}
          </Button>
        </div>
      </form>
    </>
  );
}
