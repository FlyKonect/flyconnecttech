import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * A number tile on a dashboard: a small label, a big number, an optional hint.
 *
 * Tones: default (white), navy (the filled tile), and five that only colour
 * the label: info, warning (also tints the tile), attention (orange, the
 * team's "Unassigned"), danger and success.
 */
const tileVariants = cva("min-w-0 rounded-[20px] border p-5", {
  variants: {
    tone: {
      default: "border-line-2 bg-white",
      navy: "border-navy bg-navy text-white",
      info: "border-line-2 bg-white",
      warning: "border-[#FED7AA] bg-[#FFF7ED]",
      attention: "border-line-2 bg-white",
      danger: "border-line-2 bg-white",
      success: "border-line-2 bg-white",
    },
  },
  defaultVariants: { tone: "default" },
});

const labelColour = {
  default: "text-muted-foreground",
  navy: "text-on-navy",
  info: "text-navy-700",
  warning: "text-[#C2410C]",
  attention: "text-[#C2410C]",
  danger: "text-danger",
  success: "text-[#15803D]",
} as const;

const valueColour = {
  default: "text-navy",
  navy: "text-white",
  info: "text-navy",
  warning: "text-[#9A3412]",
  attention: "text-navy",
  danger: "text-navy",
  success: "text-navy",
} as const;

type KpiTileProps = Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof tileVariants> & {
    label: string;
    value: React.ReactNode;
    hint?: string;
    /** Colours the hint: green for better, red for worse (Reports). */
    hintTone?: "good" | "bad";
  };

function KpiTile({
  label,
  value,
  hint,
  hintTone,
  tone = "default",
  className,
  ...props
}: KpiTileProps) {
  const key = tone ?? "default";

  return (
    <div
      data-slot="kpi-tile"
      className={cn(tileVariants({ tone }), className)}
      {...props}
    >
      <p className={cn("text-[13px] font-bold", labelColour[key])}>{label}</p>
      <p
        className={cn(
          "mt-2.5 font-heading text-[34px] leading-none font-bold tracking-[-0.03em]",
          valueColour[key],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-2 text-[13px]",
            hintTone === "good"
              ? "font-semibold text-[#15803D]"
              : hintTone === "bad"
                ? "font-semibold text-danger"
                : key === "navy"
                  ? "text-on-navy"
                  : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { KpiTile };
