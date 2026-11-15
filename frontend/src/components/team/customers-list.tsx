"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { LabelPill } from "@/components/ui/pill";
import { plural } from "@/lib/plural";
import { routes } from "@/lib/routes";
import type { CustomerList, CustomerRow } from "@/lib/team/types";

/** "6 customers · 7 projects · 1 invitation pending" */
export function customerSummary(summary: CustomerList["summary"]) {
  return [
    plural(summary.customers, "customer"),
    plural(summary.projects, "project"),
    ...(summary.invited
      ? [`${plural(summary.invited, "invitation")} pending`]
      : []),
  ].join(" · ");
}

/**
 * Customers (screen 26): the summary, search, + Add customer and the table.
 * Managers see it with a "View only" tag and without the add button.
 */
export function CustomersList({
  list,
  query,
}: {
  list: CustomerList;
  query: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState(query);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-muted-foreground">
          {customerSummary(list.summary)}
          {list.canManage ? null : (
            <span className="ml-2 inline-block rounded-full bg-chip px-[9px] py-[3px] text-xs font-bold text-body">
              View only
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2.5">
          <form
            role="search"
            className="w-[280px] max-w-full"
            onSubmit={(event) => {
              event.preventDefault();
              const q = search.trim();
              router.push(
                q
                  ? `${routes.teamCustomers}?q=${encodeURIComponent(q)}`
                  : routes.teamCustomers,
              );
            }}
          >
            <label className="flex h-[46px] items-center gap-2 rounded-xl border border-stroke bg-white px-3.5 text-muted-foreground focus-within:border-navy">
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers or projects"
                aria-label="Search customers or projects"
                className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>
          {list.canManage ? (
            <Link href={routes.teamNewCustomer} className={buttonVariants()}>
              + Add customer
            </Link>
          ) : null}
        </div>
      </div>

      <DataTable<CustomerRow>
        caption="Customers"
        rows={list.rows}
        rowKey={(c) => c.id}
        rowHref={(c) => routes.teamCustomer(c.id)}
        rowLabel={(c) => `View ${c.name}, ${c.company}`}
        empty={query ? "No customers match your search." : "No customers yet."}
        columns={[
          {
            header: "Customer",
            primary: true,
            className: "min-w-[220px]",
            cell: (c) => (
              <span className="flex min-w-0 items-center gap-2.5">
                <Avatar name={c.name} tone="tint" className="size-9" />
                <span className="min-w-0">
                  <span className="block font-bold">{c.name}</span>
                  <span className="block max-w-[220px] truncate text-xs font-normal text-muted-foreground">
                    {c.email}
                  </span>
                </span>
              </span>
            ),
          },
          {
            header: "Company",
            className: "min-w-[140px] text-body",
            cell: (c) => c.company,
          },
          {
            header: "Projects",
            className: "min-w-[180px]",
            cell: (c) => <ProjectNames names={c.projects} />,
          },
          {
            header: "Open requests",
            className: "font-bold",
            cell: (c) => c.openRequests,
          },
          {
            header: "Status",
            cell: (c) => <LabelPill group="userStatus" value={c.status} />,
          },
          {
            header: "",
            className: "text-right whitespace-nowrap font-bold text-gold-text",
            cell: () => "View →",
          },
        ]}
        card={(c) => (
          <span className="flex flex-col gap-1.5 text-navy">
            <span className="flex items-center justify-between gap-2">
              <span className="text-[15px] font-bold">{c.name}</span>
              <LabelPill group="userStatus" value={c.status} />
            </span>
            <span className="text-[13px] break-all text-muted-foreground">
              {c.company} · {c.email}
            </span>
            <ProjectNames names={c.projects} />
            <span className="text-[13px] text-body">
              {plural(c.openRequests, "open request")}
            </span>
          </span>
        )}
      />

      {list.total > list.rows.length ? (
        <p className="text-sm text-muted-foreground">
          Showing the newest {list.rows.length} of {list.total}. Search to find
          the others.
        </p>
      ) : null}
      {list.canManage ? (
        <p className="text-[13px] text-muted-foreground">
          Customers can&apos;t sign up themselves. Add them here and they get an
          email to verify their address and set a password.
        </p>
      ) : null}
    </>
  );
}

function ProjectNames({ names }: { names: string[] }) {
  return (
    <span className="block">
      <span className="block font-bold">{plural(names.length, "project")}</span>
      {names.length ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {names.join(", ")}
        </span>
      ) : null}
    </span>
  );
}
