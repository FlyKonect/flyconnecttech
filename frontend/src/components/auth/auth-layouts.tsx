import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { routes } from "@/lib/routes";

/**
 * The two looks of the account screens:
 * - AuthSplit: form on the left, navy panel on the right (customer sign in,
 *   invitation, forgot and reset password; screens 01 to 05). On phones the
 *   navy panel is left out (m1).
 * - TeamAuthCard: a white card on navy (team sign in, screen 16, and the
 *   team's two-factor setup).
 */

export function AuthSplit({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-navy">
      <div className="flex min-w-0 flex-[1_1_520px] flex-col p-[clamp(20px,4vw,44px)]">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <Link href={routes.home} aria-label="FlyConnect Tech website">
            <Logo eager className="h-[18px] sm:h-[26px]" />
          </Link>
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-body sm:px-3.5"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to website
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>
      </div>

      <div
        aria-hidden="true"
        className="relative hidden flex-[1_1_560px] items-center justify-center overflow-hidden bg-[radial-gradient(90%_120%_at_88%_0%,#0C3584_0%,#021A54_52%,#01123D_100%)] p-12 app:flex"
      >
        <Image
          src="/images/route-map.svg"
          alt=""
          width={1440}
          height={528}
          unoptimized
          // The biggest thing in view: load it straight away.
          loading="eager"
          fetchPriority="high"
          className="absolute top-[12%] -left-[30%] w-[160%] max-w-none opacity-[0.22]"
        />
        {/* The design: 420px wide plus its 28px padding and 1px border. */}
        <div className="relative max-w-[478px] rounded-[24px] border border-stroke bg-white/94 p-7 shadow-[0_40px_80px_-40px_rgba(2,26,84,0.45)]">
          <p className="text-[13px] font-bold text-gold-text">
            YOUR SUPPORT, IN ONE PLACE
          </p>
          <p className="mt-2.5 font-heading text-2xl leading-[1.2] font-bold tracking-[-0.03em]">
            Every request, reply and status update for your projects.
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-portal-bg px-4 py-3.5">
            <span>
              <span className="block text-xs font-bold text-muted-foreground">
                TKT-2026-00118
              </span>
              <span className="mt-0.5 block text-sm font-bold">
                Multi-city flight search
              </span>
            </span>
            <span className="rounded-full bg-[#E3E9F5] px-2.5 py-1 text-xs font-bold text-navy-700">
              In Progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeamAuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy p-6 text-navy">
      {/* The design: 440px wide plus its padding on both sides. */}
      <div className="w-full max-w-[calc(440px+2*clamp(24px,4vw,40px))] rounded-[24px] bg-white p-[clamp(24px,4vw,40px)]">
        <p className="inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-white">
          <Shield aria-hidden="true" className="size-3.5" />
          FlyConnect Tech · Team panel
        </p>
        {children}
        <p className="mt-6 text-center">
          <Link
            href={routes.home}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-body"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}

/** Big page heading on the account screens. */
export function AuthHeading({
  children,
  size = "split",
}: {
  children: React.ReactNode;
  size?: "split" | "card";
}) {
  return (
    <h1
      className={
        size === "split"
          ? "font-heading text-[34px] leading-[1.1] font-bold tracking-[-0.03em]"
          : "mt-5 font-heading text-[30px] leading-[1.1] font-bold tracking-[-0.03em]"
      }
    >
      {children}
    </h1>
  );
}

/** The grey line under the heading. */
export function AuthLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2.5 text-base leading-[1.6] text-muted-foreground">
      {children}
    </p>
  );
}
