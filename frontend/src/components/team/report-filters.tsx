"use client";

import Link from "next/link";
import { FileSpreadsheet, FileText, Printer, Table2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { env } from "@/env";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { Report } from "@/lib/team/types";

/**
 * The choices above the report: a date range, one customer, one developer.
 * A plain form: Apply opens the same page with them in the address, so a
 * report can be bookmarked or shared. Print gives the monthly client report
 * (the menus are left out of the printout).
 */
export function ReportFilters({
  report,
  chosen,
}: {
  report: Report;
  chosen: { from: string; to: string; customer: string; developer: string };
}) {
  const any = chosen.from || chosen.to || chosen.customer || chosen.developer;
  // The files use the same choices as the report on screen.
  const query = new URLSearchParams(
    Object.entries(chosen).filter(([, value]) => value),
  ).toString();
  const file = (format: string) =>
    `${env.NEXT_PUBLIC_API_URL}/team/reports/export.${format}${query ? `?${query}` : ""}`;
  const download = cn(buttonVariants({ variant: "outline" }), "h-[46px]");
  const label = "flex min-w-0 flex-col gap-1.5 text-[13px] font-bold";
  return (
    <form
      method="get"
      action={routes.teamReports}
      aria-label="Report choices"
      className="flex flex-wrap items-end gap-3 rounded-[22px] border border-line-2 bg-white p-4 print:hidden"
    >
      <label className={`${label} flex-[1_1_150px]`}>
        From
        <Input type="date" name="from" defaultValue={chosen.from} />
      </label>
      <label className={`${label} flex-[1_1_150px]`}>
        To
        <Input type="date" name="to" defaultValue={chosen.to} />
      </label>
      <label className={`${label} flex-[1_1_200px]`}>
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
      <label className={`${label} flex-[1_1_180px]`}>
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
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-[46px]">
          Apply
        </Button>
        {any ? (
          <Button asChild variant="outline" className="h-[46px]">
            <Link href={routes.teamReports}>This month</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-[46px]"
          onClick={() => window.print()}
        >
          <Printer aria-hidden="true" className="size-4" />
          Print
        </Button>
      </div>
      <div
        role="group"
        aria-label="Download the report"
        className="flex flex-wrap items-center gap-2"
      >
        <span className="text-[13px] font-bold text-muted-foreground">
          Download
        </span>
        <a href={file("pdf")} download className={download}>
          <FileText aria-hidden="true" className="size-4" />
          PDF
        </a>
        <a href={file("xlsx")} download className={download}>
          <FileSpreadsheet aria-hidden="true" className="size-4" />
          Excel
        </a>
        <a href={file("csv")} download className={download}>
          <Table2 aria-hidden="true" className="size-4" />
          CSV
        </a>
      </div>
    </form>
  );
}
