import { describe, expect, test } from "vitest";

import { targetCode, targetWords } from "./targets";

describe("response targets", () => {
  test("words become the saved short form", () => {
    expect(targetCode("1 hour")).toBe("1h");
    expect(targetCode("4 hours")).toBe("4h");
    expect(targetCode("1 business day")).toBe("1bd");
    expect(targetCode("2 Business Days")).toBe("2bd");
    expect(targetCode("30 minutes")).toBe("30m");
    expect(targetCode("4h")).toBe("4h");
    expect(targetCode(" 2bd ")).toBe("2bd");
  });

  test("anything else is refused", () => {
    expect(targetCode("soon")).toBeNull();
    expect(targetCode("0 hours")).toBeNull();
    expect(targetCode("1.5 hours")).toBeNull();
    expect(targetCode("2 weeks")).toBeNull();
    expect(targetCode("45 business days")).toBeNull();
  });

  test("the short form is shown in words", () => {
    expect(targetWords("1h")).toBe("1 hour");
    expect(targetWords("4h")).toBe("4 hours");
    expect(targetWords("1bd")).toBe("1 business day");
    expect(targetWords("2bd")).toBe("2 business days");
    expect(targetWords("45m")).toBe("45 minutes");
  });
});
