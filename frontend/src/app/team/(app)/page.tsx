import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import { AssignDialog } from "@/components/team/assign-dialog";
import {
  DashboardCard,
  DashboardRequestRow,
  DueSoon,
  LatestAlerts,
  RowLink,
  TeamByRole,
  TeamHero,
  WebsiteLeadsCard,
  Workload,
} from "@/components/team/dashboard-parts";
import { Button } from "@/components/ui/button";
import { KpiTile } from "@/components/ui/kpi-tile";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import { formatDuration, lastMonthName } from "@/lib/format-time";
import type { TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import type {
  DashboardRow,
  DeveloperDashboard,
  StaffDashboard,
  TeamDashboard,
} from "@/lib/team/types";

export const metadata: Metadata = { title: "Dashboard" };

const SUBLINES: Record<TeamRole, string> = {
  SUPER_ADMIN: "Everything across customers, your team and support.",
  ADMIN: "Customers, requests and your team today.",
  MANAGER: "Keep requests moving and the team balanced.",
  DEVELOPER: "Requests assigned to you, most urgent first.",
};

const pending = (n: number) => `${n} invitation${n === 1 ? "" : "s"} pending`;

/** The team dashboard for each role (screens 17 to 20, phone M5). */
async function TeamDashboardContent() {
  const me = await requireTeamMember();
  const data = await serverApi<TeamDashboard>("/team/dashboard", {
    signIn: routes.teamSignIn,
  });
  const zone = me.timezone;

  if (data.role === "DEVELOPER") {
    return <DeveloperView data={data} name={me.name} timeZone={zone} />;
  }
  return <StaffView data={data} name={me.name} timeZone={zone} />;
}

function Tiles({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5 max-app:grid-cols-2">
      {children}
    </div>
  );
}

function StaffView({
  data,
  name,
  timeZone,
}: {
  data: StaffDashboard;
  name: string;
  timeZone: string;
}) {
  const now = new Date();
  const { counts } = data;
  const average = data.firstResponse.thisMonth;
  const before = data.firstResponse.lastMonth;
  const previousMonth = lastMonthName(now, timeZone);
  const firstResponse = average === null ? "—" : formatDuration(average);
  const resolvedAll = counts.resolved + counts.closed;

  const heroButtons: Record<
    StaffDashboard["role"],
    { label: string; href: string }[]
  > = {
    SUPER_ADMIN: [
      { label: "Add user", href: routes.teamNewUser },
      { label: "Add customer", href: routes.teamNewCustomer },
    ],
    ADMIN: [
      { label: "Add customer", href: routes.teamNewCustomer },
      { label: "Add user", href: routes.teamNewUser },
    ],
    MANAGER: [
      {
        label: "Assign requests",
        href: `${routes.teamRequests}?assignee=unassigned`,
      },
      { label: "Reports", href: routes.teamReports },
    ],
  };

  let tiles: React.ReactNode;
  if (data.role === "SUPER_ADMIN") {
    tiles = (
      <>
        <KpiTile
          label="Customers"
          value={data.customers?.total ?? 0}
          hint={pending(data.customers?.invited ?? 0)}
        />
        <KpiTile
          label="Team members"
          value={data.team?.active ?? 0}
          hint={pending(data.team?.invited ?? 0)}
        />
        <KpiTile
          label="Open requests"
          value={data.open}
          hint={`${counts.new} new`}
          tone="navy"
        />
        <KpiTile
          label="Unassigned"
          value={data.unassigned}
          hint="Waiting for a developer"
          tone="attention"
        />
        <KpiTile
          label="At risk of SLA"
          value={data.atRisk}
          hint="Due within the hour"
          tone="danger"
        />
        <KpiTile
          label="Avg. first response"
          value={firstResponse}
          hint="This month"
        />
      </>
    );
  } else if (data.role === "ADMIN") {
    tiles = (
      <>
        <KpiTile
          label="Customers"
          value={data.customers?.total ?? 0}
          hint={pending(data.customers?.invited ?? 0)}
        />
        <KpiTile
          label="New requests"
          value={counts.new}
          hint="Not yet reviewed"
          tone="navy"
        />
        <KpiTile label="Open requests" value={data.open} />
        <KpiTile label="In progress" value={counts.inProgress} tone="info" />
        <KpiTile
          label="Waiting for customers"
          value={counts.waiting}
          tone="attention"
        />
        <KpiTile
          label="Resolved"
          value={resolvedAll}
          hint="Resolved and closed"
          tone="success"
        />
      </>
    );
  } else {
    const change = data.resolvedThisMonth - data.resolvedLastMonth;
    let speed: string | undefined;
    if (average !== null && before) {
      const percent = Math.round(((before - average) / before) * 100);
      speed =
        percent === 0
          ? `Same as ${previousMonth}`
          : `${Math.abs(percent)}% ${percent > 0 ? "faster" : "slower"}`;
    }
    tiles = (
      <>
        <KpiTile label="Open requests" value={data.open} tone="navy" />
        <KpiTile
          label="Unassigned"
          value={data.unassigned}
          hint="Need a developer"
          tone="attention"
        />
        <KpiTile
          label="At risk of SLA"
          value={data.atRisk}
          hint="Due within the hour"
          tone="danger"
        />
        <KpiTile label="Waiting for customers" value={counts.waiting} />
        <KpiTile
          label="Resolved this month"
          value={data.resolvedThisMonth}
          hint={
            data.resolvedLastMonth
              ? `${change >= 0 ? "+" : "−"}${Math.abs(change)} vs ${previousMonth}`
              : undefined
          }
          tone="success"
        />
        <KpiTile
          label="Avg. first response"
          value={firstResponse}
          hint={speed}
        />
      </>
    );
  }

  const manager = data.role === "MANAGER";
  const rows: DashboardRow[] = manager
    ? data.unassignedRequests
    : data.newRequests;

  return (
    <>
      <TeamHero
        name={name}
        role={data.role}
        timeZone={timeZone}
        subline={SUBLINES[data.role]}
      >
        {heroButtons[data.role].map((button, index) => (
          <Button
            key={button.label}
            asChild
            size="lg"
            variant={index === 0 ? "gold" : "ghostOnNavy"}
          >
            <Link href={button.href}>{button.label}</Link>
          </Button>
        ))}
      </TeamHero>

      <Tiles>{tiles}</Tiles>

      <WebsiteLeadsCard />

      <div className="flex flex-wrap items-start gap-5">
        <DashboardCard
          title={manager ? "Unassigned requests" : "New requests to review"}
          link={{ href: routes.teamRequests, label: "All requests" }}
          className="flex-[1.5_1_460px]"
        >
          {rows.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              {manager
                ? "Every open request has a developer."
                : "All new requests have been reviewed."}
            </p>
          ) : (
            <ul>
              {rows.map((row) => (
                <DashboardRequestRow
                  key={row.code}
                  row={row}
                  timeZone={timeZone}
                  action={
                    manager ? (
                      <AssignDialog
                        code={row.code}
                        title={row.title}
                        developers={data.workload}
                      >
                        <Button
                          className="h-10 px-4 text-[13px]"
                          aria-label={`Assign ${row.code}`}
                        >
                          Assign
                        </Button>
                      </AssignDialog>
                    ) : (
                      <RowLink code={row.code} label="Review" />
                    )
                  }
                />
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard
          title={
            data.role === "SUPER_ADMIN" && data.team
              ? "Team by role"
              : "Team workload"
          }
          className="flex-[1_1_300px]"
        >
          {data.role === "SUPER_ADMIN" && data.team ? (
            <TeamByRole byRole={data.team.byRole} />
          ) : (
            <Workload developers={data.workload} />
          )}
        </DashboardCard>
      </div>

      <LatestAlerts alerts={data.alerts} timeZone={timeZone} />
    </>
  );
}

function DeveloperView({
  data,
  name,
  timeZone,
}: {
  data: DeveloperDashboard;
  name: string;
  timeZone: string;
}) {
  const { counts } = data;
  return (
    <>
      <TeamHero
        name={name}
        role="DEVELOPER"
        timeZone={timeZone}
        subline={SUBLINES.DEVELOPER}
      >
        <Button asChild size="lg" variant="gold">
          <Link href={routes.teamRequests}>Open my requests</Link>
        </Button>
      </TeamHero>

      <Tiles>
        <KpiTile
          label="Assigned to me"
          value={data.open}
          hint="Open requests"
          tone="navy"
        />
        <KpiTile label="In progress" value={counts.inProgress} tone="info" />
        <KpiTile
          label="Under review"
          value={counts.underReview}
          hint="Not started yet"
        />
        <KpiTile
          label="Waiting for customers"
          value={counts.waiting}
          tone="attention"
        />
        <KpiTile
          label="Resolved by me"
          value={counts.resolved + counts.closed}
          hint="Resolved and closed"
          tone="success"
        />
      </Tiles>

      <div className="flex flex-wrap items-start gap-5">
        <DashboardCard
          title="My queue"
          link={{ href: routes.teamRequests, label: "All my requests" }}
          className="flex-[1.5_1_460px]"
        >
          {data.queue.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              Nothing assigned to you right now.
            </p>
          ) : (
            <ul>
              {data.queue.map((row) => (
                <DashboardRequestRow
                  key={row.code}
                  row={row}
                  timeZone={timeZone}
                  action={<RowLink code={row.code} label="Open" />}
                />
              ))}
            </ul>
          )}
        </DashboardCard>
        <DashboardCard title="Due soon" className="flex-[1_1_300px]">
          <DueSoon rows={data.dueSoon} timeZone={timeZone} />
        </DashboardCard>
      </div>

      <LatestAlerts alerts={data.alerts} timeZone={timeZone} />
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamDashboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamDashboardContent />
    </Suspense>
  );
}
