import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import { AddUserForm } from "@/components/team/add-user-form";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { RolesInfo } from "@/lib/team/types";

export const metadata: Metadata = { title: "Add user" };

/**
 * Add user (screen 30): super admins and admins. Which roles may be given,
 * and the permissions shown for the chosen role, come from the backend.
 */
async function AddUserContent() {
  const info = await serverApi<RolesInfo>("/team/users/roles", {
    signIn: routes.teamSignIn,
  });
  return (
    <>
      <div>
        <Link
          href={routes.teamUsers}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          ← Users
        </Link>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          Add a team member with their role. They set their own password from
          the invitation email.
        </p>
      </div>
      <AddUserForm canInvite={info.canInvite} permissions={info.permissions} />
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function AddUserPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddUserContent />
    </Suspense>
  );
}
