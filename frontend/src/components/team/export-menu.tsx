"use client";

import { useSearchParams } from "next/navigation";
import { Download, FileSpreadsheet, Table2 } from "lucide-react";

import { MenuButton, RowMenuItem } from "@/components/ui/row-menu";
import { env } from "@/env";

/**
 * "Export" on the team's lists (super admins and admins): the list as
 * Excel or CSV, with the filters in the address (not the page number), so
 * the file holds every matching row. The same menu as on Reports.
 */
export function ExportMenu({
  path,
  className,
}: {
  /** The backend's export without its ending: "/team/requests/export". */
  path: string;
  className?: string;
}) {
  const params = useSearchParams();
  const query = new URLSearchParams(params.toString());
  query.delete("page");
  query.delete("size");
  const search = query.toString();
  const file = (format: string) =>
    `${env.NEXT_PUBLIC_API_URL}${path}.${format}${search ? `?${search}` : ""}`;
  const item = "gap-2.5 [&_svg]:size-4 [&_svg]:text-muted-foreground";
  return (
    <MenuButton
      label="Export"
      icon={<Download aria-hidden="true" />}
      className={className}
    >
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
    </MenuButton>
  );
}
