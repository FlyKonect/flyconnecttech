"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { LabelPill } from "@/components/ui/pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatWhen } from "@/lib/format-time";
import type { PortalTab, RequestRow } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

const TABS: {
  value: PortalTab;
  label: string;
  test: (r: RequestRow) => boolean;
}[] = [
  { value: "all", label: "All", test: () => true },
  {
    value: "open",
    label: "Open",
    test: (r) =>
      ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"].includes(r.status),
  },
  {
    value: "waiting",
    label: "Awaiting you",
    test: (r) => r.status === "WAITING_FOR_CUSTOMER",
  },
  {
    value: "resolved",
    label: "Resolved",
    test: (r) => r.status === "RESOLVED" || r.status === "CLOSED",
  },
];

/** My requests (screen 12): tabs with counts, and the table. */
export function MyRequests({
  rows,
  initialTab,
  search,
  timeZone,
}: {
  rows: RequestRow[];
  initialTab: PortalTab;
  search: string;
  timeZone: string;
}) {
  const now = new Date();

  return (
    <Tabs defaultValue={initialTab} className="gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList aria-label="My requests">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              count={rows.filter(tab.test).length}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Button asChild className="h-11 px-[18px]">
          <Link href={routes.portalNewRequest}>
            <Plus aria-hidden="true" className="size-4" />
            New request
          </Link>
        </Button>
      </div>

      {search ? (
        <p className="text-sm text-muted-foreground">
          Requests matching “{search}”.{" "}
          <Link
            href={routes.portalRequests}
            className="font-bold text-gold-text hover:underline"
          >
            Clear search
          </Link>
        </p>
      ) : null}

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <DataTable
            caption="My requests"
            rows={rows.filter(tab.test)}
            rowKey={(r) => r.code}
            rowHref={(r) => routes.portalRequest(r.code)}
            rowLabel={(r) => `${r.code}: ${r.title}`}
            empty="No requests in this view."
            columns={[
              {
                header: "Request",
                primary: true,
                className: "w-[150px] whitespace-nowrap text-body",
                cell: (r) => r.code,
              },
              {
                header: "Subject",
                className: "min-w-[200px]",
                cell: (r) => (
                  <>
                    <span className="block font-bold">{r.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Created {formatDate(r.createdAt, timeZone)}
                    </span>
                  </>
                ),
              },
              {
                header: "Project",
                className: "min-w-[150px] text-body",
                cell: (r) => r.project.name,
              },
              {
                header: "Priority",
                cell: (r) => <LabelPill group="priority" value={r.priority} />,
              },
              {
                header: "Status",
                cell: (r) => (
                  <LabelPill group="requestStatus" value={r.status} />
                ),
              },
              {
                header: "Updated",
                className: "whitespace-nowrap text-muted-foreground",
                cell: (r) => formatWhen(r.updatedAt, timeZone, now),
              },
              {
                header: "Assigned to",
                // Long names wrap, so the table stays on the card.
                className: "min-w-[160px]",
                cell: (r) =>
                  r.assignee ? (
                    <span className="flex items-center gap-2">
                      <Avatar
                        name={r.assignee.name}
                        tone="tint"
                        className="size-7 shrink-0 text-[11px]"
                      />
                      {r.assignee.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  ),
              },
            ]}
            card={(r) => (
              <span className="flex flex-col gap-2 text-navy">
                <span className="text-xs font-bold text-muted-foreground">
                  {r.code} · {formatWhen(r.updatedAt, timeZone, now)}
                </span>
                <span className="text-[15px] font-bold">{r.title}</span>
                <span className="flex flex-wrap gap-1.5">
                  <LabelPill group="requestStatus" value={r.status} />
                  <LabelPill group="priority" value={r.priority} />
                </span>
              </span>
            )}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
