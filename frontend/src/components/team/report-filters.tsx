"use client";

import Link from "next/link";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Table2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DateInput, Select } from "@/components/ui/field";
import {
  MenuButton,
  MenuSeparator,
  RowMenuItem,
} from "@/components/ui/row-menu";
import { env } from "@/env";
import { routes } from "@/lib/routes";
import type { Report } from "@/lib/team/types";

type Chosen = { from: string; to: string; customer: string; developer: string };

/**
 * The choices above the report: a date range, one customer, one developer,
 * and Apply. A plain form: Apply opens the same page with them in the
 * address, so a report can be bookmarked or shared. "This month" clears
 * them. Downloads and Print are in the Export menu beside the title.
 */
export function ReportFilters({
  report,
  chosen,
}: {
  report: Report;
  chosen: Chosen;
}) {
  const any = chosen.from || chosen.to || chosen.customer || chosen.developer;
  const label = "flex min-w-0 flex-col gap-1.5 text-[13px] font-bold";
  return (
    <form
      method="get"
      action={routes.teamReports}
      aria-label="Report choices"
      className="grid grid-cols-[repeat(2,minmax(0,1fr))_minmax(0,1.3fr)_minmax(0,1.3fr)_auto] items-end gap-3 rounded-[22px] border border-line-2 bg-white p-4 max-[1100px]:grid-cols-2 max-app:grid-cols-1 print:hidden"
    >
      <label className={label}>
        From
        <DateInput name="from" defaultValue={chosen.from} />
      </label>
      <label className={label}>
        To
        <DateInput name="to" defaultValue={chosen.to} />
      </label>
      <label className={label}>
        Customer
        <Select name="customer" defaultValue={chosen.customer}>
          <option value="">All customers</option>
          {report.filters.customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.company}
            </option>
          ))}
        </Select>
      </label>
      <label className={label}>
        Developer
        <Select name="developer" defaultValue={chosen.developer}>
          <option value="">All developers</option>
          {report.filters.developers.map((developer) => (
            <option key={developer.id} value={developer.id}>
              {developer.name}
            </option>
          ))}
        </Select>
      </label>
      <div className="flex items-center gap-3 max-[1100px]:col-span-2 max-app:col-span-1">
        <Button type="submit" className="h-[46px] px-6 max-[1100px]:flex-1">
          Apply
        </Button>
        {any ? (
          <Link
            href={routes.teamReports}
            className="inline-flex min-h-11 items-center text-sm font-bold whitespace-nowrap text-gold-text hover:underline"
          >
            This month
          </Link>
        ) : null}
      </div>
    </form>
  );
}

/**
 * "Export": the report as PDF, Excel or CSV (for the same choices), or
 * printed (the menus are left out of the printout).
 */
export function ReportExport({ chosen }: { chosen: Chosen }) {
  // The files use the same choices as the report on screen.
  const query = new URLSearchParams(
    Object.entries(chosen).filter(([, value]) => value),
  ).toString();
  const file = (format: string) =>
    `${env.NEXT_PUBLIC_API_URL}/team/reports/export.${format}${query ? `?${query}` : ""}`;
  const item = "gap-2.5 [&_svg]:size-4 [&_svg]:text-muted-foreground";
  return (
    <MenuButton
      label="Export"
      icon={<Download aria-hidden="true" />}
      className="print:hidden"
    >
      <RowMenuItem asChild className={item}>
        <a href={file("pdf")} download>
          <FileText aria-hidden="true" />
          Download PDF
        </a>
      </RowMenuItem>
      <RowMenuItem asChild className={item}>
        <a href={file("xlsx")} download>
          <FileSpreadsheet aria-hidden="true" />
          Download Excel
        </a>
      </RowMenuItem>
      <RowMenuItem asChild className={item}>
        <a href={file("csv")} download>
          <Table2 aria-hidden="true" />
          Download CSV
        </a>
      </RowMenuItem>
      <MenuSeparator />
      <RowMenuItem className={item} onSelect={() => window.print()}>
        <Printer aria-hidden="true" />
        Print
      </RowMenuItem>
    </MenuButton>
  );
}
