import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthSplit } from "@/components/auth/auth-layouts";
import { LinkNotValid } from "@/components/auth/link-not-valid";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
  // The secret link must not leak to other sites through the Referer header.
  referrer: "no-referrer",
};

/** Choose a new password from the emailed link (screen 05). */
export default function ResetPasswordPage({
  params,
}: PageProps<"/reset-password/[token]">) {
  return (
    <AuthSplit>
      <Suspense>
        <Reset params={params} />
      </Suspense>
    </AuthSplit>
  );
}

async function Reset({
  params,
}: Pick<PageProps<"/reset-password/[token]">, "params">) {
  const { token } = await params;
  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/accounts/password/reset/${encodeURIComponent(token)}`,
    { cache: "no-store" },
  );
  if (!response.ok) return <LinkNotValid kind="reset" />;

  const { email } = (await response.json()) as { email: string };
  return <ResetPasswordForm token={token} email={email} />;
}
