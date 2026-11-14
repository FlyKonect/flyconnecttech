import { Suspense } from "react";
import type { Metadata } from "next";

import { PortalShell, PortalShellView } from "@/components/portal/portal-shell";
import { previewCustomer } from "@/lib/preview-data";

export const metadata: Metadata = {
  title: { default: "Client portal", template: "%s · FlyConnect Tech" },
  // Private area: keep it out of search engines.
  robots: { index: false, follow: false },
};

/**
 * The signed-in part of the client portal: sidebar, header and the page.
 * Sign-in and invitation screens live outside this folder, so they do not
 * get the sidebar.
 *
 * TEMPORARY: `previewCustomer` is sample data. Phase 4 replaces it with the
 * signed-in customer and Phase 5 with real numbers.
 */
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <Suspense
      fallback={
        <PortalShellView pathname="" user={previewCustomer}>
          {children}
        </PortalShellView>
      }
    >
      <PortalShell user={previewCustomer}>{children}</PortalShell>
    </Suspense>
  );
}
