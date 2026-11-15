import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageLoading } from "@/components/shell/page-loading";
import { AddCustomerForm } from "@/components/team/add-customer-form";
import { requireTeamMember } from "@/lib/auth/server";

export const metadata: Metadata = { title: "Add customer" };

/** Add customer (screen 27): super admins and admins. */
async function AddCustomerContent() {
  const me = await requireTeamMember();
  if (!me.actions.includes("customers.manage")) notFound();
  return <AddCustomerForm />;
}

/** It checks who is signed in inside Suspense, so moving here is instant. */
export default function AddCustomerPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AddCustomerContent />
    </Suspense>
  );
}
