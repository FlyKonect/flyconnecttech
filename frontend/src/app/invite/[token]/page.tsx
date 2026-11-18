import { Suspense } from "react";
import type { Metadata } from "next";

import {
  AcceptInvitationForm,
  type InvitationDetails,
} from "@/components/auth/accept-invitation-form";
import { AuthSplit } from "@/components/auth/auth-layouts";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { LinkNotValid } from "@/components/auth/link-not-valid";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Set your password",
  robots: { index: false, follow: false },
  // The secret link must not leak to other sites through the Referer header.
  referrer: "no-referrer",
};

/** Accept an invitation: verify the email and set a password (screen 03). */
export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <AuthSplit>
      <Suspense>
        {/* Already signed in: straight to their own area. */}
        <RedirectIfSignedIn />
        <Invitation params={params} />
      </Suspense>
    </AuthSplit>
  );
}

async function Invitation({
  params,
}: Pick<PageProps<"/invite/[token]">, "params">) {
  const { token } = await params;
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/accounts/invitations/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!response.ok) return <LinkNotValid kind="invitation" />;

  const invitation = (await response.json()) as InvitationDetails;
  return <AcceptInvitationForm token={token} invitation={invitation} />;
}
