import { describe, expect, it } from "vitest";

import { pagingQuery, withPage } from "./paging";

describe("paging", () => {
  it("adds the page and size to an address, leaving out the defaults", () => {
    expect(withPage("/team/requests?status=closed", 3, 50)).toBe(
      "/team/requests?status=closed&page=3&size=50",
    );
    expect(withPage("/team/customers?page=4", 1, 25)).toBe("/team/customers");
  });

  it("reads only sensible values from the address", () => {
    expect(pagingQuery({ page: "2", size: "100" })).toEqual({
      page: "2",
      size: "100",
    });
    expect(pagingQuery({ page: "x", size: "7" })).toEqual({});
    expect(pagingQuery({ page: "1", size: "25" })).toEqual({});
  });
});
