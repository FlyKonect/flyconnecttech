import { describe, expect, test } from "vitest";

import { addFiles, fileProblem, MAX_FILE_BYTES } from "./uploads";

const file = (name: string, size = 1000) => ({ name, size });

describe("files a customer can attach", () => {
  test("pictures, PDFs, Office files, CSV, text and ZIP are fine", () => {
    for (const name of [
      "report-totals.png",
      "photo.JPG",
      "invoice.pdf",
      "commission-report-oct.xlsx",
      "bookings.csv",
      "logs.zip",
    ]) {
      expect(fileProblem(file(name))).toBe("");
    }
  });

  test("other kinds, empty files and files over 10 MB are refused", () => {
    expect(fileProblem(file("setup.exe"))).toContain("can't be attached");
    expect(fileProblem(file("page.html"))).toContain("can't be attached");
    expect(fileProblem(file("empty.png", 0))).toContain("it is empty");
    expect(fileProblem(file("big.png", MAX_FILE_BYTES + 1))).toContain(
      "larger than 10 MB",
    );
  });

  test("adding files skips repeats and stops at five", () => {
    const first = addFiles([], [file("a.png"), file("a.png"), file("b.pdf")]);
    expect(first.files.map((f) => f.name)).toEqual(["a.png", "b.pdf"]);
    expect(first.error).toBe("");

    const many = addFiles(first.files, [
      file("c.png"),
      file("d.png"),
      file("e.png"),
      file("f.png"),
    ]);
    expect(many.files).toHaveLength(5);
    expect(many.error).toBe("You can attach up to 5 files.");
  });

  test("a refused file is left out with its reason, the others are kept", () => {
    const result = addFiles([], [file("virus.exe"), file("ok.png")]);
    expect(result.files.map((f) => f.name)).toEqual(["ok.png"]);
    expect(result.error).toContain('"virus.exe"');
  });
});
