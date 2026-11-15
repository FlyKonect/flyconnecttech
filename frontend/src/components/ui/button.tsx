import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Buttons (docs/03-design-system.md, "Buttons").
 *
 * Variants: navy (primary on white), gold (main call to action), outline,
 * ghostOnNavy (on navy panels), success, danger, dangerOutline.
 * Sizes: the portal sizes (sm, default, lg), the website sizes (site, siteSm)
 * and icon (a 44px square).
 *
 * To make a link look like a button: <Button asChild><Link href="…">…</Link></Button>
 */
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] font-bold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        navy: "bg-navy text-white hover:bg-navy-700",
        gold: "bg-gold text-navy hover:bg-[#c7a42c]",
        outline: "border border-input bg-white text-navy hover:bg-soft",
        ghostOnNavy:
          "border border-white/32 bg-white/6 text-white hover:bg-white/14",
        // A darker green than the design's #16A34A: white text needs it for AA.
        success: "bg-[#15803D] text-white hover:bg-[#166534]",
        danger: "bg-danger text-white hover:bg-[#991b1b]",
        dangerOutline:
          "border border-[#fecaca] bg-white text-danger hover:bg-[#fef2f2]",
      },
      size: {
        sm: "h-10 px-3.5 text-[13px]",
        default: "h-[46px] px-5 text-sm",
        lg: "h-12 px-[22px] text-[15px]",
        siteSm: "h-11 px-5 text-[15px] font-semibold",
        site: "h-[52px] px-6 text-base font-semibold",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "navy",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "navy",
  size = "default",
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      // A plain button must not submit a form by accident.
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/**
 * Text link with an arrow, in gold ("View all →").
 * The onNavy option uses the lighter gold made for navy backgrounds.
 */
function TextLink({
  className,
  onNavy = false,
  children,
  ...props
}: React.ComponentProps<typeof Link> & { onNavy?: boolean }) {
  return (
    <Link
      data-slot="text-link"
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold hover:underline",
        onNavy ? "text-gold-on-navy" : "text-gold-text",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

export { Button, TextLink, buttonVariants };
export type { ButtonProps };
