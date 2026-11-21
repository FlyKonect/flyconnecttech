import type { TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";

/**
 * Project discussions, shared by the team panel and the client portal:
 * what the backend's discussion routes answer, the limits (kept in step
 * with the backend's projects/topic-rules.ts) and the addresses.
 */

export const TITLE_MAX = 200;
export const POST_MAX = 10_000;

/** Customer topics (with the customer) or team topics (internal). */
export type Board = "customer" | "team";

export type TopicRow = {
  number: number;
  title: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  lastPostAt: string;
  module: { id: string; name: string } | null;
  startedBy: string;
  startedByCustomer: boolean;
  replies: number;
  answered: boolean;
  proposalWaiting: boolean;
  /** Team topics: the people asked who haven't replied yet. */
  waitingFor: string[];
};

export type AskChoice = {
  id: string;
  name: string;
  jobTitle: string | null;
  role: TeamRole;
};

export type TopicList = {
  counts: { open: number; closed: number };
  can: { start: boolean };
  modules: { id: string; name: string }[];
  askChoices: AskChoice[];
  total: number;
  page: number;
  pageSize: number;
  rows: TopicRow[];
};

export type TopicFile = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
};

export type TopicPost = {
  id: string;
  kind: "MESSAGE" | "PROPOSAL" | "SYSTEM";
  body: string;
  createdAt: string;
  editedAt: string | null;
  author: {
    id: string;
    name: string;
    /** The customer's side; otherwise FlyConnect Tech. */
    customer: boolean;
    jobTitle: string | null;
  } | null;
  proposal: {
    state: "PENDING" | "APPROVED" | "CHANGES_REQUESTED";
    decidedBy: string | null;
    decidedAt: string | null;
    note: string | null;
  } | null;
  files: TopicFile[];
  mine: boolean;
};

export type TopicDetail = {
  number: number;
  kind: "CUSTOMER" | "INTERNAL";
  title: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  module: { id: string; name: string } | null;
  startedBy: string;
  closed: { at: string; by: string | null; note: string | null } | null;
  answerPostId: string | null;
  asked: { id: string; name: string; answered: boolean }[];
  posts: TopicPost[];
  can: {
    reply: boolean;
    propose: boolean;
    ask: boolean;
    decide: boolean;
    answer: boolean;
    close: boolean;
    reopen: boolean;
    removePosts: boolean;
    delete: boolean;
  };
  askChoices: AskChoice[];
};

/** Where a board lives: its page in the website and its backend route. */
export function boardPaths(
  area: "portal" | "team",
  board: Board,
  code: string,
) {
  const segment = board === "team" ? "team-discussions" : "discussions";
  const page =
    area === "portal"
      ? routes.portalProjectTab(code, segment)
      : routes.teamProjectTab(code, segment);
  const api = `/${area}/projects/${encodeURIComponent(code)}/${segment}`;
  return {
    page,
    topic: (number: number) => `${page}/${number}`,
    api,
    file: (number: number, fileId: string) =>
      `${api}/${number}/files/${fileId}`,
  };
}

/** "Waiting for: Priya Nair and Omar Khan". */
export function waitingWords(names: string[]): string {
  if (!names.length) return "";
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Waiting for: ${list}`;
}
