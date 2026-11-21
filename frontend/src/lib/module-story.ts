import { partsOf } from "@/lib/calendar";
import { moduleStages, type ModuleStage } from "@/lib/labels";
import {
  MAIN_PATH,
  formatDay,
  type ProjectModule,
  type StageChange,
} from "@/lib/projects";

/**
 * A module's story in plain words, for the Timeline and the Modules tabs:
 * what each move means ("went back for changes (round 2)"), where it is
 * now, what is still to do, how it stands against its target, and the
 * scale of the plan chart. Both areas use it; `audience` changes "the
 * customer" into "you" for customers.
 */

export type Audience = "team" | "customer";

/** What a move was, for its icon and colour. */
export type MoveKind =
  | "added"
  | "forward"
  | "back"
  | "review"
  | "changes"
  | "retest"
  | "done"
  | "reset";

const label = (stage: ModuleStage) => moduleStages[stage].label;

/** Where a stage sits on Design → … → Done (-1: not started). */
export function pathIndex(stage: ModuleStage): number {
  if (stage === "NOT_STARTED") return -1;
  if (stage === "CHANGES_REQUESTED") return 1;
  if (stage === "RETEST") return 2;
  return MAIN_PATH.indexOf(stage);
}

/** One move as a sentence after the module's name. */
export function moveStory(
  change: Pick<StageChange, "from" | "to" | "round">,
  audience: Audience,
): { kind: MoveKind; text: string } {
  const { from, to, round } = change;
  if (!from) {
    return {
      kind: "added",
      text:
        to === "NOT_STARTED"
          ? "was added to the project"
          : `was added, starting at ${label(to)}`,
    };
  }
  switch (to) {
    case "DONE":
      return {
        kind: "done",
        text:
          from === "CLIENT_REVIEW"
            ? "was approved and is done"
            : "was marked as done",
      };
    case "CLIENT_REVIEW":
      return {
        kind: "review",
        text:
          audience === "customer"
            ? "is ready for your review"
            : "was sent to the customer for review",
      };
    case "CHANGES_REQUESTED":
      return {
        kind: "changes",
        text: `went back for changes (round ${round})`,
      };
    case "RETEST":
      return { kind: "retest", text: `is being tested again (round ${round})` };
    case "NOT_STARTED":
      return { kind: "reset", text: "was set back to Not started" };
    default:
      if (from === "CHANGES_REQUESTED") {
        return { kind: "forward", text: `is being changed in ${label(to)}` };
      }
      if (pathIndex(to) < pathIndex(from)) {
        return { kind: "back", text: `went back to ${label(to)}` };
      }
      return {
        kind: "forward",
        text:
          from === "NOT_STARTED"
            ? `started, in ${label(to)}`
            : `moved on to ${label(to)}`,
      };
  }
}

/** "In Development", "Waiting for your review", "Done", … */
export function nowWords(
  module: Pick<ProjectModule, "stage" | "round">,
  audience: Audience,
): string {
  switch (module.stage) {
    case "NOT_STARTED":
      return "Not started yet";
    case "DONE":
      return "Done";
    case "CLIENT_REVIEW":
      return audience === "customer"
        ? "Waiting for your review"
        : "Waiting for the customer's review";
    case "CHANGES_REQUESTED":
      return `Changes asked for · round ${module.round}`;
    case "RETEST":
      return `Being tested again · round ${module.round}`;
    default:
      return `In ${label(module.stage)}`;
  }
}

/** The usual stages it hasn't reached yet (Done included), in order. */
export function stillToDo(module: Pick<ProjectModule, "stage">): ModuleStage[] {
  if (module.stage === "DONE") return [];
  const here = pathIndex(module.stage);
  return MAIN_PATH.filter((_, index) => index > here);
}

/** Whole days from one calendar day to another ("2026-11-21"). */
export function daysBetween(from: string, to: string): number {
  const a = partsOf(from)!;
  const b = partsOf(to)!;
  return Math.round(
    (Date.UTC(b.year, b.month, b.day) - Date.UTC(a.year, a.month, a.day)) /
      86_400_000,
  );
}

export type Due = {
  words: string;
  /** For the colour: late in red, soon in amber. */
  state: "none" | "done" | "late" | "soon" | "ahead";
};

/** "Due in 12 days", "Due today", "3 days late", "Done 21 Nov 2026". */
export function dueWords(
  module: Pick<ProjectModule, "stage" | "targetDate" | "doneAt">,
  today: string,
): Due {
  if (module.stage === "DONE") {
    return {
      words: module.doneAt
        ? `Done ${formatDay(module.doneAt.slice(0, 10))}`
        : "Done",
      state: "done",
    };
  }
  if (!module.targetDate) return { words: "No target date", state: "none" };
  const left = daysBetween(today, module.targetDate);
  if (left < 0) {
    const late = -left;
    return { words: `${late} day${late === 1 ? "" : "s"} late`, state: "late" };
  }
  if (left === 0) return { words: "Due today", state: "soon" };
  if (left === 1) return { words: "Due tomorrow", state: "soon" };
  return {
    words: `Due in ${left} days`,
    state: left <= 7 ? "soon" : "ahead",
  };
}

/** Today in a time zone, as a calendar day. */
export function todayIn(zone: string, now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: zone });
}

/**
 * A move as "{who} {before} {module} {after}", for the activity feed:
 * "Emma Clarke moved Payments on to Testing", "Sarah asked for changes to
 * Payments (round 2)".
 */
export function movePhrase(
  change: Pick<StageChange, "from" | "to" | "round">,
  audience: Audience,
): { kind: MoveKind; before: string; after: string } {
  const { kind } = moveStory(change, audience);
  const { from, to, round } = change;
  if (!from) {
    return {
      kind,
      before: "added",
      after: to === "NOT_STARTED" ? "" : `, starting at ${label(to)}`,
    };
  }
  switch (to) {
    case "DONE":
      return from === "CLIENT_REVIEW"
        ? { kind, before: "approved", after: "" }
        : { kind, before: "marked", after: "as done" };
    case "CLIENT_REVIEW":
      return {
        kind,
        before: "sent",
        after:
          audience === "customer"
            ? "for your review"
            : "to the customer for review",
      };
    case "CHANGES_REQUESTED":
      return {
        kind,
        before: "asked for changes to",
        after: `(round ${round})`,
      };
    case "RETEST":
      return { kind, before: "started retesting", after: `(round ${round})` };
    case "NOT_STARTED":
      return { kind, before: "reset", after: "to Not started" };
    default:
      if (from === "CHANGES_REQUESTED") {
        return {
          kind,
          before: "started the changes to",
          after: `in ${label(to)}`,
        };
      }
      if (kind === "back") {
        return { kind, before: "moved", after: `back to ${label(to)}` };
      }
      if (from === "NOT_STARTED") {
        return { kind, before: "started", after: `with ${label(to)}` };
      }
      return { kind, before: "moved", after: `on to ${label(to)}` };
  }
}
