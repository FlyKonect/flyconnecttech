import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * A request (or page) that does not exist, or that this person may not
 * open (a developer and someone else's request): the backend answers
 * "not found" for both.
 */
export default function TeamNotFound() {
  return (
    <section className="mx-auto w-full max-w-[640px] rounded-[28px] border border-line bg-white p-[clamp(24px,4vw,44px)] text-center">
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.03em]">
        This page could not be found.
      </h1>
      <p className="mt-2.5 text-base text-body">
        Check the address, or find the request in the list.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Button asChild size="lg">
          <Link href={routes.teamRequests}>Back to requests</Link>
        </Button>
      </div>
    </section>
  );
}
