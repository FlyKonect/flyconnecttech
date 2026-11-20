import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { NewRequestForm } from "@/components/portal/new-request-form";
import { serverApi } from "@/lib/api-server";
import type { PortalProject } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Create Support Request" };

/** Create support request: one page (replaces the four steps of screens 07 to 10). */
async function NewRequestPageContent() {
  const projects = await serverApi<PortalProject[]>("/portal/projects");
  return <NewRequestForm projects={projects} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function NewRequestPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewRequestPageContent />
    </Suspense>
  );
}
