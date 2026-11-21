import type {
  ProjectItemStatus,
  ProjectStatus,
  ProjectType,
} from "@/lib/labels";

/**
 * Projects, shared by the team panel and the client portal: what a project
 * page shows, "What's included" from lines of text, and progress in words.
 * Kept in step with the backend's projects/project-rules.ts.
 */

export const MAX_ITEMS = 50;
export const ITEM_TITLE_MAX = 160;
export const DESCRIPTION_MAX = 2000;
export const UPDATE_MAX = 4000;
export const NOTES_MAX = 4000;

/** The share of items that are Done. No items: no percentage. */
export type Progress = { done: number; total: number; percent: number | null };

export type ProjectItem = {
  id: string;
  title: string;
  detail: string | null;
  status: ProjectItemStatus;
  doneAt: string | null;
};

export type ProjectUpdateFile = {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
};

export type ProjectUpdate = {
  id: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  authorName: string;
  files: ProjectUpdateFile[];
};

/** What both sides see on a project's page. Dates are "2026-11-21". */
export type ProjectPage = {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string | null;
  startDate: string | null;
  targetDate: string | null;
  liveDate: string | null;
  supportUntil: string | null;
  liveUrl: string | null;
  testUrl: string | null;
  builtWith: string | null;
  createdAt: string;
  updatedAt: string;
  progress: Progress;
  items: ProjectItem[];
  updates: ProjectUpdate[];
  requests: { open: number; total: number };
};

/**
 * "What's included" typed one per line: blanks dropped, bullets and extra
 * spaces tidied (the backend does the same).
 */
export function itemsFromLines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^\s*[-*•]\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

/** A problem with the lines, or "" when they can be saved. */
export function itemLinesProblem(text: string): string {
  const items = itemsFromLines(text);
  if (items.length > MAX_ITEMS) return `Up to ${MAX_ITEMS} items`;
  if (items.some((item) => item.length > ITEM_TITLE_MAX)) {
    return `Keep each line under ${ITEM_TITLE_MAX} characters`;
  }
  return "";
}

/** "6 of 10 done", or "Nothing listed yet". */
export function progressWords(progress: Progress): string {
  return progress.percent === null
    ? "Nothing listed yet"
    : `${progress.done} of ${progress.total} done`;
}

/** A calendar day "2027-01-15" as "15 Jan 2027" (it has no time of day). */
export function formatDay(day: string | null): string {
  if (!day) return "";
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "https://bluewave.example.com/x" as "bluewave.example.com/x". */
export function shortAddress(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** A full web address: https:// (or http://) and a domain with a dot. */
export function isWebAddress(text: string): boolean {
  try {
    const url = new URL(text);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}
