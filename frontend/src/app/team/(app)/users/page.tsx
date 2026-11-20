import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { ROLE_ICONS } from "@/components/team/role-permissions";
import { UsersTable } from "@/components/team/users-table";
import { StatCard } from "@/components/ui/stat-card";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { roleDescriptions, roles, type TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import type { TeamUserList } from "@/lib/team/types";

export const metadata: Metadata = { title: "Users" };

const ROLE_ORDER: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];

/** Icon colours, close to each role's pill. */
const ROLE_TONES = {
  SUPER_ADMIN: "gold",
  ADMIN: "navy",
  MANAGER: "purple",
  DEVELOPER: "green",
} as const;

/** Users (screen 29): super admins and admins. Others get "not found". */
async function UsersContent() {
  const me = await requireTeamMember();
  const list = await serverApi<TeamUserList>("/team/users", {
    signIn: routes.teamSignIn,
  });
  return (
    <>
      <ul
        aria-label="Team members by role"
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5"
      >
        {ROLE_ORDER.map((role) => (
          <li key={role}>
            <StatCard
              icon={ROLE_ICONS[role]}
              tone={ROLE_TONES[role]}
              value={
                <>
                  {list.byRole[role].active}
                  {list.byRole[role].invited ? (
                    <span className="ml-1.5 text-[13px] font-semibold tracking-normal text-muted-foreground">
                      + {list.byRole[role].invited} invited
                    </span>
                  ) : null}
                </>
              }
              label={roles[role].label}
              note={roleDescriptions[role]}
            />
          </li>
        ))}
      </ul>

      <UsersTable
        rows={list.rows}
        timeZone={me.timezone}
        canAdd={me.actions.includes("users.invite")}
      />

      <p className="text-[13px] text-muted-foreground">
        New team members get an email to verify their address and set a
        password, then sign in at Team sign in.
      </p>
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function UsersPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <UsersContent />
    </Suspense>
  );
}
