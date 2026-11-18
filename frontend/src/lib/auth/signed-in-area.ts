"use client";

import * as React from "react";

import { env } from "@/env";

export type SignedInArea = "portal" | "team" | null;

/** Header, footer and page ask together: one request for all of them. */
const REUSE_FOR_MS = 10_000;
let last: { at: number; answer: Promise<SignedInArea> } | null = null;

function ask(): Promise<SignedInArea> {
  if (last && Date.now() - last.at < REUSE_FOR_MS) return last.answer;
  const answer = fetch(`${env.NEXT_PUBLIC_API_URL}/me/status`, {
    credentials: "include",
  })
    .then((response) => (response.ok ? response.json() : { area: null }))
    .then((body: { area?: SignedInArea }) => body.area ?? null)
    // The backend is not answering: show the website as for any visitor.
    .catch(() => null);
  last = { at: Date.now(), answer };
  return answer;
}

/**
 * Which area the visitor is signed in to, for the public website (whose
 * pages are pre-built, so they find out after loading). Undefined while
 * asking; null when not signed in.
 */
export function useSignedInArea(): SignedInArea | undefined {
  const [area, setArea] = React.useState<SignedInArea | undefined>(undefined);
  React.useEffect(() => {
    let current = true;
    void ask().then((answer) => {
      if (current) setArea(answer);
    });
    return () => {
      current = false;
    };
  }, []);
  return area;
}
