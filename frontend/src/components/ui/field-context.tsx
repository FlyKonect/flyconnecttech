"use client";

import * as React from "react";

/**
 * What a `<Field>` hands the one control inside it (field.tsx): the id its
 * label points at, the error and hint to read out, and the label's words
 * (the dropdowns and the calendar name their pop-ups with them).
 */
export type FieldContextValue = {
  id: string;
  label: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

export const FieldContext = React.createContext<FieldContextValue | null>(null);

/** What a control takes from the Field around it. Works without a Field too. */
export function useFieldProps(props: {
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

/** The label of the Field around a control, if there is one. */
export function useFieldLabel(): string | undefined {
  return React.use(FieldContext)?.label;
}

/** The look every text box, dropdown and date box shares. */
export const controlClass =
  "border-input text-navy placeholder:text-muted-foreground aria-invalid:border-danger disabled:bg-chip w-full rounded-[10px] border bg-white text-[15px] font-medium placeholder:font-normal disabled:cursor-not-allowed disabled:opacity-70";

/** Hover and open states for the controls that open a pop-up. */
export const openableClass =
  "transition-[border-color,box-shadow] duration-150 hover:border-[#B4C1D6] data-[state=open]:border-navy/45 data-[state=open]:shadow-[0_0_0_4px_rgba(211,175,52,0.18)] aria-invalid:hover:border-danger";
