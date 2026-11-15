"use client";

import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * The "⋯" button at the end of a table row, with a short menu of actions
 * for that row. Arrow keys move through the items; Escape closes it.
 *
 *   <RowMenu label="Actions for Bilal Khan">
 *     <RowMenuItem onSelect={resend}>Resend invitation</RowMenuItem>
 *     <RowMenuItem danger onSelect={disable}>Disable user</RowMenuItem>
 *   </RowMenu>
 */
function RowMenu({
  label,
  children,
}: {
  /** The button's name for screen readers: "Actions for Bilal Khan". */
  label: string;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label={label}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-soft hover:text-navy data-[state=open]:bg-soft data-[state=open]:text-navy"
      >
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[200px] rounded-[14px] border border-line-2 bg-white p-1.5 shadow-[0_12px_32px_rgba(2,26,84,0.14)]"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function RowMenuItem({
  danger = false,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item> & {
  /** Red text, for actions like Disable. */
  danger?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex min-h-10 cursor-pointer items-center rounded-[10px] px-3 text-sm font-bold text-navy outline-none select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-soft",
        danger && "text-danger",
        className,
      )}
      {...props}
    />
  );
}

export { RowMenu, RowMenuItem };
