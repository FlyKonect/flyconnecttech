import { Suspense } from "react";
import type { Metadata } from "next";

import { PortalShell } from "@/components/portal/portal-shell";
import { ShellLoading } from "@/components/shell/shell-loading";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import type { PortalSummary } from "@/lib/portal/types";

export const metadata: Metadata = {
  title: { default: "Client portal", template: "%s · FlyConnect Tech" },
  // Private area: keep it out of search engines.
  robots: { index: false, follow: false },
};

/**
 * The signed-in part of the client portal: sidebar, header and the page.
 * Only signed-in customers get in; anyone else is sent to sign in or to
 * their own area. Sign-in and invitation screens live outside this folder,
 * so they do not get the sidebar.
 */
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <Suspense fallback={<ShellLoading />}>
      <SignedInPortal>{children}</SignedInPortal>
    </Suspense>
  );
}

async function SignedInPortal({ children }: { children: React.ReactNode }) {
  const me = await requireCustomer();
  const summary = await serverApi<PortalSummary>("/portal/summary");
  return (
    <PortalShell
      user={{
        name: me.name,
        company: me.customer?.company ?? "",
        requestCount: summary.requests.total,
        unreadNotifications: summary.unreadNotifications,
      }}
    >
      {children}
    </PortalShell>
  );
}
