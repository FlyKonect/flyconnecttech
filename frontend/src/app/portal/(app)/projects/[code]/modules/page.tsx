import { Suspense } from "react";
import type { Metadata } from "next";

import { ModuleReview } from "@/components/portal/module-review";
import {
  loadPortalProject,
  PortalProjectFrame,
} from "@/components/portal/portal-project-frame";
import { ModuleCard, ModulesIntro } from "@/components/shell/module-card";
import { PageLoading } from "@/components/shell/page-loading";
import { projectCard } from "@/components/shell/project-parts";

export const metadata: Metadata = { title: "Modules" };

/**
 * The customer's view of a project's modules: where each has reached,
 * its items and history, and Approve / Request changes while one waits
 * for their review.
 */
async function PortalModulesContent({
  params,
}: PageProps<"/portal/projects/[code]/modules">) {
  const { code } = await params;
  const { me, project } = await loadPortalProject(code);
  return (
    <PortalProjectFrame project={project} tab="modules" zone={me.timezone}>
      <ModulesIntro
        count={project.modules.length}
        text="Each part of your project goes through Design, Development, Testing and your review before it is done. When one is ready, approve it here or tell us what should change."
      />
      {project.modules.length ? (
        project.modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            number={index + 1}
            zone={me.timezone}
            audience="customer"
            review={
              module.stage === "CLIENT_REVIEW" ? (
                <ModuleReview
                  code={project.code}
                  moduleId={module.id}
                  moduleName={module.name}
                />
              ) : null
            }
          />
        ))
      ) : (
        <p className={`${projectCard} text-muted-foreground`}>
          Our team hasn&apos;t set up the modules yet.
        </p>
      )}
    </PortalProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalModulesPage(
  props: PageProps<"/portal/projects/[code]/modules">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalModulesContent {...props} />
    </Suspense>
  );
}
