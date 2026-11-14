import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** "Sarah Mitchell" -> "SM". One-word names give one letter. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const avatarVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-bold select-none",
  {
    variants: {
      tone: {
        navy: "bg-navy text-white",
        gold: "bg-gold text-navy",
        tint: "bg-tint text-navy-700",
      },
      size: {
        sm: "size-9 text-xs",
        default: "size-[38px] text-[13px]",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { tone: "navy", size: "default" },
  },
);

/**
 * A round avatar showing a person's initials.
 * It is decoration: the person's name is always written next to it.
 */
function Avatar({
  name,
  tone,
  size,
  className,
}: { name: string; className?: string } & VariantProps<typeof avatarVariants>) {
  return (
    <span
      data-slot="avatar"
      aria-hidden="true"
      className={cn(avatarVariants({ tone, size }), className)}
    >
      {initials(name)}
    </span>
  );
}

export { Avatar };
