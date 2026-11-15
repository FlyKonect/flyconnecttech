"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { FormError } from "@/components/auth/form-message";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { ApiError, apiErrorMessage, apiFetch } from "@/lib/api";
import { projectTypes, type ProjectType } from "@/lib/labels";
import { routes } from "@/lib/routes";
import {
  firstName,
  MAX_NEW_PROJECTS,
  newCustomerSchema,
  type NewCustomerInput,
} from "@/lib/team/forms";

import { plural } from "@/lib/plural";

const card = "rounded-[22px] border border-line-2 bg-white p-6";
const newProject = { name: "", type: "WEBSITE" as ProjectType };

/**
 * Add customer (screen 27): the contact, one or more projects, and the
 * "What happens next" panel. Saving creates everything and sends the
 * invitation, then opens the new customer's page.
 */
export function AddCustomerForm() {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = React.useState("");
  const form = useForm<NewCustomerInput>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      projects: [newProject],
    },
  });
  const projects = useFieldArray({ control: form.control, name: "projects" });
  const errors = form.formState.errors;
  const name = useWatch({ control: form.control, name: "name" });
  const count = projects.fields.length;
  const first = firstName(name, "the customer");

  const save = form.handleSubmit(async (values) => {
    setError("");
    try {
      const created = await apiFetch<{ id: string; emailSent: boolean }>(
        "/team/customers",
        {
          method: "POST",
          body: { ...values, phone: values.phone || undefined },
        },
      );
      toast(
        created.emailSent
          ? `Customer added. Invitation sent to ${values.email}`
          : "Customer added, but the invitation email could not be sent. Use Resend invitation.",
      );
      router.push(routes.teamCustomer(created.id));
    } catch (failed) {
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
  });

  return (
    <>
      <div>
        <Link
          href={routes.teamCustomers}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← Customers
        </Link>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          Only the details needed to set up the account. The customer adds the
          rest when they activate it.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <form
          noValidate
          onSubmit={save}
          className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-4"
        >
          <section aria-labelledby="customer-card" className={card}>
            <h2 id="customer-card" className="text-[17px] font-bold">
              Customer
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
              <Field label="Company" required error={errors.company?.message}>
                <Input
                  autoComplete="organization"
                  {...form.register("company")}
                />
              </Field>
              <Field label="Phone (optional)" error={errors.phone?.message}>
                <Input
                  type="tel"
                  autoComplete="tel"
                  {...form.register("phone")}
                />
              </Field>
            </div>
          </section>

          <section aria-labelledby="projects-card" className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="projects-card" className="text-[17px] font-bold">
                Projects
              </h2>
              <span className="text-[13px] text-muted-foreground">
                Each project belongs to this customer only
              </span>
            </div>
            {projects.fields.map((field, index) => (
              <div
                key={field.id}
                className="mt-3 flex flex-wrap items-start gap-3 rounded-2xl bg-[#F6F8FC] p-3.5"
              >
                <Field
                  label={`Project ${index + 1} name`}
                  required
                  error={errors.projects?.[index]?.name?.message}
                  className="flex-[1.4_1_200px]"
                >
                  <Input {...form.register(`projects.${index}.name`)} />
                </Field>
                <Field label="Project type" className="flex-[1_1_240px]">
                  <Select {...form.register(`projects.${index}.type`)}>
                    {Object.entries(projectTypes).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                {count > 1 ? (
                  <LineUp>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => projects.remove(index)}
                      aria-label={`Remove project ${index + 1}`}
                      className="h-[50px]"
                    >
                      Remove
                    </Button>
                  </LineUp>
                ) : null}
              </div>
            ))}
            {count < MAX_NEW_PROJECTS ? (
              <button
                type="button"
                onClick={() => projects.append(newProject)}
                className="mt-3 min-h-12 w-full cursor-pointer rounded-[10px] border-2 border-dashed border-[#CBD5E4] text-sm font-bold text-navy-700 hover:bg-soft"
              >
                + Add another project
              </button>
            ) : null}
          </section>

          {form.formState.isSubmitted && Object.keys(errors).length ? (
            <p role="alert" className="text-sm font-semibold text-danger">
              Please fill in the highlighted fields.
            </p>
          ) : null}
          {error ? <FormError>{error}</FormError> : null}

          <div className="flex flex-wrap justify-end gap-2.5">
            <Link
              href={routes.teamCustomers}
              className={buttonVariants({ variant: "outline" })}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Creating…"
                : "Create customer and send invitation"}
            </Button>
          </div>
        </form>

        <aside
          aria-labelledby="next-steps"
          className="min-w-0 flex-[1_1_300px] rounded-[22px] bg-navy p-6 text-white"
        >
          <h2 id="next-steps" className="text-[17px] font-bold">
            What happens next
          </h2>
          <ol className="mt-4 flex flex-col gap-3.5 text-sm leading-normal text-[#DCE3F0]">
            {[
              `We email ${first} an invitation link.`,
              "They verify their email and set a password.",
              `They sign in and send requests for ${plural(count, "project")}.`,
            ].map((step, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={`inline-flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? "bg-gold text-navy" : "bg-white/12 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[13px] text-[#9FB0D6]">
            The invitation link expires after 48 hours. You can resend it from
            the customer page.
          </p>
        </aside>
      </div>
    </>
  );
}

/**
 * Puts a button level with the inputs beside it (below their labels),
 * even while one of them shows an error underneath.
 */
export function LineUp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span aria-hidden="true" className="invisible text-[13px] font-bold">
        &nbsp;
      </span>
      {children}
    </div>
  );
}
