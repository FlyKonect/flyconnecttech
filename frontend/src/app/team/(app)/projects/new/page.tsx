import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageLoading } from "@/components/shell/page-loading";
import { AddProjectForm } from "@/components/team/add-project-form";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { routes } from "@/lib/routes";
import type { ProjectChoices } from "@/lib/team/types";

export const metadata: Metadata = { title: "Add project" };

/** Add project: super admins and admins. ?customer=<id> chooses one. */
async function AddProjectContent({
  searchParams,
}: PageProps<"/team/projects/new">) {
  const me = await requireTeamMember();
  if (!me.actions.includes("customers.manage")) notFound();
  const { customer } = await searchParams;
  const choices = await serverApi<ProjectChoices>("/team/projects/choices", {
    signIn: routes.teamSignIn,
  });
  return (
    <AddProjectForm
      choices={choices}
      customerId={typeof customer === "string" ? customer : undefined}
    />
  );
}

/** It checks who is signed in inside Suspense, so moving here is instant. */
export default function AddProjectPage(props: PageProps<"/team/projects/new">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddProjectContent {...props} />
    </Suspense>
  );
}
