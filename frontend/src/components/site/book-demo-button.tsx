"use client";

import { Calendar } from "lucide-react";

import { DemoButton } from "@/components/site/demo/demo-button";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The gold "Book a demo" button in the website header. Opens the demo dialog. */
export function BookDemoButton({
  size = "siteSm",
  className,
}: Pick<ButtonProps, "size" | "className">) {
  return (
    <DemoButton
      className={cn(buttonVariants({ variant: "gold", size }), className)}
    >
      <Calendar aria-hidden="true" className="size-[18px]" />
      Book a demo
    </DemoButton>
  );
}
