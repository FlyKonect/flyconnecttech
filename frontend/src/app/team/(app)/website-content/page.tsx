import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { WebsiteContent } from "@/components/team/website-content";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { WebsiteContentView } from "@/lib/team/types";

export const metadata: Metadata = { title: "Website content" };

/** Website content: super admins and admins; others get "not found". */
async function WebsiteContentPage() {
  const view = await serverApi<WebsiteContentView>("/team/website", {
    signIn: routes.teamSignIn,
  });
  return <WebsiteContent view={view} />;
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <WebsiteContentPage />
    </Suspense>
  );
}
