import { Suspense } from "react";
import type { Metadata } from "next";

import { TeamShell, TeamShellView } from "@/components/team/team-shell";
import { previewDefaultRole, previewTeam } from "@/lib/preview-data";

export const metadata: Metadata = {
  title: { default: "Team panel", template: "%s · FlyConnect Tech" },
  // Private area: keep it out of search engines.
  robots: { index: false, follow: false },
};

/**
 * The signed-in part of the team panel: navy sidebar, header and the page.
 * The team sign-in screen lives outside this folder, so it does not get
 * the sidebar.
 *
 * TEMPORARY: `previewTeam` is sample data. Phase 4 replaces it with the
 * signed-in team member and Phase 6 with real numbers.
 */
export default function TeamLayout({ children }: LayoutProps<"/team">) {
  return (
    <Suspense
      fallback={
        <TeamShellView
          pathname=""
          status={null}
          user={{
            ...previewTeam[previewDefaultRole],
            role: previewDefaultRole,
          }}
        >
          {children}
        </TeamShellView>
      }
    >
      <TeamShell users={previewTeam} defaultRole={previewDefaultRole}>
        {children}
      </TeamShell>
    </Suspense>
  );
}
