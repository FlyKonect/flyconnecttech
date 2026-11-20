import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A summary number at the top of a list page: an icon, the number, its
 * label, and an optional short note under it.
 *
 *   <StatCard icon={Building2} value={6} label="Customers" note="1 invited" />
 */
export function StatCard({
  icon: Icon,
  value,
  label,
  note,
  tone = "navy",
  className,
}: {
  icon: LucideIcon;
  value: React.ReactNode;
  label: React.ReactNode;
  note?: React.ReactNode;
  /** The icon's colours. */
  tone?: "navy" | "gold" | "green" | "purple" | "orange";
  className?: string;
}) {
  return (
    <div
      data-slot="stat-card"
      className={cn(
        "flex items-start gap-3.5 rounded-[20px] border border-line-2 bg-white p-[18px] shadow-[0_1px_2px_rgba(2,26,84,0.04)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
          TONES[tone],
        )}
      >
        <Icon className="size-[21px]" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="font-heading text-[26px] leading-none font-bold tracking-[-0.03em] text-navy">
          {value}
        </p>
        <p className="mt-1.5 text-[13px] font-bold text-navy">{label}</p>
        {note ? (
          <p className="mt-0.5 text-xs leading-normal text-muted-foreground">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const TONES = {
  navy: "bg-tint text-navy-700",
  gold: "bg-gold/15 text-gold-text",
  green: "bg-[#ECFDF5] text-[#15803D]",
  purple: "bg-[#F3E8FF] text-[#7E22CE]",
  orange: "bg-[#FFF7ED] text-[#C2410C]",
};
