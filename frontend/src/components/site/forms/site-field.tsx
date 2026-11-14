"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Form fields in the website's style (the website forms look slightly
 * different from the portal's, see design/screens/website/16-…).
 *
 *   <SiteField label="Work email *" error={errors.email?.message}>
 *     {(props) => <input type="email" {...props} {...register("email")} />}
 *   </SiteField>
 *
 * The render function receives the id and the accessibility attributes that
 * connect the label and the error message to the control.
 */

export type ControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
  className: string;
};

const base =
  "w-full rounded-[10px] border bg-white px-3.5 text-[15px] font-normal text-navy placeholder:text-[#6B7891] outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgba(211,175,52,0.6)]";

/** Classes for an input, select or textarea, red when `invalid`. */
export function controlClass(
  kind: "input" | "select" | "textarea",
  invalid: boolean,
  size: "default" | "compact" = "default",
) {
  return cn(
    base,
    invalid
      ? "border-[#D92D20] shadow-[0_0_0_3px_rgba(217,45,32,0.12)]"
      : "border-input",
    kind === "textarea"
      ? "resize-y py-3 leading-[1.55]"
      : size === "compact"
        ? "h-[46px]"
        : "h-12",
    kind === "select" && "appearance-none pr-10",
  );
}

export function SiteField({
  label,
  error,
  className,
  kind = "input",
  size = "default",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  kind?: "input" | "select" | "textarea";
  size?: "default" | "compact";
  children: (props: ControlProps) => React.ReactNode;
}) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const control = children({
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: controlClass(kind, Boolean(error), size),
  });

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-2">
        {label}
      </label>
      {kind === "select" ? (
        <span className="relative block">
          {control}
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-navy"
          />
        </span>
      ) : (
        control
      )}
      {error ? (
        <span id={errorId} className="text-xs font-medium text-[#B42318]">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** The red line above the submit button when the form has errors. */
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="m-0 text-sm font-medium text-[#B42318]">
      {children}
    </p>
  );
}

/** A summary table: label on the left, value on the right. */
export function SummaryRows({
  rows,
  labelWidth = 92,
}: {
  rows: [label: string, value: string][];
  labelWidth?: number;
}) {
  return (
    <dl className="m-0 overflow-hidden rounded-[14px] border border-line">
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={cn(
            "flex gap-3 px-4 py-3 text-sm",
            index > 0 && "border-t border-line-2",
          )}
        >
          <dt
            className="flex-none text-muted-foreground"
            style={{ width: labelWidth }}
          >
            {label}
          </dt>
          <dd className="m-0 min-w-0 font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The round tick shown on every "sent" screen. */
export function SuccessTick({ size = 56 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full bg-[rgba(211,175,52,0.13)] text-gold-text"
      style={{ width: size, height: size }}
    >
      <svg
        width={size / 2.15}
        height={size / 2.15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
