"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, FolderKanban, MailCheck, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { DownloadCsv } from "@/components/team/download-csv";
import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { LabelPill } from "@/components/ui/pill";
import { plural } from "@/lib/plural";
import { withPage } from "@/lib/paging";
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
      <ul
        aria-label="Customers summary"
        className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5"
      >
        <li>
          <StatCard
            icon={Building2}
            value={list.summary.customers}
            label={list.summary.customers === 1 ? "Customer" : "Customers"}
            note="With a client portal account"
          />
        </li>
        <li>
          <StatCard
            icon={FolderKanban}
            tone="gold"
            value={list.summary.projects}
            label={list.summary.projects === 1 ? "Project" : "Projects"}
            note="Across all customers"
          />
        </li>
        <li>
          <StatCard
            icon={MailCheck}
            tone="orange"
            value={list.summary.invited}
            label="Invitations pending"
            note="Not activated yet"
          />
        </li>
      </ul>

      {/* Search on the left; Add customer (or View only) on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full max-w-[380px] flex-wrap items-center gap-2.5">
          <form
            role="search"
            className="w-full"
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
            <label className="flex h-11 items-center gap-2 rounded-xl border border-line-2 bg-white px-3.5 text-muted-foreground focus-within:border-navy">
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
        </div>
        {list.canManage ? (
          <span className="flex flex-wrap gap-2">
            <DownloadCsv path="/team/customers/export.csv" className="h-10" />
            <Link href={routes.teamNewCustomer} className={buttonVariants()}>
              + Add customer
            </Link>
          </span>
        ) : (
          <span className="inline-block rounded-full bg-chip px-3 py-1 text-xs font-bold text-body">
            View only
          </span>
        )}
      </div>

      <DataTable<CustomerRow>
        caption="Customers"
        rows={list.rows}
        serverPaging={{
          page: list.page,
          pageSize: list.pageSize,
          total: list.total,
          href: (page, size) =>
            withPage(
              query
                ? `${routes.teamCustomers}?q=${encodeURIComponent(query)}`
                : routes.teamCustomers,
              page,
              size,
            ),
        }}
        rowKey={(c) => c.id}
        rowHref={(c) => routes.teamCustomer(c.id)}
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
