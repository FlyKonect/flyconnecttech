import Link from "next/link";
import { Calendar } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/**
 * The gold "Book a demo" button, used all over the website.
 *
 * TEMPORARY: until Phase 2 builds the Book a demo dialog, this goes to the
 * Contact page. Phase 2 changes this one file to open the dialog instead.
 */
export function BookDemoButton({
  size = "siteSm",
  className,
}: Pick<ButtonProps, "size" | "className">) {
  return (
    <Button asChild variant="gold" size={size} className={className}>
      <Link href={routes.contact}>
        <Calendar aria-hidden="true" className="size-[18px]" />
        Book a demo
      </Link>
    </Button>
  );
}
