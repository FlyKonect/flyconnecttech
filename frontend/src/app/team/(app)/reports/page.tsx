import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { Avatar } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { KpiTile } from "@/components/ui/kpi-tile";
import { serverApi } from "@/lib/api-server";
import { routes } from "@/lib/routes";
import type { Report } from "@/lib/team/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports & Analytics" };

const card = "rounded-[22px] border border-line-2 bg-white p-[22px]";

/**
 * Reports & Analytics (screen 31): super admins, admins and managers.
 * Every number comes from the backend's /team/reports.
 */
async function ReportsContent() {
  const report = await serverApi<Report>("/team/reports", {
    signIn: routes.teamSignIn,
  });
  const busiest = Math.max(...report.week.map((day) => day.count));
  const mostRequests = Math.max(1, ...report.projects.map((p) => p.count));

  return (
    <>
      <ul
        aria-label="This month"
        className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3.5"
      >
        {report.cards.map((item) => (
          <li key={item.label}>
            <KpiTile
              label={item.label}
              value={item.value}
              hint={item.change?.text ?? item.note ?? undefined}
              hintTone={
                item.change?.tone === "better"
                  ? "good"
                  : item.change?.tone === "worse"
                    ? "bad"
                    : undefined
              }
              className="h-full"
            />
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-stretch gap-5">
        <section
          aria-labelledby="requests-week"
          className={cn(card, "min-w-0 flex-[1.4_1_420px]")}
        >
          <h2 id="requests-week" className="text-[17px] font-bold">
            Requests this week
          </h2>
          <ol className="mt-5 grid h-[200px] grid-cols-7 items-end gap-3 max-app:gap-1.5">
            {report.week.map((day) => {
              const height = busiest ? (day.count / busiest) * 100 : 0;
              const top = busiest > 0 && day.count === busiest;
              return (
                <li
                  key={day.day}
                  className="flex h-full flex-col items-center justify-end gap-2"
                  aria-label={`${day.day}: ${day.count}`}
                >
                  <span className="text-xs font-bold">{day.count}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-full max-w-11 rounded-t-[10px] rounded-b-[4px]",
                      top ? "bg-navy" : "bg-[#C7D3EC]",
                    )}
                    style={{ height: `max(${height * 0.62}%, 6px)` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {day.day}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section
          aria-labelledby="requests-project"
          className={cn(card, "min-w-0 flex-[1_1_320px]")}
        >
          <h2 id="requests-project" className="text-[17px] font-bold">
            Requests by project
          </h2>
          {report.projects.length ? (
            <ol className="mt-4 flex flex-col gap-3.5">
              {report.projects.map((project) => (
                <li key={project.id}>
                  <p className="flex justify-between gap-3 text-[13px]">
                    <span className="min-w-0 truncate font-bold">
                      {project.name}
                    </span>
                    <span className="text-muted-foreground">
                      {project.count}
                    </span>
                  </p>
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-[7px] overflow-hidden rounded-full bg-[#EEF2F7]"
                  >
                    <span
                      className="block h-full rounded-full bg-navy"
                      style={{
                        width: `${(project.count / mostRequests) * 100}%`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No requests yet.
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="developer-performance" className={card}>
        <h2 id="developer-performance" className="text-[17px] font-bold">
          Developer performance · this month
        </h2>
        <DataTable
          caption="Developer performance this month"
          rows={report.developers}
          rowKey={(row) => row.id}
          empty="No active developers yet."
          className="mt-3 [&_table]:border-0 [&>div]:rounded-none [&>div]:border-0"
          columns={[
            {
              header: "Developer",
              primary: true,
              className: "min-w-[220px]",
              cell: (row) => (
                <span className="flex items-center gap-2.5">
                  <Avatar name={row.name} tone="tint" className="size-8" />
                  <span className="min-w-0">
                    <span className="block font-bold">{row.name}</span>
                    {row.jobTitle ? (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {row.jobTitle}
                      </span>
                    ) : null}
                  </span>
                </span>
              ),
            },
            { header: "Assigned", cell: (row) => row.assigned },
            { header: "Resolved", cell: (row) => row.resolved },
            {
              header: "Avg. first response",
              cell: (row) => row.firstResponse ?? "—",
            },
          ]}
        />
      </section>
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function ReportsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReportsContent />
    </Suspense>
  );
}
