"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Form fields with a label above and the error message below.
 *
 *   <Field label="Work email" required error={errors.email}>
 *     <Input type="email" name="email" />
 *   </Field>
 *
 * Field connects the label, the error and the hint to the control inside it,
 * so screen readers read them together. Put exactly one control in a Field.
 */

type FieldContextValue = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = React.createContext<FieldContextValue | null>(null);

type FieldProps = {
  label: string;
  /** Shown in red under the control. An empty value means no error. */
  error?: string;
  /** Extra help under the control. Hidden while an error is shown. */
  hint?: string;
  /** Adds " *" to the label and marks the control as required. */
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

function Field({
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const context = React.useMemo(
    () => ({ id, describedBy, invalid: Boolean(error), required }),
    [id, describedBy, error, required],
  );

  return (
    <div data-slot="field" className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-bold">
        {label}
        {required ? " *" : null}
      </label>
      <FieldContext value={context}>{children}</FieldContext>
      {error ? (
        <p id={errorId} className="text-xs font-semibold text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** What a control takes from the Field around it. Works without a Field too. */
function useFieldProps(props: {
  id?: string;
  required?: boolean;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
}) {
  const field = React.use(FieldContext);

  return {
    id: props.id ?? field?.id,
    required: props.required ?? field?.required,
    "aria-invalid": props["aria-invalid"] ?? (field?.invalid || undefined),
    "aria-describedby": props["aria-describedby"] ?? field?.describedBy,
  };
}

const control =
  "border-input text-navy placeholder:text-muted-foreground aria-invalid:border-danger disabled:bg-chip w-full rounded-[10px] border bg-white text-[15px] font-medium placeholder:font-normal disabled:cursor-not-allowed disabled:opacity-70";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(control, "h-[50px] px-3.5", className)}
      {...props}
      {...useFieldProps(props)}
    />
  );
}

function Textarea({
  className,
  rows = 5,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(control, "resize-y px-3.5 py-3 leading-[1.55]", className)}
      {...props}
      {...useFieldProps(props)}
    />
  );
}

/** The browser's own dropdown, styled. It works well on phones and with keyboards. */
function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <span data-slot="select" className="relative block">
      <select
        className={cn(
          control,
          "h-[50px] appearance-none pr-10 pl-3.5",
          className,
        )}
        {...props}
        {...useFieldProps(props)}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  );
}

/** A tick box with its text beside it. */
function Checkbox({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <label
      data-slot="checkbox"
      className={cn(
        "flex min-h-6 cursor-pointer items-center gap-2 text-sm text-body",
        className,
      )}
    >
      <input
        type="checkbox"
        className="size-[18px] shrink-0 cursor-pointer accent-navy"
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}

export { Checkbox, Field, Input, Select, Textarea };
