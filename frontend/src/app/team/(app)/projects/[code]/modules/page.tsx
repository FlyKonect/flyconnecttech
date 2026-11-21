import { Suspense } from "react";
import type { Metadata } from "next";

import { ModuleCard, ModulesIntro } from "@/components/shell/module-card";
import { PageLoading } from "@/components/shell/page-loading";
import { projectCard } from "@/components/shell/project-parts";
import {
  AddModuleButton,
  ModuleMenu,
  StageControl,
} from "@/components/team/module-actions";
import { AddItemsForm, ItemControls } from "@/components/team/project-actions";
import {
  loadTeamProject,
  TeamProjectFrame,
} from "@/components/team/team-project-frame";
import { stagesFor } from "@/lib/projects";

export const metadata: Metadata = { title: "Modules" };

/**
 * A project's Modules (team panel): each module's stage stepper, items
 * and history. Admins add, edit, move and remove modules and items;
 * developers on the team move stages and tick items; managers look.
 */
async function ModulesContent({
  params,
}: PageProps<"/team/projects/[code]/modules">) {
  const { code } = await params;
  const { me, project } = await loadTeamProject(code);
  const { manage, work } = project.can;
  const stages = work ? stagesFor(me.role) : [];

  return (
    <TeamProjectFrame me={me} project={project} tab="modules">
      <ModulesIntro
        count={project.modules.length}
        text="Each module moves Design → Development → Testing → Client review → Done. The customer approves it, or asks for changes, in their portal."
        action={manage ? <AddModuleButton code={project.code} /> : null}
      />
      {project.modules.length ? (
        project.modules.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            number={index + 1}
            zone={me.timezone}
            audience="team"
            actions={
              work || manage ? (
                <>
                  {work ? (
                    <StageControl
                      code={project.code}
                      module={module}
                      stages={stages}
                    />
                  ) : null}
                  {manage ? (
                    <ModuleMenu
                      code={project.code}
                      module={module}
                      first={index === 0}
                      last={index === project.modules.length - 1}
                    />
                  ) : null}
                </>
              ) : null
            }
            itemControls={
              work
                ? (item, itemIndex) => (
                    <ItemControls
                      code={project.code}
                      item={item}
                      first={itemIndex === 0}
                      last={itemIndex === module.items.length - 1}
                      manage={manage}
                    />
                  )
                : undefined
            }
            addItems={
              manage ? (
                <AddItemsForm
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
          No modules yet.
          {manage
            ? " Add the parts of the project, for example Flight booking, Agent portal and Payments."
            : ""}
        </p>
      )}
    </TeamProjectFrame>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ModulesPage(
  props: PageProps<"/team/projects/[code]/modules">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <ModulesContent {...props} />
    </Suspense>
  );
}
