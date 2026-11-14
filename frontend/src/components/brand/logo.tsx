import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The FlyConnect Tech logo ("Crew Wings"). Use this component everywhere the
 * logo appears, so there is one place to change it.
 *
 * - "horizontal": wings + "FlyConnect Tech" on one line (headers, footers).
 * - "stacked": wings above the name (sign-in screens, emails, cards).
 * - "symbol": the wings alone (tight spaces, phone headers).
 *
 * `onNavy` switches to the version made for navy backgrounds.
 * Set the size with a height class, for example `className="h-8"`.
 */
const files = {
  horizontal: {
    light: "/brand/logo.svg",
    navy: "/brand/logo-on-navy.svg",
    width: 1475.66,
    height: 143.33,
  },
  stacked: {
    light: "/brand/logo-stacked.svg",
    navy: "/brand/logo-stacked-on-navy.svg",
    width: 1078.58,
    height: 405.42,
  },
  symbol: {
    light: "/brand/symbol.svg",
    navy: "/brand/symbol.svg",
    width: 94,
    height: 32.5,
  },
} as const;

type LogoProps = {
  variant?: keyof typeof files;
  onNavy?: boolean;
  /** Load straight away. Use for a logo at the top of the page. */
  eager?: boolean;
  className?: string;
};

export function Logo({
  variant = "horizontal",
  onNavy = false,
  eager = false,
  className,
}: LogoProps) {
  const file = files[variant];

  return (
    <Image
      src={onNavy ? file.navy : file.light}
      alt="FlyConnect Tech"
      width={file.width}
      height={file.height}
      loading={eager ? "eager" : "lazy"}
      // SVG files are already small and sharp at any size.
      unoptimized
      className={cn("h-8 w-auto max-w-full", className)}
    />
  );
}
