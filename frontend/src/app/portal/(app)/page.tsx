import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageLoading } from "@/components/shell/page-loading";
import { Button, TextLink } from "@/components/ui/button";
import {
  DashboardHero,
  StatusBreakdown,
} from "@/components/team/dashboard-parts";
import { KpiTile } from "@/components/ui/kpi-tile";
import { LabelPill } from "@/components/ui/pill";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import {
  formatLongDate,
  formatShortWhen,
  formatWhen,
  greeting,
} from "@/lib/format-time";
import { notificationDots } from "@/lib/labels";
import type {
  NotificationList,
  PortalProject,
  PortalSummary,
  RequestList,
} from "@/lib/portal/types";
import { ProgressBar } from "@/components/ui/progress-bar";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Overview" };

/** The customer's Overview (screen 06, phone M2). */
async function PortalOverviewPageContent() {
  const me = await requireCustomer();
  const [summary, recent, activity, projects] = await Promise.all([
    serverApi<PortalSummary>("/portal/summary"),
    serverApi<RequestList>("/portal/requests?limit=5"),
    serverApi<NotificationList>("/notifications?limit=5"),
    serverApi<PortalProject[]>("/portal/projects"),
  ]);
  const zone = me.timezone;
  const now = new Date();
  const counts = summary.requests;
  const firstName = me.name.trim().split(/\s+/)[0];

  return (
    <>
      <DashboardHero
        date={formatLongDate(now, zone)}
        title={`${greeting(now, zone)}, ${firstName}`}
        subline={
          <>
            {counts.waiting === 0
              ? "No requests need your response."
              : `${counts.waiting} request${counts.waiting > 1 ? "s are" : " is"} waiting for your response.`}{" "}
            <Link
              href={routes.contact}
              className="font-bold text-gold-text hover:underline"
            >
              Planning a new project? Request a quote →
            </Link>
          </>
        }
      >
        <Button asChild size="lg">
          <Link href={routes.portalNewRequest}>Create support request</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={routes.portalRequests}>View my requests</Link>
        </Button>
      </DashboardHero>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5 max-app:grid-cols-2">
        <KpiTile label="Total requests" value={counts.total} />
        <KpiTile label="Open requests" value={counts.open} />
        <KpiTile label="In progress" value={counts.inProgress} tone="info" />
        <KpiTile
          label="Waiting for you"
          value={counts.waiting}
          tone="warning"
        />
        <KpiTile label="Resolved" value={counts.resolved} tone="success" />
      </div>

      <div className="grid items-start gap-5 min-[1180px]:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <section
          aria-labelledby="recent-requests"
          className="min-w-0 rounded-[22px] border border-line-2 bg-white p-[22px] shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-requests" className="text-[17px] font-bold">
              Recent requests
            </h2>
            <TextLink href={routes.portalRequests} className="font-bold">
              View all
            </TextLink>
          </div>
          {recent.rows.length === 0 ? (
            <p className="mt-2.5 border-t border-line-3 pt-4 text-sm text-muted-foreground">
              No requests yet.
            </p>
          ) : (
            <ul className="mt-2.5 flex flex-col">
              {recent.rows.map((request) => (
                <li key={request.code}>
                  <Link
                    href={routes.portalRequest(request.code)}
                    className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-line-3 px-1 py-3.5 hover:bg-[#F9FBFE]"
                  >
                    <span className="min-w-0 flex-[1_1_240px]">
                      <span className="block text-xs font-bold text-muted-foreground">
                        {request.code} · {request.project.name}
                      </span>
                      <span className="mt-[3px] block text-[15px] font-bold">
                        {request.title}
                      </span>
                    </span>
                    <LabelPill group="requestStatus" value={request.status} />
                    <span className="text-[13px] text-muted-foreground">
                      {formatWhen(request.updatedAt, zone, now)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex min-w-0 flex-col gap-5">
          {projects.length ? (
            <section
              aria-labelledby="my-projects"
              className="min-w-0 rounded-[22px] border border-line-2 bg-white p-[22px] shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="my-projects" className="text-[17px] font-bold">
                  My projects
                </h2>
                <TextLink href={routes.portalProjects} className="font-bold">
                  View all
                </TextLink>
              </div>
              <ul className="mt-3 flex flex-col gap-3.5">
                {projects.slice(0, 4).map((project) => (
                  <li key={project.id}>
                    <Link
                      href={routes.portalProject(project.code)}
                      className="block rounded-xl hover:bg-[#F9FBFE]"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="min-w-0 truncate text-sm font-bold">
                          {project.name}
                        </span>
                        {project.modules.inReview ? (
                          <LabelPill
                            group="moduleFlag"
                            value="REVIEW_WAITING"
                          />
                        ) : (
                          <LabelPill
                            group="projectStatus"
                            value={project.status}
                          />
                        )}
                      </span>
                      <ProgressBar
                        progress={project.progress}
                        label={project.name}
                        className="mt-1.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <StatusBreakdown
            title="My requests by status"
            slices={[
              {
                label: "In progress",
                value: counts.inProgress,
                colour: "#2563EB",
              },
              {
                label: "Waiting for you",
                value: counts.waiting,
                colour: "#EA580C",
              },
              {
                label: "Sent, not started yet",
                value: Math.max(
                  0,
                  counts.open - counts.inProgress - counts.waiting,
                ),
                colour: "#0C3584",
              },
              {
                label: "Resolved or closed",
                value: Math.max(0, counts.total - counts.open),
                colour: "#16A34A",
              },
            ]}
          />
          <section
            aria-labelledby="recent-activity"
            className="min-w-0 rounded-[22px] border border-line-2 bg-white p-[22px] shadow-[0_1px_2px_rgba(2,26,84,0.04)]"
          >
            <h2 id="recent-activity" className="text-[17px] font-bold">
              Recent activity
            </h2>
            {activity.items.length === 0 ? (
              <p className="mt-3.5 text-sm text-muted-foreground">
                Nothing new yet.
              </p>
            ) : (
              <ul className="mt-3.5 flex flex-col gap-4">
                {activity.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex gap-3 hover:underline"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[5px] size-2.5 shrink-0 rounded-full"
                        style={{ background: notificationDots[item.kind] }}
                      />
                      <span>
                        <span className="block text-sm leading-[1.45] font-semibold">
                          {item.text}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatShortWhen(item.createdAt, zone, now)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalOverviewPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalOverviewPageContent />
    </Suspense>
  );
}
