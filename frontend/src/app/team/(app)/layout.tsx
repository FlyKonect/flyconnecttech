import { Suspense } from "react";
import type { Metadata } from "next";

import { ShellLoading } from "@/components/shell/shell-loading";
import { TeamShell } from "@/components/team/team-shell";
import { requireTeamMember } from "@/lib/auth/server";
import type { TeamRole } from "@/lib/labels";

export const metadata: Metadata = {
  title: { default: "Team panel", template: "%s · FlyConnect Tech" },
  // Private area: keep it out of search engines.
  robots: { index: false, follow: false },
};

/**
 * The signed-in part of the team panel: navy sidebar, header and the page.
 * Only team members who have set up two-factor get in; anyone else is sent
 * to sign in, to the two-factor setup, or to their own area.
 */
export default function TeamLayout({ children }: LayoutProps<"/team">) {
  return (
    <Suspense fallback={<ShellLoading tone="team" />}>
      <SignedInTeam>{children}</SignedInTeam>
    </Suspense>
  );
}

async function SignedInTeam({ children }: { children: React.ReactNode }) {
  const me = await requireTeamMember();
  return (
    <TeamShell
      user={{
        name: me.name,
        jobTitle: me.jobTitle,
        role: me.role as TeamRole,
        // Real numbers arrive with the requests and leads (Phases 6 and 8).
        counts: {},
      }}
    >
      {children}
    </TeamShell>
  );
}
