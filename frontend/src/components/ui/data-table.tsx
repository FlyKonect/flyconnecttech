"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const PAGE_SIZES = [10, 25, 50, 100];

/**
 * A table on wide screens that becomes a list of cards on phones
 * (below 900px), as the phone screenshots show.
 *
 *   <DataTable
 *     caption="Support requests"
 *     rows={requests}
 *     rowKey={(request) => request.code}
 *     columns={[
 *       { header: "Request", cell: (r) => r.code, primary: true },
 *       { header: "Status", cell: (r) => <LabelPill group="requestStatus" value={r.status} /> },
 *     ]}
 *   />
 *
 * On phones each row is a card: the `primary` column is the card's heading
 * and every other column is shown as "Header: value". Pass `card` to draw
 * the phone row yourself instead.
 *
 * With `rowHref`, a whole row (or phone card) opens that page. The primary
 * cell holds the link, so keyboards and screen readers find one link a row.
 */

export type DataTableColumn<Row> = {
  header: string;
  cell: (row: Row) => React.ReactNode;
  /** The card's heading on phones, and the link when rows open a page. Mark one column. */
  primary?: boolean;
  /** Extra classes for this column's cells on wide screens (for example a width). */
  className?: string;
};

type DataTableProps<Row> = {
  /** Names the table for screen readers. Not shown. */
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** The page a row opens. */
  rowHref?: (row: Row) => string;
  /** The link's name for screen readers, when the primary cell alone is not enough. */
  rowLabel?: (row: Row) => string;
  /** Draws a row on phones. All rows then share one white card. */
  card?: (row: Row) => React.ReactNode;
  /** Shown when there are no rows. */
  empty?: React.ReactNode;
  /** Rows per page to start with (the person can change it). Default 25. */
  pageSize?: number;
  /**
   * When the backend sends one page at a time: `rows` is that page, and the
   * page buttons are links made by `href` (page 1 for a new page size).
   */
  serverPaging?: ServerPaging;
  className?: string;
};

export type ServerPaging = {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number, pageSize: number) => string;
};

function DataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  rowHref,
  rowLabel,
  card,
  empty = "Nothing to show yet.",
  pageSize: firstPageSize = 25,
  serverPaging,
  className,
}: DataTableProps<Row>) {
  const router = useRouter();
  const [localSize, setLocalSize] = React.useState(firstPageSize);
  const [localPage, setLocalPage] = React.useState(1);

  // A different list (a new filter or search) starts again on page 1.
  // The same list refreshed after an action keeps its page.
  const listKey = rows.map(rowKey).join("|");
  const [shownKey, setShownKey] = React.useState(listKey);
  if (listKey !== shownKey) {
    setShownKey(listKey);
    setLocalPage(1);
  }

  const total = serverPaging ? serverPaging.total : rows.length;
  const pageSize = serverPaging ? serverPaging.pageSize : localSize;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(serverPaging ? serverPaging.page : localPage, pages);
  const start = (current - 1) * pageSize;
  const pageRows = serverPaging ? rows : rows.slice(start, start + pageSize);

  if (rows.length === 0) {
    return (
      <div
        data-slot="data-table"
        className={cn(
          "rounded-[22px] border border-line-2 bg-white px-5 py-8 text-center text-muted-foreground",
          className,
        )}
      >
        {empty}
      </div>
    );
  }

  const primary = columns.find((column) => column.primary) ?? columns[0];
  const others = columns.filter((column) => column !== primary);

  const primaryCell = (row: Row) =>
    rowHref ? (
      <Link
        href={rowHref(row)}
        aria-label={rowLabel?.(row)}
        // The link stretches over the whole row.
        className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-sm focus-visible:after:ring-2 focus-visible:after:ring-gold focus-visible:after:ring-inset"
      >
        {primary.cell(row)}
      </Link>
    ) : (
      primary.cell(row)
    );

  const footer = (
    <Pagination
      label={caption}
      total={total}
      start={start}
      shown={pageRows.length}
      page={current}
      pages={pages}
      pageSize={pageSize}
      onPage={(page) =>
        serverPaging
          ? router.push(serverPaging.href(page, pageSize))
          : setLocalPage(page)
      }
      onPageSize={(size) => {
        if (serverPaging) {
          router.push(serverPaging.href(1, size));
          return;
        }
        setLocalSize(size);
        setLocalPage(1);
      }}
    />
  );

  return (
    <div data-slot="data-table" className={className}>
      {/* Wide screens: a real table. */}
      <div className="overflow-hidden rounded-[22px] border border-line-2 bg-white shadow-[0_1px_2px_rgba(2,26,84,0.04)] max-app:hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line-2 bg-[#F6F8FC]">
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className="px-5 py-3 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "border-t border-line-3 transition-colors first:border-t-0 hover:bg-[#F7F9FD]",
                    rowHref && "relative",
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={cn(
                        "px-5 py-3.5 align-middle",
                        column === primary && "font-bold text-navy",
                        column.className,
                      )}
                    >
                      {column === primary ? primaryCell(row) : column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line-2 bg-[#FBFCFE] px-5 py-3">
          {footer}
        </div>
      </div>

      {/* Phones: one card per row, or the rows drawn by `card`. */}
      {card ? (
        <ul
          aria-label={caption}
          className="overflow-hidden rounded-[22px] border border-line-2 bg-white app:hidden"
        >
          {pageRows.map((row) => (
            <li
              key={rowKey(row)}
              className="relative border-t border-line-3 first:border-t-0"
            >
              {rowHref ? (
                <Link
                  href={rowHref(row)}
                  aria-label={rowLabel?.(row)}
                  className="block p-4 hover:bg-[#F9FBFE]"
                >
                  {card(row)}
                </Link>
              ) : (
                <div className="p-4">{card(row)}</div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul aria-label={caption} className="flex flex-col gap-3 app:hidden">
          {pageRows.map((row) => (
            <li
              key={rowKey(row)}
              className="relative rounded-[20px] border border-line-2 bg-white p-4"
            >
              <div className="text-[15px] font-bold">{primaryCell(row)}</div>
              <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm">
                {others.map((column) => (
                  <React.Fragment key={column.header}>
                    <dt className="text-xs font-bold text-muted-foreground">
                      {column.header}
                    </dt>
                    <dd className="min-w-0">{column.cell(row)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 ? <div className="mt-3 app:hidden">{footer}</div> : null}
    </div>
  );
}

/**
 * Under a table: "Showing 26–50 of 132", rows per page, and the page
 * buttons (Previous, 1 … 4 5 6 … 9, Next). The buttons show only when
 * there is more than one page.
 */
function Pagination({
  label,
  total,
  start,
  shown,
  page,
  pages,
  pageSize,
  onPage,
  onPageSize,
}: {
  label: string;
  total: number;
  start: number;
  shown: number;
  page: number;
  pages: number;
  pageSize: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}) {
  const sizeId = React.useId();
  const button =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-[10px] px-2.5 text-sm font-semibold text-navy transition-colors hover:bg-soft disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2.5 text-[13px] text-muted-foreground">
      <p aria-live="polite">
        Showing{" "}
        <strong className="font-bold text-navy">
          {start + 1}–{start + shown}
        </strong>{" "}
        of <strong className="font-bold text-navy">{total}</strong>
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label
          htmlFor={sizeId}
          className="flex items-center gap-2 max-app:hidden"
        >
          Rows per page
          <select
            id={sizeId}
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
            className="h-9 cursor-pointer rounded-[10px] border border-input bg-white px-2 text-sm font-semibold text-navy"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        {pages > 1 ? (
          <nav
            aria-label={`${label} pages`}
            className="flex items-center gap-1"
          >
            <button
              type="button"
              onClick={() => onPage(page - 1)}
              disabled={page === 1}
              className={button}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              <span className="max-app:sr-only">Previous</span>
            </button>
            {pageList(page, pages).map((item, index) =>
              item === "…" ? (
                <span
                  key={`gap-${index}`}
                  aria-hidden="true"
                  className="px-1 text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPage(item)}
                  aria-label={`Page ${item}`}
                  aria-current={item === page ? "page" : undefined}
                  className={cn(
                    button,
                    "aria-[current=page]:bg-navy aria-[current=page]:text-white aria-[current=page]:hover:bg-navy",
                  )}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPage(page + 1)}
              disabled={page === pages}
              className={button}
            >
              <span className="max-app:sr-only">Next</span>
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}

/** The page numbers to show: the first, the last, and two either side of this one. */
export function pageList(page: number, pages: number): (number | "…")[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => wanted.add(n));
  if (page >= pages - 2)
    [pages - 3, pages - 2, pages - 1].forEach((n) => wanted.add(n));
  const numbers = [...wanted]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);
  const list: (number | "…")[] = [];
  numbers.forEach((n, index) => {
    if (index > 0 && n - numbers[index - 1] > 1) list.push("…");
    list.push(n);
  });
  return list;
}

export { DataTable };
