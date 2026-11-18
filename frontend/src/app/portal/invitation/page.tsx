import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthHeading, AuthSplit } from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Open my invitation",
  description:
    "How to activate your FlyConnect Tech client portal account from the invitation email.",
};

/**
 * "Open my invitation" help (docs/01, "Support"). Not in the design, so it is
 * built from the design system. The wording is the spec's; the client may
 * want to change it.
 */
export default function InvitationHelpPage() {
  return (
    <AuthSplit>
      {/* Already signed in: straight to their own area. */}
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-[rgba(211,175,52,0.13)] text-gold-text">
        <Mail aria-hidden="true" className="size-6" />
      </span>
      <div className="mt-5">
        <AuthHeading>Open your invitation</AuthHeading>
      </div>
      <p className="mt-3 text-base leading-[1.6] text-body">
        Open the invitation email we sent you and click{" "}
        <b className="text-navy">Verify email and set password</b>. Can&apos;t
        find it? Check your spam folder, or send us a message and we&apos;ll
        send a new one.
      </p>
      <div className="mt-7 flex flex-col gap-3">
        <Button asChild size="lg" className="h-[52px] text-base">
          <Link href={routes.contact}>Send us a message</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-[52px] text-base"
        >
          <Link href={routes.portalSignIn}>Sign in</Link>
        </Button>
      </div>
    </AuthSplit>
  );
}
