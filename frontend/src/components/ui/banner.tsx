import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** A coloured notice above or inside a page (docs/03, "Banners"). */
const bannerVariants = cva(
  "rounded-2xl border px-[18px] py-3.5 text-sm leading-normal font-semibold",
  {
    variants: {
      variant: {
        info: "border-[#DCE3EE] bg-[#EEF2FA] text-navy",
        ok: "border-[#BBF7D0] bg-[#ECFDF5] text-[#166534]",
        muted: "border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]",
        warning: "border-[#FED7AA] bg-[#FFF7ED] text-[#9A3412]",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

function Banner({
  className,
  variant,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof bannerVariants>) {
  return (
    <p
      data-slot="banner"
      className={cn(bannerVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Banner };
