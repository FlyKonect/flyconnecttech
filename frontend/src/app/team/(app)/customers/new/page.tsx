import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageLoading } from "@/components/shell/page-loading";
import { AddCustomerForm } from "@/components/team/add-customer-form";
import { TeamPageTitle } from "@/components/team/team-shell";
import { ApiError } from "@/lib/api";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { routes } from "@/lib/routes";
import { leadHref } from "@/lib/team/leads";
import type { ConvertPrefill } from "@/lib/team/types";

export const metadata: Metadata = { title: "Add customer" };

/**
 * Add customer (screen 27): super admins and admins. With ?from=CODE it
 * converts a website lead (screen 42), prefilled from it.
 */
async function AddCustomerContent({
  searchParams,
}: PageProps<"/team/customers/new">) {
  const me = await requireTeamMember();
  if (!me.actions.includes("customers.manage")) notFound();
  const { from } = await searchParams;
  if (typeof from !== "string" || !from) return <AddCustomerForm />;

  const code = from.trim().slice(0, 20);
  let prefill: ConvertPrefill;
  try {
    prefill = await serverApi<ConvertPrefill>(
      `/team/leads/convert/${encodeURIComponent(code)}`,
      { signIn: routes.teamSignIn },
    );
  } catch (error) {
    // Already converted, or not won / completed yet: back to the lead.
    if (error instanceof ApiError && error.status === 409) {
      redirect(leadHref(code.startsWith("DEM-") ? "demo" : "quote", code));
    }
    throw error;
  }
  return (
    <>
      <TeamPageTitle title="Convert to customer" />
      <AddCustomerForm key={code} from={prefill} />
    </>
  );
}

/** It checks who is signed in inside Suspense, so moving here is instant. */
export default function AddCustomerPage(
  props: PageProps<"/team/customers/new">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddCustomerContent {...props} />
    </Suspense>
  );
}
