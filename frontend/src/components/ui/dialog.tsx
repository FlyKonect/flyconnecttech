"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * A pop-up dialog: 26px corners, navy backdrop, round close button.
 * Escape and a click outside close it, and the keyboard stays inside it
 * while it is open.
 *
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Assign</Button></DialogTrigger>
 *     <DialogContent>
 *       <DialogTitle>Assign developer</DialogTitle>
 *       <DialogDescription>TKT-2026-00124 · Payment page times out</DialogDescription>
 *       …
 *     </DialogContent>
 *   </Dialog>
 *
 * Every dialog needs a DialogTitle, so screen readers can name it.
 */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "default" | "wide";
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-[60] flex overflow-y-auto bg-[rgba(2,26,84,0.55)] p-5"
      >
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            "relative m-auto w-full rounded-[26px] bg-white p-[clamp(20px,3vw,30px)] text-navy shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]",
            size === "wide" ? "max-w-[720px]" : "max-w-[520px]",
            className,
          )}
          {...props}
        >
          {children}
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-3 right-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-portal-bg text-body hover:bg-tint"
          >
            <X aria-hidden="true" className="size-[18px]" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "pr-12 font-heading text-[22px] font-bold tracking-[-0.03em]",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("mt-1.5 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The row of buttons at the bottom of a dialog. */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-6 flex flex-wrap justify-end gap-2.5", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
};
