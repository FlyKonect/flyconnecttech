"use client";

import * as React from "react";

/**
 * Next.js keeps a page you leave alive in the background and shows it again
 * exactly as it was. A sign-in form must not come back with the last
 * person's email, password or code in it (for example after Logout), so this
 * number changes each time the page is shown again: a form keyed on it
 * starts empty.
 *
 * Effects run again whenever a kept page is shown, which is how this
 * notices. In development React also hides and shows every new component
 * once, straight away, to catch bugs; that happens in the same moment, so a
 * showing right after a hiding does not count.
 */
export function useVisitKey(): number {
  const [visit, setVisit] = React.useState(0);
  const shownBefore = React.useRef(false);
  const justHidden = React.useRef(false);
  React.useLayoutEffect(() => {
    if (shownBefore.current && !justHidden.current) {
      setVisit((count) => count + 1);
    }
    shownBefore.current = true;
    return () => {
      justHidden.current = true;
      queueMicrotask(() => {
        justHidden.current = false;
      });
    };
  }, []);
  return visit;
}
