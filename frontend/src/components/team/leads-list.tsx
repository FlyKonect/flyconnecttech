"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { LabelPill } from "@/components/ui/pill";
import { demoDayShort, demoTime } from "@/lib/forms/demo-slots";
import { formatWhen } from "@/lib/format-time";
import {
  budgets,
  demoTopics,
  messageTopics,
  quoteProjectTypes,
  timelines,
} from "@/lib/labels";
import {
  demoShort,
  demoStart,
  KIND_PLURAL,
  LEAD_TABS,
  leadHref,
  leadListHref,
} from "@/lib/team/leads";
import type {
  DemoRow,
  LeadKind,
  LeadList,
  MessageRow,
  QuoteRow,
} from "@/lib/team/types";
import { cn } from "@/lib/utils";

type AnyRow = DemoRow | QuoteRow | MessageRow;

const SEARCH: Record<LeadKind, string> = {
  demo: "Search name, company or email",
  quote: "Search name, company or email",
  message: "Search name, email or message",
};

const FOOT: Record<LeadKind, string> = {
  demo: "From Book a demo on the website. Times are in UK time, as the visitor chose them.",
  quote:
    "From Get a quote on the website. The home page form asks for fewer details than the Contact & Quote page.",
  message: "From Send a message on the Contact & Quote page.",
};

/**
 * Demo requests, Quote requests and Messages (screens 34, 37, 40, M6):
 * the summary, search, status tabs with counts and the table (cards on
 * phones). The tab and search live in the address.
 */
export function LeadsList({
  kind,
  list,
  status,
  query,
  timeZone,
}: {
  kind: LeadKind;
  list: LeadList<AnyRow>;
  /** The ?status= value, or "" for All. */
  status: string;
  query: string;
  timeZone: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState(query);
  const now = new Date();
  const hrefFor = (next: { status?: string; q?: string }) => {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const q = next.q ?? query;
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const text = params.toString();
    return text ? `${leadListHref(kind)}?${text}` : leadListHref(kind);
  };
  const received = (row: AnyRow) => formatWhen(row.createdAt, timeZone, now);
  const owner = (row: AnyRow) => row.owner?.name ?? "Unassigned";
  const statusCell = (row: AnyRow) => (
    <span className="flex flex-col items-start gap-1">
      <StatusPill kind={kind} row={row} />
      {kind !== "message" && row.customerId ? (
        <span className="text-xs text-muted-foreground">Now a customer</span>
      ) : null}
    </span>
  );
  const two = (top: React.ReactNode, under: React.ReactNode, bold = true) => (
    <>
      <span className={cn("block", bold && "font-bold")}>{top}</span>
      <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
        {under}
      </span>
    </>
  );

  const request: DataTableColumn<AnyRow> = {
    header: kind === "message" ? "Message" : "Request",
    primary: true,
    className: "w-[150px] whitespace-nowrap",
    cell: (row) => two(row.code, received(row)),
  };
  const columns: DataTableColumn<AnyRow>[] =
    kind === "demo"
      ? [
          request,
          {
            header: "Contact",
            className: "min-w-[160px]",
            cell: (row) => two(row.name, (row as DemoRow).company),
          },
          {
            header: "Wants to see",
            className: "min-w-[160px] text-body",
            cell: (row) => demoTopics[(row as DemoRow).topic].label,
          },
          {
            header: "Preferred time",
            className: "whitespace-nowrap",
            cell: (row) => {
              const start = demoStart(row as DemoRow);
              return two(
                demoDayShort(start),
                `${demoTime(start)} UK time`,
                false,
              );
            },
          },
          { header: "Owner", className: "text-body", cell: owner },
          { header: "Status", cell: statusCell },
        ]
      : kind === "quote"
        ? [
            request,
            {
              header: "Contact",
              className: "min-w-[160px]",
              cell: (row) =>
                two(row.name, (row as QuoteRow).company || "Company not given"),
            },
            {
              header: "Project type",
              className: "min-w-[140px] text-body",
              cell: (row) =>
                quoteProjectTypes[(row as QuoteRow).projectType].label,
            },
            {
              header: "Budget",
              className: "whitespace-nowrap text-body",
              cell: (row) => budgets[(row as QuoteRow).budget].label,
            },
            {
              header: "Timeline",
              className: "min-w-[110px] text-body",
              cell: (row) => {
                const timeline = (row as QuoteRow).timeline;
                return timeline ? timelines[timeline].label : "—";
              },
            },
            { header: "Owner", className: "text-body", cell: owner },
            { header: "Status", cell: statusCell },
          ]
        : [
            request,
            {
              header: "From",
              className: "min-w-[170px]",
              cell: (row) =>
                two(
                  row.name,
                  <span className="block max-w-[200px] truncate">
                    {(row as MessageRow).email}
                  </span>,
                ),
            },
            {
              header: "Topic",
              className: "min-w-[120px] text-body",
              cell: (row) => messageTopics[(row as MessageRow).topic].label,
            },
            {
              header: "Preview",
              className: "min-w-[220px] text-body",
              cell: (row) => (
                <span className="line-clamp-2">
                  {(row as MessageRow).message}
                </span>
              ),
            },
            { header: "Owner", className: "text-body", cell: owner },
            { header: "Status", cell: statusCell },
          ];

  const cardLine = (row: AnyRow) => {
    if (kind === "demo") {
      const demo = row as DemoRow;
      return `${demo.company} · ${demoShort(demoStart(demo))}`;
    }
    if (kind === "quote") {
      const quote = row as QuoteRow;
      return [quote.company, quoteProjectTypes[quote.projectType].label]
        .filter(Boolean)
        .join(" · ");
    }
    const message = row as MessageRow;
    return `${messageTopics[message.topic].label} · ${message.email}`;
  };

  return (
    <>
      {/* The tabs already show the counts; the search sits at the right. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Status"
          className="flex max-w-full flex-wrap gap-1 rounded-xl border border-line-2 bg-white p-1"
        >
          {[{ slug: "", status: "", label: "All" }, ...LEAD_TABS[kind]].map(
            (tab) => {
              const active = status === tab.slug;
              const count = tab.status
                ? (list.tabs[tab.status] ?? 0)
                : list.all;
              return (
                <Link
                  key={tab.label}
                  href={hrefFor({ status: tab.slug })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-bold whitespace-nowrap transition-colors",
                    active
                      ? "bg-navy text-white"
                      : "text-body hover:bg-soft hover:text-navy",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-soft text-navy-700",
                    )}
                  >
                    {count}
                  </span>
                </Link>
              );
            },
          )}
        </nav>
        <form
          role="search"
          className="w-[300px] max-w-full max-app:w-full"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(hrefFor({ q: search.trim() }));
          }}
        >
          <label className="flex h-11 items-center gap-2 rounded-xl border border-line-2 bg-white px-3.5 text-muted-foreground focus-within:border-navy">
            <Search aria-hidden="true" className="size-4 shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={SEARCH[kind]}
              aria-label={SEARCH[kind]}
              className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
            />
          </label>
        </form>
      </div>

      <DataTable<AnyRow>
        caption={KIND_PLURAL[kind]}
        rows={list.rows}
        rowKey={(row) => row.code}
        rowHref={(row) => leadHref(kind, row.code)}
        empty="Nothing in this view."
        columns={columns}
        card={(row) => (
          <span className="flex flex-col gap-1.5 text-navy">
            <span className="text-xs font-bold text-muted-foreground">
              {row.code} · {received(row)}
            </span>
            <span className="text-[15px] font-bold">{row.name}</span>
            <span className="text-[13px] break-words text-muted-foreground">
              {cardLine(row)}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <StatusPill kind={kind} row={row} />
              <span className="text-[13px] text-muted-foreground">
                {owner(row)}
              </span>
            </span>
          </span>
        )}
      />

      {list.matching > list.rows.length ? (
        <p className="text-sm text-muted-foreground">
          Showing the newest {list.rows.length} of {list.matching}. Search to
          find older ones.
        </p>
      ) : null}
      <p className="text-[13px] text-muted-foreground">{FOOT[kind]}</p>
    </>
  );
}

function StatusPill({ kind, row }: { kind: LeadKind; row: AnyRow }) {
  if (kind === "demo") {
    return <LabelPill group="demoStatus" value={(row as DemoRow).status} />;
  }
  if (kind === "quote") {
    return <LabelPill group="quoteStatus" value={(row as QuoteRow).status} />;
  }
  return <LabelPill group="contactStatus" value={(row as MessageRow).status} />;
}
