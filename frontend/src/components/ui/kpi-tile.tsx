import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Inbox,
  Layers,
  Loader,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A number tile on a dashboard: a small label, a big number, an optional hint.
 *
 * Tones: default (white), navy (the filled tile), and five that only colour
 * the label: info, warning (also tints the tile), attention (orange, the
 * team's "Unassigned"), danger and success.
 */
const tileVariants = cva(
  "min-w-0 rounded-[20px] border p-5 shadow-[0_1px_2px_rgba(2,26,84,0.04)]",
  {
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
  },
);

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
    /** The icon at the top right. Each tone has its own by default. */
    icon?: LucideIcon;
  };

type ToneKey = keyof typeof valueColour;

/** The icon each tone shows unless one is given. */
const TONE_ICONS: Record<ToneKey, LucideIcon> = {
  default: Inbox,
  navy: Layers,
  info: Loader,
  warning: Hourglass,
  attention: UserX,
  danger: AlertTriangle,
  success: CheckCircle2,
};

const iconChip: Record<ToneKey, string> = {
  default: "bg-tint text-navy-700",
  navy: "bg-white/12 text-gold",
  info: "bg-tint text-navy-700",
  warning: "bg-white text-[#C2410C]",
  attention: "bg-[#FFF7ED] text-[#C2410C]",
  danger: "bg-[#FEF2F2] text-danger",
  success: "bg-[#ECFDF5] text-[#15803D]",
};

function KpiTile({
  label,
  value,
  hint,
  hintTone,
  icon,
  tone = "default",
  className,
  ...props
}: KpiTileProps) {
  const key = tone ?? "default";
  const Icon = icon ?? TONE_ICONS[key];

  return (
    <div
      data-slot="kpi-tile"
      className={cn(tileVariants({ tone }), className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[13px] font-bold", labelColour[key])}>{label}</p>
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
            iconChip[key],
          )}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
      <p
        className={cn(
          "mt-1 font-heading text-[34px] leading-none font-bold tracking-[-0.03em]",
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
