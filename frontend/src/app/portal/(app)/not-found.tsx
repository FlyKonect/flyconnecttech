import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * A request (or page) that does not exist, or belongs to someone else: the
 * backend answers "not found" for both, so nobody learns which codes exist.
 */
export default function PortalNotFound() {
  return (
    <section className="mx-auto w-full max-w-[640px] rounded-[28px] border border-line-2 bg-white p-[clamp(24px,4vw,44px)] text-center">
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.03em]">
        This page could not be found.
      </h1>
      <p className="mt-2.5 text-base text-body">
        Check the address, or find the request in your list.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href={routes.portalRequests}>Back to My requests</Link>
        </Button>
      </div>
    </section>
  );
}
