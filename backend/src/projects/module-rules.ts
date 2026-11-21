import { z } from 'zod';
import type { ModuleStage, Role } from '../generated/prisma/client.js';
import { ModuleStage as Stages } from '../generated/prisma/enums.js';
import { optionalDate, optionalText, tooLong } from './project-rules.js';

/**
 * Modules: their stages, who may move them where, rework rounds and
 * lateness. The website shows the same words and order
 * (frontend/src/lib/projects.ts).
 */

export const MODULE_STAGES = Object.values(Stages) as [
  ModuleStage,
  ...ModuleStage[],
];

/** The usual path, as the stepper shows it. */
export const MAIN_PATH: ModuleStage[] = [
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'CLIENT_REVIEW',
  'DONE',
];

export const STAGE_LABELS: Record<ModuleStage, string> = {
  NOT_STARTED: 'Not started',
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  TESTING: 'Testing',
  CLIENT_REVIEW: 'Client review',
  CHANGES_REQUESTED: 'Changes requested',
  RETEST: 'Retest',
  DONE: 'Done',
};

/**
 * Developers on the project team do the work: they move a module through
 * design, development, testing and retest, and send it for client review.
 * Done comes from the customer's approval or an admin; so does Not started.
 */
const DEVELOPER_STAGES: ModuleStage[] = [
  'DESIGN',
  'DEVELOPMENT',
  'TESTING',
  'RETEST',
  'CLIENT_REVIEW',
];

export function stagesFor(role: Role): ModuleStage[] {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return [...MODULE_STAGES];
  if (role === 'DEVELOPER') return [...DEVELOPER_STAGES];
  return [];
}

/**
 * What changes on the module when it moves: a new round each time the
 * customer asks for changes, and Done's date (set on Done, cleared after).
 */
export function stageMove(
  module: { stage: ModuleStage; round: number; doneAt: Date | null },
  to: ModuleStage,
  now = new Date(),
): { stage: ModuleStage; round: number; doneAt: Date | null } {
  const round =
    to === 'CHANGES_REQUESTED' && module.stage !== 'CHANGES_REQUESTED'
      ? module.round + 1
      : module.round;
  return {
    stage: to,
    round,
    doneAt: to === 'DONE' ? (module.doneAt ?? now) : null,
  };
}

/** Late: the target day has passed and the module isn't Done. */
export function isLate(
  module: { stage: ModuleStage; targetDate: Date | null },
  now = new Date(),
): boolean {
  if (!module.targetDate || module.stage === 'DONE') return false;
  const today = now.toISOString().slice(0, 10);
  return module.targetDate.toISOString().slice(0, 10) < today;
}

export const moduleSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter the module name')
      .max(160, tooLong(160)),
    description: optionalText(1000),
    startDate: optionalDate,
    targetDate: optionalDate,
  })
  .refine(
    (input) =>
      !input.startDate ||
      !input.targetDate ||
      input.targetDate >= input.startDate,
    { path: ['targetDate'], message: 'The target date is before the start' },
  );
export type ModuleInput = z.output<typeof moduleSchema>;

export const stageSchema = z.object({
  stage: z.enum(MODULE_STAGES, 'Choose a stage'),
  note: optionalText(500),
});

/** The customer's answer while a module is in client review. */
export const reviewSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('approve'), note: optionalText(500) }),
  z.object({
    decision: z.literal('changes'),
    note: z
      .string()
      .trim()
      .min(1, 'Say what should change')
      .max(500, tooLong(500)),
  }),
]);
export type ReviewInput = z.output<typeof reviewSchema>;
