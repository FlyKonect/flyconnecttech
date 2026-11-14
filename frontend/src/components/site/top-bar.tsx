import Link from "next/link";
import { LifeBuoy, LogIn } from "lucide-react";

import { routes } from "@/lib/routes";

/** The gold bar above the website header. */
export function TopBar() {
  return (
    <div id="top" className="bg-gold text-sm font-medium text-navy">
      <div className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-[clamp(20px,4vw,40px)] py-2.5 text-center">
        <span>
          Travel agencies: add Amadeus flight search and booking to your
          website.
        </span>
        <Link
          href={routes.travel}
          className="font-bold underline underline-offset-[3px]"
        >
          Learn more
        </Link>

        {/* Desktop only. On phones these two links are in the menu. */}
        <span className="absolute top-1/2 right-[clamp(20px,4vw,40px)] flex -translate-y-1/2 items-center gap-5 max-nav:hidden">
          <Link
            href={routes.support}
            className="inline-flex min-h-7 items-center gap-1.5 font-semibold"
          >
            <LifeBuoy aria-hidden="true" className="size-[15px]" />
            Support
          </Link>
          <Link
            href={routes.portalSignIn}
            className="inline-flex min-h-7 items-center gap-1.5 font-semibold"
          >
            <LogIn aria-hidden="true" className="size-[15px]" />
            Client login
          </Link>
        </span>
      </div>
    </div>
  );
}
