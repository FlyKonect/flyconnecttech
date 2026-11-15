import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

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
  className?: string;
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
  className,
}: DataTableProps<Row>) {
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

  return (
    <div data-slot="data-table" className={className}>
      {/* Wide screens: a real table. */}
      <div className="overflow-x-auto rounded-[22px] border border-line-2 bg-white max-app:hidden">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-[#F6F8FC]">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className="px-5 py-3.5 text-xs font-bold tracking-[0.02em] whitespace-nowrap text-muted-foreground uppercase"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "border-t border-line-3",
                  rowHref && "relative hover:bg-[#F9FBFE]",
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn(
                      "px-5 py-4 align-middle",
                      column === primary && "font-bold",
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

      {/* Phones: one card per row, or the rows drawn by `card`. */}
      {card ? (
        <ul
          aria-label={caption}
          className="overflow-hidden rounded-[22px] border border-line-2 bg-white app:hidden"
        >
          {rows.map((row) => (
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
          {rows.map((row) => (
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
    </div>
  );
}

export { DataTable };
