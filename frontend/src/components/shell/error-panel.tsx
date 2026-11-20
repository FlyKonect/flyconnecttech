"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * What every error page shows: a short message, "Try again" and a way back.
 * The error's details never reach the screen; the reference (Next's digest)
 * matches the line in the server log.
 */
export function ErrorPanel({
  error,
  retry,
  backHref,
  backLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  backHref: string;
  backLabel: string;
}) {
  return (
    <section
      role="alert"
      className="mx-auto w-full max-w-[640px] rounded-[28px] border border-line bg-white p-[clamp(24px,4vw,44px)] text-center"
    >
      <h1 className="font-heading text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.03em]">
        Something went wrong.
      </h1>
      <p className="mt-2.5 text-base text-body">
        This page could not be loaded just now. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Button size="lg" onClick={() => retry()}>
          Try again
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="mt-5 text-xs text-muted">Reference: {error.digest}</p>
      ) : null}
    </section>
  );
}
