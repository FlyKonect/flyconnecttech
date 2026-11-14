"use client";

import * as React from "react";
import { RadioGroup } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * "Pick one" controls. Both work like radio buttons: one choice at a time,
 * arrow keys move between the options.
 *
 * Chips: small buttons in a row (priority, status).
 *
 *   <ChipGroup aria-label="Priority" value={priority} onValueChange={setPriority}>
 *     <Chip value="LOW">Low</Chip>
 *     <Chip value="HIGH">High</Chip>
 *   </ChipGroup>
 *
 * Radio cards: bigger cards with a title and a line of text (request types,
 * roles, lost reasons).
 *
 *   <RadioCards aria-label="Request type" value={type} onValueChange={setType}>
 *     <RadioCard value="BUG_REPORT" title="Bug Report" description="An error you can reproduce" />
 *   </RadioCards>
 */

function ChipGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup.Root>) {
  return (
    <RadioGroup.Root
      data-slot="chip-group"
      className={cn("flex flex-wrap gap-2", className)}
      {...props}
    />
  );
}

function Chip({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup.Item>) {
  return (
    <RadioGroup.Item
      data-slot="chip"
      className={cn(
        "min-h-10 cursor-pointer rounded-[10px] border border-stroke bg-white px-3.5 text-[13px] font-bold text-body transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-navy data-[state=checked]:bg-navy data-[state=checked]:text-white",
        className,
      )}
      {...props}
    />
  );
}

function RadioCards({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroup.Root>) {
  return (
    <RadioGroup.Root
      data-slot="radio-cards"
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3",
        className,
      )}
      {...props}
    />
  );
}

function RadioCard({
  title,
  description,
  showDot = false,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof RadioGroup.Item>, "title"> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Shows a round radio mark at the left (roles, lost reasons). */
  showDot?: boolean;
}) {
  return (
    <RadioGroup.Item
      data-slot="radio-card"
      className={cn(
        "group flex min-h-[92px] cursor-pointer items-start gap-3 rounded-2xl border-2 border-line-2 bg-white p-[18px] text-left text-navy transition-colors hover:border-[#C8D3E3] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-navy data-[state=checked]:bg-tint",
        className,
      )}
      {...props}
    >
      {showDot ? (
        <span
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 rounded-full border-2 border-[#B8C3D6] bg-white shadow-[inset_0_0_0_3px_#fff] group-data-[state=checked]:border-navy group-data-[state=checked]:bg-navy"
        />
      ) : null}
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-base font-bold">{title}</span>
        {description ? (
          <span className="text-[13px] leading-snug font-normal text-muted-foreground">
            {description}
          </span>
        ) : null}
        {children}
      </span>
    </RadioGroup.Item>
  );
}

export { Chip, ChipGroup, RadioCard, RadioCards };
