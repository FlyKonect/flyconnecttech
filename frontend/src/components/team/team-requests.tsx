"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Banner } from "@/components/ui/banner";
import { DataTable } from "@/components/ui/data-table";
import { Select } from "@/components/ui/field";
import { LabelPill } from "@/components/ui/pill";
import { formatWhen } from "@/lib/format-time";
import { priorities, type Priority } from "@/lib/labels";
import { routes } from "@/lib/routes";
import type {
  TeamCounts,
  TeamRequestList,
  TeamRequestRow,
} from "@/lib/team/types";
import { cn } from "@/lib/utils";

export type TeamFilters = {
  status: string;
  q: string;
  project: string;
  priority: string;
  assignee: string;
};

const TABS: { key: keyof TeamCounts; label: string; status: string }[] = [
  { key: "all", label: "All", status: "" },
  { key: "new", label: "New", status: "submitted" },
  { key: "underReview", label: "Review", status: "under-review" },
  { key: "inProgress", label: "In progress", status: "in-progress" },
  { key: "waiting", label: "Waiting", status: "waiting-for-customer" },
  { key: "resolved", label: "Resolved", status: "resolved" },
  { key: "closed", label: "Closed", status: "closed" },
];

const PRIORITY_ORDER: Priority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

/** The address for these filters (empty ones left out). */
function hrefFor(filters: TeamFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `${routes.teamRequests}?${query}` : routes.teamRequests;
}

/**
 * All requests (screen 21): tabs with counts, search and filters, and the
 * table. Everything lives in the address, so the sidebar links, the back
 * button and shared links all work.
 */
export function TeamRequests({
  list,
  filters,
  developerName,
  timeZone,
}: {
  list: TeamRequestList;
  filters: TeamFilters;
  /** Set for developers, who only see their own requests. */
  developerName: string | null;
  timeZone: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState(filters.q);
  const now = new Date();
  const isDeveloper = developerName !== null;
  const filtersOn = Boolean(
    filters.q || filters.project || filters.priority || filters.assignee,
  );
  const change = (next: Partial<TeamFilters>) =>
    router.push(hrefFor({ ...filters, ...next }));

  return (
    <>
      {isDeveloper ? (
        <Banner variant="ok">
          Showing requests assigned to you, {developerName}.
        </Banner>
      ) : null}

      <nav aria-label="Request status" className="flex flex-wrap gap-2">
        {TABS.filter((tab) => !(isDeveloper && tab.key === "new")).map(
          (tab) => {
            const active = filters.status === tab.status;
            return (
              <Link
                key={tab.key}
                href={hrefFor({ ...filters, status: tab.status })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[10px] border px-3.5 text-[13px] font-bold whitespace-nowrap transition-colors",
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-stroke bg-white text-body hover:bg-soft",
                )}
              >
                {tab.label}
                <span className="font-semibold opacity-80">
                  {list.tabs[tab.key]}
                </span>
              </Link>
            );
          },
        )}
      </nav>

      <div className="flex flex-wrap gap-2.5">
        <form
          role="search"
          className="flex-[1_1_240px]"
          onSubmit={(event) => {
            event.preventDefault();
            change({ q: search.trim() });
          }}
        >
          <label className="flex h-[46px] items-center gap-2 rounded-xl border border-stroke bg-white px-3.5 text-muted-foreground focus-within:border-navy">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter by ID, subject or customer"
              aria-label="Filter requests"
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
            />
          </label>
        </form>
        <Select
          aria-label="Project"
          value={filters.project}
          onChange={(event) => change({ project: event.target.value })}
          className="h-[46px] w-auto min-w-[180px] text-sm"
        >
          <option value="">All projects</option>
          {list.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Priority"
          value={filters.priority}
          onChange={(event) => change({ priority: event.target.value })}
          className="h-[46px] w-auto text-sm"
        >
          <option value="">Any priority</option>
          {PRIORITY_ORDER.map((priority) => (
            <option key={priority} value={priority}>
              {priorities[priority].label}
            </option>
          ))}
        </Select>
        {isDeveloper ? null : (
          <Select
            aria-label="Assigned to"
            value={filters.assignee}
            onChange={(event) => change({ assignee: event.target.value })}
            className="h-[46px] w-auto text-sm"
          >
            <option value="">Anyone</option>
            <option value="unassigned">Unassigned</option>
            {list.developers.map((developer) => (
              <option key={developer.id} value={developer.id}>
                {developer.name}
              </option>
            ))}
          </Select>
        )}
        {filtersOn ? (
          <Link
            href={hrefFor({
              status: filters.status,
              q: "",
              project: "",
              priority: "",
              assignee: "",
            })}
            onClick={() => setSearch("")}
            className="inline-flex min-h-[46px] items-center px-3 text-sm font-bold text-gold-text hover:underline"
          >
            Clear filters
          </Link>
        ) : null}
      </div>

      <DataTable<TeamRequestRow>
        caption="Support requests"
        rows={list.rows}
        rowKey={(r) => r.code}
        rowHref={(r) => routes.teamRequest(r.code)}
        rowLabel={(r) => `${r.code}: ${r.title}`}
        empty="No requests match this view."
        columns={[
          {
            header: "Request",
            primary: true,
            className: "w-[140px] whitespace-nowrap text-body",
            cell: (r) => r.code,
          },
          {
            header: "Subject · Customer",
            className: "min-w-[200px]",
            cell: (r) => (
              <>
                <span className="block font-bold">{r.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {[r.customer.name, r.customer.company]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </>
            ),
          },
          {
            header: "Project",
            className: "min-w-[140px] text-body",
            cell: (r) => r.project.name,
          },
          {
            header: "Priority",
            cell: (r) => <LabelPill group="priority" value={r.priority} />,
          },
          {
            header: "Status",
            cell: (r) => <LabelPill group="requestStatus" value={r.status} />,
          },
          {
            header: "Assigned to",
            // Long names wrap, so the Updated column stays on the card.
            className: "min-w-[120px] text-body",
            cell: (r) => r.assignee?.name ?? "Unassigned",
          },
          {
            header: "Updated",
            className: "whitespace-nowrap text-muted-foreground",
            cell: (r) => formatWhen(r.updatedAt, timeZone, now),
          },
        ]}
        card={(r) => (
          <span className="flex flex-col gap-2 text-navy">
            <span className="text-xs font-bold text-muted-foreground">
              {r.code} · {r.customer.company}
            </span>
            <span className="text-[15px] font-bold">{r.title}</span>
            <span className="flex flex-wrap gap-1.5">
              <LabelPill group="requestStatus" value={r.status} />
              <LabelPill group="priority" value={r.priority} />
            </span>
            <span className="text-[13px] text-muted-foreground">
              {r.assignee?.name ?? "Unassigned"} ·{" "}
              {formatWhen(r.updatedAt, timeZone, now)}
            </span>
          </span>
        )}
      />

      {list.total > list.rows.length ? (
        <p className="text-sm text-muted-foreground">
          Showing the newest {list.rows.length} of {list.total}. Use the search
          and filters to find older requests.
        </p>
      ) : null}
    </>
  );
}
