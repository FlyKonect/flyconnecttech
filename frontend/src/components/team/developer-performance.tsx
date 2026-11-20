"use client";

import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import type { Report } from "@/lib/team/types";

/**
 * Reports, "Developer performance · this month". A client component because
 * the shared table pages its rows in the browser; the server page passes
 * only the data.
 */
export function DeveloperPerformance({ rows }: { rows: Report["developers"] }) {
  return (
    <DataTable
      caption="Developer performance this month"
      rows={rows}
      rowKey={(row) => row.id}
      empty="No active developers yet."
      className="mt-3 [&_table]:border-0 [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none"
      columns={[
        {
          header: "Developer",
          primary: true,
          className: "min-w-[220px]",
          cell: (row) => (
            <span className="flex items-center gap-2.5">
              <Avatar name={row.name} tone="tint" className="size-8" />
              <span className="min-w-0">
                <span className="block font-bold">{row.name}</span>
                {row.jobTitle ? (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {row.jobTitle}
                  </span>
                ) : null}
              </span>
            </span>
          ),
        },
        { header: "Assigned", cell: (row) => row.assigned },
        { header: "Resolved", cell: (row) => row.resolved },
        {
          header: "Avg. first response",
          cell: (row) => row.firstResponse ?? "—",
        },
      ]}
    />
  );
}
