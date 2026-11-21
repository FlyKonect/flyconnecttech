import { describe, expect, it } from "vitest";

import {
  daysBetween,
  movePhrase,
  dueWords,
  moveStory,
  nowWords,
  stillToDo,
} from "./module-story";

const move = (
  from: Parameters<typeof moveStory>[0]["from"],
  to: Parameters<typeof moveStory>[0]["to"],
  round = 1,
) => ({ from, to, round });

describe("a module's story in words", () => {
  it("tells each move plainly", () => {
    expect(moveStory(move(null, "NOT_STARTED"), "team")).toEqual({
      kind: "added",
      text: "was added to the project",
    });
    expect(moveStory(move("NOT_STARTED", "DESIGN"), "team").text).toBe(
      "started, in Design",
    );
    expect(moveStory(move("DESIGN", "DEVELOPMENT"), "team").text).toBe(
      "moved on to Development",
    );
    expect(moveStory(move("TESTING", "DEVELOPMENT"), "team")).toEqual({
      kind: "back",
      text: "went back to Development",
    });
    expect(moveStory(move("TESTING", "CLIENT_REVIEW"), "team").text).toBe(
      "was sent to the customer for review",
    );
    expect(moveStory(move("TESTING", "CLIENT_REVIEW"), "customer").text).toBe(
      "is ready for your review",
    );
    expect(
      moveStory(move("CLIENT_REVIEW", "CHANGES_REQUESTED", 2), "team"),
    ).toEqual({ kind: "changes", text: "went back for changes (round 2)" });
    expect(
      moveStory(move("CHANGES_REQUESTED", "DEVELOPMENT", 2), "team").text,
    ).toBe("is being changed in Development");
    expect(moveStory(move("DEVELOPMENT", "RETEST", 2), "team").text).toBe(
      "is being tested again (round 2)",
    );
    expect(moveStory(move("CLIENT_REVIEW", "DONE"), "team").text).toBe(
      "was approved and is done",
    );
    expect(moveStory(move("TESTING", "DONE"), "team").text).toBe(
      "was marked as done",
    );
  });

  it("says where a module is and what is left", () => {
    expect(nowWords({ stage: "CLIENT_REVIEW", round: 1 }, "customer")).toBe(
      "Waiting for your review",
    );
    expect(nowWords({ stage: "RETEST", round: 2 }, "team")).toBe(
      "Being tested again · round 2",
    );
    expect(stillToDo({ stage: "NOT_STARTED" })).toEqual([
      "DESIGN",
      "DEVELOPMENT",
      "TESTING",
      "CLIENT_REVIEW",
      "DONE",
    ]);
    expect(stillToDo({ stage: "CHANGES_REQUESTED" })).toEqual([
      "TESTING",
      "CLIENT_REVIEW",
      "DONE",
    ]);
    expect(stillToDo({ stage: "DONE" })).toEqual([]);
  });

  it("counts the days to the target", () => {
    const today = "2026-11-21";
    const at = (targetDate: string | null) =>
      dueWords({ stage: "DEVELOPMENT", targetDate, doneAt: null }, today);
    expect(at(null)).toEqual({ words: "No target date", state: "none" });
    expect(at("2026-11-21")).toEqual({ words: "Due today", state: "soon" });
    expect(at("2026-11-22").words).toBe("Due tomorrow");
    expect(at("2026-11-25")).toEqual({ words: "Due in 4 days", state: "soon" });
    expect(at("2026-12-21")).toEqual({
      words: "Due in 30 days",
      state: "ahead",
    });
    expect(at("2026-11-20")).toEqual({ words: "1 day late", state: "late" });
    expect(
      dueWords(
        {
          stage: "DONE",
          targetDate: "2026-11-20",
          doneAt: "2026-11-19T10:00:00Z",
        },
        today,
      ),
    ).toEqual({ words: "Done 19 Nov 2026", state: "done" });
    expect(daysBetween("2026-12-31", "2027-01-02")).toBe(2);
  });
});

describe("a move as who did what", () => {
  const phrase = (
    from: Parameters<typeof movePhrase>[0]["from"],
    to: Parameters<typeof movePhrase>[0]["to"],
    audience: "team" | "customer" = "team",
    round = 1,
  ) => {
    const p = movePhrase({ from, to, round }, audience);
    return `X ${p.before} M${p.after ? (p.after.startsWith(",") ? p.after : ` ${p.after}`) : ""}`;
  };

  it("reads as a sentence", () => {
    expect(phrase(null, "NOT_STARTED")).toBe("X added M");
    expect(phrase("NOT_STARTED", "DESIGN")).toBe("X started M with Design");
    expect(phrase("DESIGN", "DEVELOPMENT")).toBe("X moved M on to Development");
    expect(phrase("TESTING", "DEVELOPMENT")).toBe(
      "X moved M back to Development",
    );
    expect(phrase("TESTING", "CLIENT_REVIEW", "customer")).toBe(
      "X sent M for your review",
    );
    expect(phrase("CLIENT_REVIEW", "CHANGES_REQUESTED", "team", 2)).toBe(
      "X asked for changes to M (round 2)",
    );
    expect(phrase("CHANGES_REQUESTED", "DEVELOPMENT", "team", 2)).toBe(
      "X started the changes to M in Development",
    );
    expect(phrase("CLIENT_REVIEW", "DONE")).toBe("X approved M");
    expect(phrase("TESTING", "DONE")).toBe("X marked M as done");
  });
});
