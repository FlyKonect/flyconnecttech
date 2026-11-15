import { Suspense } from "react";
import type { Metadata } from "next";

import { ShellLoading } from "@/components/shell/shell-loading";
import { TeamShell } from "@/components/team/team-shell";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import type { TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import type { TeamSummary } from "@/lib/team/types";

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
  const summary = await serverApi<TeamSummary>("/team/summary", {
    signIn: routes.teamSignIn,
  });
  const { requests } = summary;
  return (
    <TeamShell
      user={{
        name: me.name,
        jobTitle: me.jobTitle,
        role: me.role as TeamRole,
        // The website leads' badges arrive with Phase 8.
        counts: {
          all: requests.all,
          new: requests.new,
          underReview: requests.underReview,
          inProgress: requests.inProgress,
          waiting: requests.waiting,
          resolved: requests.resolved,
          closed: requests.closed,
          notifications: summary.unreadNotifications,
        },
      }}
    >
      {children}
    </TeamShell>
  );
}
