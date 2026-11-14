import * as React from "react";

import { cn } from "@/lib/utils";

/** White portal card: 22px corners, soft border. */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "min-w-0 rounded-[22px] border border-line-2 bg-white p-[22px]",
        className,
      )}
      {...props}
    />
  );
}

/** Title row of a card. Put an action (for example a "View all" link) as a second child. */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-1",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn("font-sans text-[17px] font-bold", className)}
      {...props}
    />
  );
}

/** Light inner tile inside a card: 16px corners. */
function Tile({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tile"
      className={cn(
        "min-w-0 rounded-2xl border border-line-2 bg-portal-bg p-4",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, Tile };
