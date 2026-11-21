"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DateInput, Select } from "@/components/ui/field";
import { formatWhen } from "@/lib/format-time";
import { withPage } from "@/lib/paging";
import { routes } from "@/lib/routes";

export type ActivityRow = {
  id: string;
  at: string;
  who: string;
  did: string;
  subject: string;
};

export type ActivityLogView = {
  total: number;
  page: number;
  pageSize: number;
  groups: string[];
  people: { id: string; name: string }[];
  rows: ActivityRow[];
};

const GROUP_WORDS: Record<string, string> = {
  accounts: "Accounts and roles",
  customers: "Customers and projects",
  requests: "Support requests",
  exports: "CSV downloads",
  settings: "Settings and website",
};

/**
 * The Activity log (super admins): who changed what, newest first. The
 * choices are a plain form, so the address holds them (and a link to a
 * filtered log can be shared).
 */
export function ActivityLog({
  view,
  chosen,
  timeZone,
}: {
  view: ActivityLogView;
  chosen: { what: string; person: string; from: string; to: string };
  timeZone: string;
}) {
  const query = new URLSearchParams(
    Object.entries(chosen).filter(([, value]) => value),
  ).toString();
  const href = `${routes.teamActivityLog}${query ? `?${query}` : ""}`;
  const any = Object.values(chosen).some(Boolean);
  const label = "flex min-w-0 flex-col gap-1.5 text-[13px] font-bold";
  return (
    <>
      <form
        method="get"
        action={routes.teamActivityLog}
        aria-label="Activity choices"
        className="flex flex-wrap items-end gap-3 rounded-[22px] border border-line-2 bg-white p-4"
      >
        <label className={`${label} flex-[1_1_200px]`}>
          What
          <Select name="what" defaultValue={chosen.what}>
            <option value="">Everything</option>
            {view.groups.map((group) => (
              <option key={group} value={group}>
                {GROUP_WORDS[group] ?? group}
              </option>
            ))}
          </Select>
        </label>
        <label className={`${label} flex-[1_1_180px]`}>
          Who
          <Select name="person" defaultValue={chosen.person}>
            <option value="">Anyone</option>
            {view.people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </Select>
        </label>
        <label className={`${label} flex-[1_1_150px]`}>
          From
          <DateInput name="from" defaultValue={chosen.from} />
        </label>
        <label className={`${label} flex-[1_1_150px]`}>
          To
          <DateInput name="to" defaultValue={chosen.to} />
        </label>
        <div className="flex gap-2">
          <Button type="submit" className="h-[46px]">
            Apply
          </Button>
          {any ? (
            <Button asChild variant="outline" className="h-[46px]">
              <Link href={routes.teamActivityLog}>Clear</Link>
            </Button>
          ) : null}
        </div>
      </form>

      <DataTable<ActivityRow>
        caption="Activity log"
        rows={view.rows}
        rowKey={(row) => row.id}
        empty="Nothing recorded for these choices."
        serverPaging={{
          page: view.page,
          pageSize: view.pageSize,
          total: view.total,
          href: (page, size) => withPage(href, page, size),
        }}
        columns={[
          {
            header: "When",
            cell: (row) => formatWhen(row.at, timeZone),
            className: "whitespace-nowrap",
          },
          { header: "Who", cell: (row) => row.who, primary: true },
          {
            header: "What",
            cell: (row) => (
              <span>
                {row.did}
                {row.subject ? (
                  <span className="font-semibold break-all text-navy">
                    {" "}
                    {row.subject}
                  </span>
                ) : null}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}
