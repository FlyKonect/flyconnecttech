import * as React from "react";

import {
  pillGroups,
  type PillGroup,
  type PillValue,
  type Tone,
} from "@/lib/labels";
import { cn } from "@/lib/utils";

/** A small fully rounded label: 12px, bold (docs/03, "Pills"). */
function Pill({
  tone,
  className,
  style,
  ...props
}: React.ComponentProps<"span"> & { tone: Tone }) {
  return (
    <span
      data-slot="pill"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        className,
      )}
      style={{ background: tone.bg, color: tone.text, ...style }}
      {...props}
    />
  );
}

/**
 * A pill for a stored value, with its label and colours from src/lib/labels.ts.
 *
 *   <LabelPill group="requestStatus" value="IN_PROGRESS" />
 *   <LabelPill group="priority" value="URGENT" />
 */
function LabelPill<G extends PillGroup>({
  group,
  value,
  className,
}: {
  group: G;
  value: PillValue<G>;
  className?: string;
}) {
  const entries = pillGroups[group] as Record<
    string,
    { label: string; tone: Tone }
  >;
  const entry = entries[value as string];

  return (
    <Pill tone={entry.tone} className={className}>
      {entry.label}
    </Pill>
  );
}

export { LabelPill, Pill };
