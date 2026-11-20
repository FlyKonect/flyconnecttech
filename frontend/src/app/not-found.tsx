import type { Metadata } from "next";
import Link from "next/link";

import { DemoProvider } from "@/components/site/demo/demo-context";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

/**
 * An address that matches no page. Shown with the website's header and
 * footer, so visitors can carry on from here.
 */
export default function NotFound() {
  return (
    <DemoProvider>
      <SiteHeader />
      <main
        id="main"
        className="flex flex-1 items-center bg-tint px-4 py-[clamp(48px,8vw,96px)]"
      >
        <section className="mx-auto w-full max-w-[640px] rounded-[28px] border border-line bg-white p-[clamp(24px,4vw,44px)] text-center">
          <p className="font-heading text-sm font-bold tracking-[0.08em] text-gold-text uppercase">
            Error 404
          </p>
          <h1 className="mt-2 font-heading text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.03em]">
            This page could not be found.
          </h1>
          <p className="mt-2.5 text-base text-body">
            The address may be mistyped, or the page has moved.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Button asChild size="lg">
              <Link href={routes.home}>Go to home page</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.contact}>Contact us</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </DemoProvider>
  );
}
