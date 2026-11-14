import Link from "next/link";

import { AuthHeading, AuthLead } from "@/components/auth/auth-layouts";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** Shown for an invitation or reset link that has expired or was already used. */
export function LinkNotValid({ kind }: { kind: "invitation" | "reset" }) {
  return (
    <>
      <AuthHeading>This link no longer works</AuthHeading>
      <AuthLead>
        {kind === "invitation"
          ? "Invitation links work once and expire after 48 hours. If you have already set your password, sign in. Otherwise ask us for a new invitation."
          : "Password reset links work once and expire after 48 hours. Ask for a new one below."}
      </AuthLead>
      <div className="mt-7 flex flex-col gap-3">
        <Button asChild size="lg" className="h-[52px] text-base">
          <Link href={routes.portalSignIn}>Go to sign in</Link>
        </Button>
        {kind === "invitation" ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-[52px] text-base"
          >
            <Link href={routes.contact}>Ask for a new invitation</Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-[52px] text-base"
          >
            <Link href={routes.portalForgotPassword}>Get a new link</Link>
          </Button>
        )}
      </div>
    </>
  );
}
