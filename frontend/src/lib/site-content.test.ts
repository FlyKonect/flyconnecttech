import { describe, expect, test } from "vitest";

import {
  FALLBACK_SITE_CONTENT,
  hostOf,
  initialsOf,
  parseSiteContent,
  testimonialByline,
} from "@/lib/site-content";

const sarah = {
  id: "t1",
  quote: "They rebuilt our booking site in six weeks.",
  name: "Sarah Mitchell",
  role: "Managing director",
  company: "Bluewave Holidays",
};

describe("the website's copy of the Website content", () => {
  test("takes the backend's answer as it is", () => {
    const answer = {
      liveProjectUrl: "https://flyconnect.co.uk",
      home: [sarah],
      caseStudy: sarah,
    };
    expect(parseSiteContent(answer)).toEqual(answer);
  });

  test("anything unexpected gives the default link and no quotes", () => {
    expect(parseSiteContent(null)).toEqual(FALLBACK_SITE_CONTENT);
    expect(
      parseSiteContent({ liveProjectUrl: "javascript:alert(1)", home: [] }),
    ).toEqual(FALLBACK_SITE_CONTENT);
    expect(FALLBACK_SITE_CONTENT.liveProjectUrl).toBe(
      "https://dev.flyconnect.co.uk",
    );
  });
});

test("the words around a quote", () => {
  expect(hostOf("https://dev.flyconnect.co.uk/")).toBe("dev.flyconnect.co.uk");
  expect(testimonialByline(sarah)).toBe("Managing director, Bluewave Holidays");
  expect(testimonialByline({ ...sarah, role: null })).toBe("Bluewave Holidays");
  expect(testimonialByline({ ...sarah, role: null, company: null })).toBe("");
  expect(initialsOf("Sarah Mitchell")).toBe("SM");
  expect(initialsOf("  Cher ")).toBe("C");
  expect(initialsOf("Mary Anne de Souza")).toBe("MS");
});
