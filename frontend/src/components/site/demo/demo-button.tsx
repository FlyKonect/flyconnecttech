"use client";

import * as React from "react";

import { useOpenDemo } from "@/components/site/demo/demo-context";

/** A button that opens the Book a demo dialog. Styling is up to the caller. */
export function DemoButton({
  onClick,
  ...props
}: Omit<React.ComponentProps<"button">, "type">) {
  const openDemo = useOpenDemo();

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) openDemo();
      }}
      {...props}
    />
  );
}
