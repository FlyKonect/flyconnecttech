import { Suspense } from "react";
import type { Metadata } from "next";

import {
  loadPortalProject,
  PortalProjectFrame,
} from "@/components/portal/portal-project-frame";
import { PageLoading } from "@/components/shell/page-loading";
import { projectCard, UpdatesList } from "@/components/shell/project-parts";
import { env } from "@/env";

export const metadata: Metadata = { title: "Updates" };

/** The team's updates on one of the customer's projects. */
async function PortalUpdatesContent({
  params,
}: PageProps<"/portal/projects/[code]/updates">) {
  const { code } = await params;
  const { me, project } = await loadPortalProject(code);
  return (
    <PortalProjectFrame project={project} tab="updates">
      <section aria-labelledby="updates-heading" className={projectCard}>
        <h2 id="updates-heading" className="text-[17px] font-bold">
          Updates · {project.updates.length}
        </h2>
        <UpdatesList
          updates={project.updates}
          zone={me.timezone}
          fileHref={(id) =>
            `${env.NEXT_PUBLIC_API_URL}/portal/projects/${encodeURIComponent(project.code)}/files/${id}`
          }
          empty="No updates yet. We post one here, and email you, when there is progress to share."
        />
      </section>
    </PortalProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalUpdatesPage(
  props: PageProps<"/portal/projects/[code]/updates">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalUpdatesContent {...props} />
    </Suspense>
  );
}
