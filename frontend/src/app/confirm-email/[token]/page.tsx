import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  AuthHeading,
  AuthLead,
  AuthSplit,
} from "@/components/auth/auth-layouts";
import { ConfirmEmailForm } from "@/components/auth/confirm-email-form";
import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Confirm your new email",
  robots: { index: false, follow: false },
  // The secret link must not leak to other sites through the Referer header.
  referrer: "no-referrer",
};

/**
 * The link in "Confirm your new email": an admin changed this person's
 * email. Opening the page changes nothing (email scanners open links);
 * the button confirms.
 */
export default function ConfirmEmailPage({
  params,
}: PageProps<"/confirm-email/[token]">) {
  return (
    <AuthSplit>
      <Suspense>
        <Confirm params={params} />
      </Suspense>
    </AuthSplit>
  );
}

async function Confirm({
  params,
}: Pick<PageProps<"/confirm-email/[token]">, "params">) {
  const { token } = await params;
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/accounts/email-change/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    return (
      <>
        <AuthHeading>This link no longer works</AuthHeading>
        <AuthLead>
          Email confirmation links work once and expire after 48 hours. If your
          new email is already confirmed, sign in with it. Otherwise ask the
          FlyConnect Tech team to send a new link.
        </AuthLead>
        <div className="mt-7 flex flex-col gap-3">
          <Button asChild size="lg" className="h-[52px] text-base">
            <Link href={routes.portalSignIn}>Go to sign in</Link>
          </Button>
        </div>
      </>
    );
  }
  const { email } = (await response.json()) as { email: string };
  return <ConfirmEmailForm token={token} email={email} />;
}
