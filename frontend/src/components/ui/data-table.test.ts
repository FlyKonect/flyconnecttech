import { describe, expect, it } from "vitest";

import { pageList } from "./data-table";

describe("pageList", () => {
  it("lists every page when there are few", () => {
    expect(pageList(1, 1)).toEqual([1]);
    expect(pageList(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the first, the last and the pages around this one", () => {
    expect(pageList(1, 10)).toEqual([1, 2, 3, 4, "…", 10]);
    expect(pageList(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageList(10, 10)).toEqual([1, "…", 7, 8, 9, 10]);
  });
});
