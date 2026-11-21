import type { Prisma } from '../generated/prisma/client.js';

/** The module "What's included" goes into when no module is chosen. */
export const GENERAL_MODULE = 'General';

/**
 * Makes a module at the end of a project, with its items and the first
 * line of its timeline ("Not started"). Inside the caller's transaction.
 */
export async function createModule(
  tx: Prisma.TransactionClient,
  input: {
    projectId: string;
    name: string;
    description?: string | null;
    startDate?: Date | null;
    targetDate?: Date | null;
    items?: string[];
    byId: string | null;
  },
): Promise<{ id: string }> {
  const last = await tx.projectModule.findFirst({
    where: { projectId: input.projectId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const module = await tx.projectModule.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      description: input.description ?? null,
      startDate: input.startDate ?? null,
      targetDate: input.targetDate ?? null,
      position: (last?.position ?? -1) + 1,
      stages: {
        create: { from: null, to: 'NOT_STARTED', round: 1, byId: input.byId },
      },
    },
    select: { id: true },
  });
  if (input.items?.length) {
    await tx.projectItem.createMany({
      data: input.items.map((title, position) => ({
        projectId: input.projectId,
        moduleId: module.id,
        title,
        position,
      })),
    });
  }
  return module;
}
