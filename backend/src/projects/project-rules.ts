import { z } from 'zod';
import {
  ProjectItemStatus,
  ProjectStatus,
  ProjectType,
} from '../generated/prisma/enums.js';
import { isWebAddress } from '../website/website-rules.js';

/**
 * Projects: the input rules, "What's included" from lines of text, and
 * progress. The team screens show the same wording
 * (frontend/src/lib/team/projects.ts).
 */

export const MAX_ITEMS = 50;
export const ITEM_TITLE_MAX = 160;
export const DESCRIPTION_MAX = 2000;
export const UPDATE_MAX = 4000;
export const NOTES_MAX = 4000;

export const PROJECT_TYPES = Object.values(ProjectType) as [
  ProjectType,
  ...ProjectType[],
];
export const PROJECT_STATUSES = Object.values(ProjectStatus) as [
  ProjectStatus,
  ...ProjectStatus[],
];
export const ITEM_STATUSES = Object.values(ProjectItemStatus) as [
  ProjectItemStatus,
  ...ProjectItemStatus[],
];

const tooLong = (max: number) => `Keep this under ${max} characters`;

/** Empty means "not given": saved as null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, tooLong(max))
    .optional()
    .nullable()
    .transform((value) => value || null);

/** A UK calendar date "2026-11-21", or empty. Saved at midnight UTC. */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (value) => !value || isCalendarDay(value),
    'Enter a date like 21/11/2026',
  )
  .transform((value) => (value ? new Date(`${value}T00:00:00.000Z`) : null));

const optionalAddress = z
  .string()
  .trim()
  .max(500, tooLong(500))
  .optional()
  .nullable()
  .refine(
    (value) => !value || isWebAddress(value),
    'Enter a full web address starting with https://',
  )
  .transform((value) => value || null);

export function isCalendarDay(text: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === text
  );
}

/** A saved date as "2026-11-21" (dates have no time of day). */
export function calendarDay(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null;
}

/**
 * "What's included" typed one per line: blanks dropped, spaces tidied.
 * Lines that are too long or too many are refused by the schema below.
 */
export function itemsFromLines(text: string | null | undefined): string[] {
  return (text ?? '')
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*[-*•]\s*/, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

export const itemLinesSchema = z
  .string()
  .max(MAX_ITEMS * (ITEM_TITLE_MAX + 2), 'This list is too long')
  .optional()
  .nullable()
  .transform((text) => itemsFromLines(text))
  .refine((items) => items.length <= MAX_ITEMS, `Up to ${MAX_ITEMS} items`)
  .refine(
    (items) => items.every((item) => item.length <= ITEM_TITLE_MAX),
    `Keep each line under ${ITEM_TITLE_MAX} characters`,
  );

const name = z
  .string()
  .trim()
  .min(1, 'Enter a project name')
  .max(160, tooLong(160));
const type = z.enum(PROJECT_TYPES, 'Choose a project type');

/** Everything Edit details can change. */
export const projectDetailsSchema = z
  .object({
    name,
    type,
    description: optionalText(DESCRIPTION_MAX),
    startDate: optionalDate,
    targetDate: optionalDate,
    liveDate: optionalDate,
    supportUntil: optionalDate,
    liveUrl: optionalAddress,
    testUrl: optionalAddress,
    builtWith: optionalText(300),
    leadId: z.uuid().optional().nullable().or(z.literal('')),
    teamNotes: optionalText(NOTES_MAX),
  })
  .transform(({ leadId, ...rest }) => ({ ...rest, leadId: leadId || null }))
  .refine(
    (input) =>
      !input.startDate ||
      !input.targetDate ||
      input.targetDate >= input.startDate,
    { path: ['targetDate'], message: 'The target date is before the start' },
  );
export type ProjectDetailsInput = z.output<typeof projectDetailsSchema>;

/** Add project (Projects menu, or "add with details" from a customer). */
export const newProjectSchema = z.object({
  customerId: z.uuid('Choose a customer'),
  name,
  type,
  description: optionalText(DESCRIPTION_MAX),
  items: itemLinesSchema,
  startDate: optionalDate,
  targetDate: optionalDate,
  leadId: z
    .uuid()
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((value) => value || null),
});
export type NewProjectInput = z.output<typeof newProjectSchema>;

/** Add customer: each project row's description and "What's included". */
export const customerProjectSchema = z.object({
  name,
  type,
  description: optionalText(DESCRIPTION_MAX),
  items: itemLinesSchema,
});

export const addItemsSchema = z.object({
  lines: itemLinesSchema.refine((items) => items.length > 0, 'Add one item'),
});

export const itemSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Enter the item')
      .max(ITEM_TITLE_MAX, tooLong(ITEM_TITLE_MAX))
      .optional(),
    detail: optionalText(500),
    status: z.enum(ITEM_STATUSES, 'Choose a status').optional(),
  })
  .refine(
    (input) => input.title !== undefined || input.status !== undefined,
    'Nothing to change',
  );

export const moveSchema = z.object({ direction: z.enum(['up', 'down']) });

export const statusSchema = z.object({
  status: z.enum(PROJECT_STATUSES, 'Choose a status'),
});

export const updateTextSchema = z.object({
  body: z.string().trim().max(UPDATE_MAX, tooLong(UPDATE_MAX)),
});

export type Progress = { done: number; total: number; percent: number | null };

/** The share of items that are Done. No items: no percentage. */
export function progressOf(items: { status: ProjectItemStatus }[]): Progress {
  const total = items.length;
  const done = items.filter((item) => item.status === 'DONE').length;
  return {
    done,
    total,
    percent: total ? Math.round((done / total) * 100) : null,
  };
}

/** "6 of 10 done (60%)", or "Nothing listed yet". */
export function progressWords(progress: Progress): string {
  return progress.percent === null
    ? 'Nothing listed yet'
    : `${progress.done} of ${progress.total} done (${progress.percent}%)`;
}
