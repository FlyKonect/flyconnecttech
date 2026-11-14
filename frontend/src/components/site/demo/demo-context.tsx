"use client";

import * as React from "react";

import { DemoDialog } from "@/components/site/demo/demo-dialog";

/**
 * Lets any "Book a demo" button on the website open the one demo dialog.
 * DemoProvider is in the website layout.
 */

const DemoContext = React.createContext<(() => void) | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  // When the dialog was last opened. The demo days are counted from this, so
  // a page left open overnight still offers the right days.
  const [openedAt, setOpenedAt] = React.useState<number | null>(null);
  // The button that opened the dialog gets the keyboard back when it closes.
  const opener = React.useRef<HTMLElement | null>(null);

  const openDemo = React.useCallback(() => {
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setOpenedAt(Date.now());
    setOpen(true);
  }, []);

  return (
    <DemoContext value={openDemo}>
      {children}
      <DemoDialog
        open={open}
        openedAt={openedAt}
        onOpenChange={setOpen}
        returnFocusTo={opener}
      />
    </DemoContext>
  );
}

/** Returns a function that opens the Book a demo dialog. */
export function useOpenDemo(): () => void {
  const open = React.use(DemoContext);
  if (!open) throw new Error("useOpenDemo must be used inside <DemoProvider>.");
  return open;
}
