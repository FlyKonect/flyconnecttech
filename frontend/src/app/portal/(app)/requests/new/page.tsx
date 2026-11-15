import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/portal/page-loading";
import { NewRequestWizard } from "@/components/portal/new-request-wizard";
import { serverApi } from "@/lib/api-server";
import type { PortalProject } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Create Support Request" };

/** Create support request (screens 07 to 10, phone M3). */
async function NewRequestPageContent() {
  const projects = await serverApi<PortalProject[]>("/portal/projects");
  return <NewRequestWizard projects={projects} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function NewRequestPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewRequestPageContent />
    </Suspense>
  );
}
