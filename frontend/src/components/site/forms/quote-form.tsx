"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar } from "lucide-react";
import { useForm } from "react-hook-form";

import { DemoButton } from "@/components/site/demo/demo-button";
import {
  FormAlert,
  Honeypot,
  SiteField,
  SuccessTick,
  SummaryRows,
} from "@/components/site/forms/site-field";
import { Select } from "@/components/ui/select";
import { apiErrorMessage } from "@/lib/api";
import {
  firstName,
  quoteDefaults,
  quoteSchema,
  type Quote,
  type QuoteInput,
} from "@/lib/forms/schemas";
import { submitLead } from "@/lib/forms/submit";
import {
  budgets,
  quoteProjectTypes,
  timelines,
  type Budget,
  type QuoteProjectType,
  type Timeline,
} from "@/lib/labels";

/**
 * Get a quote (docs/01, "Get a quote").
 * - "short": on Home. Project type, budget, name, email, requirements.
 * - "full": on Contact. Adds timeline, company and phone.
 */
export function QuoteForm({ variant }: { variant: "short" | "full" }) {
  const pathname = usePathname();
  const full = variant === "full";
  const [sent, setSent] = React.useState<Quote | null>(null);
  const [failed, setFailed] = React.useState("");
  const [honeypot, setHoneypot] = React.useState("");

  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: quoteDefaults,
  });
  const { errors, isSubmitting, submitCount } = form.formState;
  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  const onSubmit = form.handleSubmit(async (values) => {
    const quote = quoteSchema.parse(
      full
        ? values
        : {
            ...values,
            timeline: undefined,
            company: undefined,
            phone: undefined,
          },
    );
    setFailed("");
    try {
      await submitLead({ kind: "quote", data: quote }, pathname, honeypot);
      setSent(quote);
    } catch (error) {
      setFailed(apiErrorMessage(error));
    }
  });

  if (sent) {
    const rows: [string, string][] = [
      ["Project", quoteProjectTypes[sent.projectType].label],
      ["Budget", budgets[sent.budget].label],
    ];
    if (full && sent.timeline)
      rows.push(["Timeline", timelines[sent.timeline].label]);
    if (sent.company) rows.push(["Company", sent.company]);

    return (
      <div role="status" className="flex flex-col gap-3.5">
        <SuccessTick />
        <p className="m-0 font-heading text-2xl font-bold tracking-[-0.02em]">
          Thanks, {firstName(sent.name)}. Your request is in.
        </p>
        <p className="m-0 text-[15px] leading-[1.6] text-body">
          We will reply to <b className="text-navy">{sent.email}</b> within [X
          business days] with next steps, a rough scope and an estimate.
        </p>
        <SummaryRows rows={rows} />
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              form.reset(quoteDefaults);
              setSent(null);
            }}
            className="h-[46px] cursor-pointer rounded-[10px] border border-input bg-white px-[18px] text-[15px] font-semibold text-navy"
          >
            Send another request
          </button>
          <DemoButton className="inline-flex h-[46px] cursor-pointer items-center gap-2 rounded-[10px] bg-navy px-[18px] text-[15px] font-semibold text-white">
            <Calendar aria-hidden="true" className="size-[18px]" />
            Book a demo
          </DemoButton>
        </div>
      </div>
    );
  }

  return (
    <form
      aria-label="Get a quote"
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-3.5"
    >
      <Honeypot value={honeypot} onChange={setHoneypot} />
      {full ? null : (
        <p className="m-0 font-heading text-[22px] font-bold">Get a quote</p>
      )}

      <div className="flex flex-wrap gap-3.5">
        <SiteField
          label="Project type"
          kind="select"
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <Select {...props} {...form.register("projectType")}>
              {(Object.keys(quoteProjectTypes) as QuoteProjectType[]).map(
                (key) => (
                  <option key={key} value={key}>
                    {quoteProjectTypes[key].label}
                  </option>
                ),
              )}
            </Select>
          )}
        </SiteField>
        <SiteField
          label="Budget range"
          kind="select"
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <Select {...props} {...form.register("budget")}>
              {(Object.keys(budgets) as Budget[]).map((key) => (
                <option key={key} value={key}>
                  {budgets[key].label}
                </option>
              ))}
            </Select>
          )}
        </SiteField>
      </div>

      {full ? (
        <SiteField label="Timeline" kind="select">
          {(props) => (
            <Select {...props} {...form.register("timeline")}>
              {(Object.keys(timelines) as Timeline[]).map((key) => (
                <option key={key} value={key}>
                  {timelines[key].label}
                </option>
              ))}
            </Select>
          )}
        </SiteField>
      ) : null}

      <div className="flex flex-wrap gap-3.5">
        <SiteField
          label="Full name *"
          error={errors.name?.message}
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <input
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...props}
              {...form.register("name")}
            />
          )}
        </SiteField>
        <SiteField
          label="Work email *"
          error={errors.email?.message}
          className="flex-[1_1_180px]"
        >
          {(props) => (
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              {...props}
              {...form.register("email")}
            />
          )}
        </SiteField>
      </div>

      {full ? (
        <div className="flex flex-wrap gap-3.5">
          <SiteField label="Company (optional)" className="flex-[1_1_180px]">
            {(props) => (
              <input
                type="text"
                autoComplete="organization"
                placeholder="Company name"
                {...props}
                {...form.register("company")}
              />
            )}
          </SiteField>
          <SiteField label="Phone (optional)" className="flex-[1_1_180px]">
            {(props) => (
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+44 20 0000 0000"
                {...props}
                {...form.register("phone")}
              />
            )}
          </SiteField>
        </div>
      ) : null}

      <SiteField
        label="Requirements *"
        kind="textarea"
        error={errors.requirements?.message}
      >
        {(props) => (
          <textarea
            rows={full ? 5 : 4}
            placeholder="Tell us what you want to build"
            {...props}
            {...form.register("requirements")}
          />
        )}
      </SiteField>

      {hasErrors ? (
        <FormAlert>Please fix the highlighted fields.</FormAlert>
      ) : failed ? (
        <FormAlert>{failed}</FormAlert>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-1 h-[52px] cursor-pointer rounded-[10px] bg-gold text-base font-semibold text-navy disabled:opacity-60"
      >
        Request my quote
      </button>

      {full ? (
        <p className="m-0 text-[13px] leading-normal text-muted-foreground">
          We only use your details to reply to this request.
        </p>
      ) : null}
    </form>
  );
}
