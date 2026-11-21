import { z } from 'zod';
import type { TopicKind } from '../generated/prisma/client.js';
import { optionalText, tooLong } from './project-rules.js';

/**
 * Project discussions: customer topics (the customer and the team) and
 * team topics (internal, never shown to the customer). The input rules
 * and the words of the system lines. The website shows the same limits
 * (frontend/src/lib/discussions.ts).
 */

export const TITLE_MAX = 200;
export const POST_MAX = 10_000;
export const MAX_ASKED = 10;

/** Fields from a multipart form arrive as text: "true", or a list. */
const flag = z
  .union([z.boolean(), z.literal('true'), z.literal('false')])
  .optional()
  .transform((value) => value === true || value === 'true');

const people = z
  .union([z.uuid(), z.array(z.uuid())])
  .optional()
  .transform((value) => (value === undefined ? [] : [value].flat()))
  .refine((ids) => ids.length <= MAX_ASKED, `Ask up to ${MAX_ASKED} people`)
  .transform((ids) => [...new Set(ids)]);

const body = z.string().trim().max(POST_MAX, tooLong(POST_MAX)).default('');

export const newTopicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the topic a title')
    .max(TITLE_MAX, tooLong(TITLE_MAX)),
  body,
  moduleId: z
    .union([z.uuid(), z.literal('')])
    .optional()
    .transform((value) => value || null),
  /** Team topics only: the people asked. */
  ask: people,
});
export type NewTopicInput = z.output<typeof newTopicSchema>;

export const postSchema = z.object({
  body,
  /** The team, on customer topics: post it as a proposal to approve. */
  proposal: flag,
  ask: people,
});
export type PostInput = z.output<typeof postSchema>;

export const editPostSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Write something')
    .max(POST_MAX, tooLong(POST_MAX)),
});

export const answerSchema = z.object({
  postId: z.uuid().nullable(),
});

export const closeSchema = z.object({ note: optionalText(500) });

export const decisionSchema = z.discriminatedUnion('decision', [
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
export type DecisionInput = z.output<typeof decisionSchema>;

/** Where a topic opens, for links in notices and emails. */
export function topicHref(
  area: 'portal' | 'team',
  code: string,
  kind: TopicKind,
  number: number,
): string {
  if (area === 'portal')
    return `/portal/projects/${code}/discussions/${number}`;
  const board = kind === 'INTERNAL' ? 'team-discussions' : 'discussions';
  return `/team/projects/${code}/${board}/${number}`;
}

/** "Priya Nair", "Priya Nair and Omar Khan", "Priya, Omar and Sara". */
export function namesList(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** The system lines in a topic's thread. */
export const systemLine = {
  closed: (who: string, note: string | null) =>
    note ? `${who} closed this topic: ${note}` : `${who} closed this topic`,
  reopened: (who: string) => `${who} reopened this topic`,
  answered: (who: string, author: string) =>
    `${who} marked ${author}'s reply as the answer`,
  unanswered: (who: string) => `${who} cleared the answer`,
  approved: (who: string, note: string | null) =>
    note
      ? `${who} approved the proposal: ${note}`
      : `${who} approved the proposal`,
  changes: (who: string, note: string) =>
    `${who} asked for changes to the proposal: ${note}`,
  asked: (who: string, names: string[]) => `${who} asked ${namesList(names)}`,
};
