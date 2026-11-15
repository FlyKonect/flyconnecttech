import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import { UsersTable } from "@/components/team/users-table";
import { buttonVariants } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { roleDescriptions, roles, type TeamRole } from "@/lib/labels";
import { plural } from "@/lib/plural";
import { routes } from "@/lib/routes";
import type { TeamUserList } from "@/lib/team/types";

export const metadata: Metadata = { title: "Users" };

const ROLE_ORDER: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];

/** Users (screen 29): super admins and admins. Others get "not found". */
async function UsersContent() {
  const me = await requireTeamMember();
  const list = await serverApi<TeamUserList>("/team/users", {
    signIn: routes.teamSignIn,
  });
  const { active, invited } = list.summary;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground">
          {plural(active, "team member")}
          {invited ? ` · ${plural(invited, "invitation")} pending` : null}
        </p>
        {me.actions.includes("users.invite") ? (
          <Link href={routes.teamNewUser} className={buttonVariants()}>
            + Add user
          </Link>
        ) : null}
      </div>

      <ul
        aria-label="Team members by role"
        className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5"
      >
        {ROLE_ORDER.map((role) => (
          <li
            key={role}
            className="rounded-[20px] border border-line-2 bg-white p-[18px]"
          >
            <Pill tone={roles[role].tone}>{roles[role].label}</Pill>
            <p className="mt-2.5 font-heading text-[28px] font-bold tracking-[-0.03em]">
              {list.byRole[role].active}
              {list.byRole[role].invited ? (
                <span className="text-[13px] font-semibold tracking-normal text-muted-foreground">
                  {" "}
                  · {list.byRole[role].invited} invited
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {roleDescriptions[role]}
            </p>
          </li>
        ))}
      </ul>

      <UsersTable rows={list.rows} timeZone={me.timezone} />

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
