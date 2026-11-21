import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { projectCard, UpdatesList } from "@/components/shell/project-parts";
import { UpdateComposer, UpdateMenu } from "@/components/team/project-actions";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";
import { env } from "@/env";

export const metadata: Metadata = { title: "Updates" };

/** A project's Updates (team panel): what has been done, emailed out. */
async function UpdatesContent({
  params,
}: PageProps<"/team/projects/[code]/updates">) {
  const { code } = await params;
  const { me, project } = await loadTeamProject(code);
  const manage = project.can.manage;
  return (
    <TeamProjectFrame me={me} project={project} tab="updates">
      {manage ? (
        <section aria-labelledby="post-heading" className={projectCard}>
          <h2 id="post-heading" className="text-[17px] font-bold">
            Post an update
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Say what has been done and what comes next. The customer sees it in
            their portal and gets it by email.
          </p>
          <UpdateComposer code={project.code} />
        </section>
      ) : null}
      <section aria-labelledby="updates-heading" className={projectCard}>
        <h2 id="updates-heading" className="mb-5 text-[17px] font-bold">
          All updates · {project.updates.length}
        </h2>
        <UpdatesList
          updates={project.updates}
          zone={me.timezone}
          fileHref={(id) =>
            `${env.NEXT_PUBLIC_API_URL}/team/projects/${encodeURIComponent(project.code)}/files/${id}`
          }
          menu={
            manage
              ? (update) => <UpdateMenu code={project.code} update={update} />
              : undefined
          }
          empty="No updates yet. Post one when there is progress to share."
        />
      </section>
    </TeamProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function UpdatesPage(
  props: PageProps<"/team/projects/[code]/updates">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <UpdatesContent {...props} />
    </Suspense>
  );
}
