import Link from "next/link";
import { CalendarDays, LayoutDashboard } from "lucide-react";

import { NotificationRow } from "@/components/ui/notification-row";
import { LabelPill, Pill } from "@/components/ui/pill";
import { SlaPill } from "@/components/ui/sla-pill";
import { formatLongDate, formatShortWhen, greeting } from "@/lib/format-time";
import { roles, type TeamRole } from "@/lib/labels";
import type { NotificationItem } from "@/lib/portal/types";
import { routes } from "@/lib/routes";
import { demoShort } from "@/lib/team/leads";
import type { DashboardRow, Developer, LeadsCard } from "@/lib/team/types";
import { cn } from "@/lib/utils";

/**
 * The pieces of the team dashboards (screens 17 to 20, phone M5). Each role's
 * dashboard puts them together in app/team/(app)/page.tsx.
 */

/** The navy welcome card: date, role, greeting, a line and the buttons. */
export function TeamHero({
  name,
  role,
  timeZone,
  subline,
  children,
}: {
  name: string;
  role: TeamRole;
  timeZone: string;
  subline: string;
  /** The buttons; the first one is gold. */
  children: React.ReactNode;
}) {
  const now = new Date();
  return (
    <DashboardHero
      date={formatLongDate(now, timeZone)}
      badge={<Pill tone={roles[role].tone}>{roles[role].label}</Pill>}
      title={`${greeting(now, timeZone)}, ${name.trim().split(/\s+/)[0]}`}
      subline={subline}
    >
      {children}
    </DashboardHero>
  );
}

/**
 * The top of an overview page (team and client portal): a compact white
 * card with the date, a badge, the greeting, one line, and the buttons.
 */
export function DashboardHero({
  date,
  badge,
  title,
  subline,
  children,
}: {
  date: string;
  badge?: React.ReactNode;
  title: string;
  subline: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-[22px] border border-line-2 bg-white p-[clamp(18px,2.5vw,26px)] shadow-[0_1px_2px_rgba(2,26,84,0.04)]">
      {/* A thin navy-to-gold line along the top edge. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#021A54_0%,#0C3584_60%,#D4AF37_100%)]"
      />
      <div className="flex min-w-0 items-center gap-4">
        <span
          aria-hidden="true"
          className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-gold sm:inline-flex"
        >
          <LayoutDashboard className="size-[22px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-muted-foreground">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {date}
            {badge}
          </p>
          <h1 className="mt-1 font-heading text-[clamp(22px,2.4vw,28px)] leading-[1.15] font-bold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">{subline}</p>
        </div>
      </div>
      {children ? (
        <div className="flex flex-wrap gap-2.5">{children}</div>
      ) : null}
    </section>
  );
}

/** One status in "Requests by status". */
export type StatusSlice = {
  label: string;
  value: number;
  colour: string;
  href?: string;
};

/**
 * "Requests by status": one bar split by status, then each status with its
 * number and share. A status with a link opens the list filtered to it.
 */
export function StatusBreakdown({
  slices,
  title = "Requests by status",
}: {
  slices: StatusSlice[];
  title?: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <DashboardCard title={title}>
      {total === 0 ? (
        <p className="mt-3 text-muted-foreground">No requests yet.</p>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="mt-4 flex h-3 overflow-hidden rounded-full bg-soft"
          >
            {slices
              .filter((slice) => slice.value > 0)
              .map((slice) => (
                <span
                  key={slice.label}
                  className="h-full border-r-2 border-white last:border-r-0"
                  style={{
                    width: `${(slice.value / total) * 100}%`,
                    background: slice.colour,
                  }}
                />
              ))}
          </div>
          <ul className="mt-4 flex flex-col">
            {slices.map((slice) => {
              const line = (
                <>
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: slice.colour }}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-body">
                    {slice.label}
                  </span>
                  <span className="text-sm font-bold text-navy">
                    {slice.value}
                  </span>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {Math.round((slice.value / total) * 100)}%
                  </span>
                </>
              );
              return (
                <li
                  key={slice.label}
                  className="border-t border-line-3 first:border-t-0"
                >
                  {slice.href ? (
                    <Link
                      href={slice.href}
                      className="flex min-h-10 items-center gap-2.5 rounded-lg px-1.5 hover:bg-soft"
                    >
                      {line}
                    </Link>
                  ) : (
                    <span className="flex min-h-10 items-center gap-2.5 px-1.5">
                      {line}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </DashboardCard>
  );
}

/** The team's status slices from the request counts, each opening the list. */
export function teamStatusSlices(counts: {
  new: number;
  underReview: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
}): StatusSlice[] {
  const to = (status: string) => `${routes.teamRequests}?status=${status}`;
  return [
    {
      label: "New",
      value: counts.new,
      colour: "#0C3584",
      href: to("submitted"),
    },
    {
      label: "Under review",
      value: counts.underReview,
      colour: "#CA8A04",
      href: to("under-review"),
    },
    {
      label: "In progress",
      value: counts.inProgress,
      colour: "#2563EB",
      href: to("in-progress"),
    },
    {
      label: "Waiting for customer",
      value: counts.waiting,
      colour: "#EA580C",
      href: to("waiting-for-customer"),
    },
    {
      label: "Resolved",
      value: counts.resolved,
      colour: "#16A34A",
      href: to("resolved"),
    },
    {
      label: "Closed",
      value: counts.closed,
      colour: "#94A3B8",
      href: to("closed"),
    },
  ];
}

/** A white card with a title row (and an optional link on the right). */
export function DashboardCard({
  title,
  link,
  className,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  const id = `card-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "min-w-0 rounded-[22px] border border-line-2 bg-white p-[22px] shadow-[0_1px_2px_rgba(2,26,84,0.04)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="text-[17px] font-bold">
          {title}
        </h2>
        {link ? (
          <Link
            href={link.href}
            className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
          >
            {link.label} →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/**
 * A request in a dashboard list: code · company · project, the title, the
 * priority and SLA pills, and one button (Review, Assign or Open).
 */
export function DashboardRequestRow({
  row,
  timeZone,
  action,
}: {
  row: DashboardRow;
  timeZone: string;
  /** The button at the end of the row. */
  action: React.ReactNode;
}) {
  return (
    <li className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-2xl bg-[#F6F8FC] p-4">
      <span className="min-w-0 flex-[1_1_240px]">
        <span className="block text-xs font-bold text-muted-foreground">
          {row.code} · {row.customer.company} · {row.project.name}
        </span>
        <span className="mt-[3px] block text-[15px] font-bold">
          {row.title}
        </span>
      </span>
      <LabelPill group="priority" value={row.priority} />
      <SlaPill request={row} timeZone={timeZone} />
      {action}
    </li>
  );
}

/** The navy "Review" or "Open" button of a dashboard row. */
export function RowLink({ code, label }: { code: string; label: string }) {
  return (
    <Link
      href={routes.teamRequest(code)}
      aria-label={`${label} ${code}`}
      className="inline-flex h-10 items-center rounded-[10px] bg-navy px-4 text-[13px] font-bold text-white hover:bg-navy-700"
    >
      {label}
    </Link>
  );
}

/** Team workload: each developer's open requests as a bar. */
export function Workload({ developers }: { developers: Developer[] }) {
  if (!developers.length) {
    return (
      <p className="mt-3.5 text-sm text-muted-foreground">
        No active developers yet.
      </p>
    );
  }
  const most = Math.max(1, ...developers.map((d) => d.open));
  return (
    <ul className="mt-3.5 flex flex-col gap-3.5">
      {developers.map((developer) => (
        <li key={developer.id}>
          <div className="flex justify-between gap-2.5 text-sm">
            <span>
              <strong>{developer.name}</strong>
              {developer.jobTitle ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {developer.jobTitle}
                </span>
              ) : null}
            </span>
            <span className="whitespace-nowrap text-muted-foreground">
              {developer.open} open
            </span>
          </div>
          <div aria-hidden="true" className="mt-1.5 h-2 rounded bg-line-3">
            <div
              className="h-full rounded bg-navy"
              style={{ width: `${(developer.open / most) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Team by role: active (and invited) people per role. */
export function TeamByRole({
  byRole,
}: {
  byRole: Record<TeamRole, { active: number; invited: number }>;
}) {
  const order: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];
  return (
    <div className="mt-3.5 flex flex-col gap-2.5">
      <ul className="flex flex-col gap-2.5">
        {order.map((role) => (
          <li
            key={role}
            className="flex items-center justify-between gap-2.5 rounded-[14px] bg-[#F6F8FC] px-3.5 py-3"
          >
            <Pill tone={roles[role].tone}>{roles[role].label}</Pill>
            <span className="text-sm font-bold">
              {byRole[role].active} active
              {byRole[role].invited ? (
                <span className="font-medium text-muted-foreground">
                  {" "}
                  · {byRole[role].invited} invited
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={routes.teamUsers}
        className="inline-flex min-h-9 items-center self-start text-sm font-bold text-gold-text hover:underline"
      >
        Manage users →
      </Link>
    </div>
  );
}

/** Due soon: the developer's open requests, the earliest due first. */
export function DueSoon({
  rows,
  timeZone,
}: {
  rows: DashboardRow[];
  timeZone: string;
}) {
  if (!rows.length) {
    return (
      <p className="mt-3.5 text-sm text-muted-foreground">
        Nothing is due soon.
      </p>
    );
  }
  return (
    <ul className="mt-2">
      {rows.map((row) => (
        <li key={row.code}>
          <Link
            href={routes.teamRequest(row.code)}
            className="flex w-full items-center gap-3 border-t border-line-3 py-3 hover:bg-[#F9FBFE]"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-muted-foreground">
                {row.code} · {row.customer.company}
              </span>
              <span className="mt-0.5 block text-sm font-bold">
                {row.title}
              </span>
            </span>
            <SlaPill request={row} timeZone={timeZone} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Website leads: the four tiles (new demos, quotes, messages; booked demos). */
export function WebsiteLeadsCard({ leads }: { leads: LeadsCard | null }) {
  const estimates = leads?.estimatesAwaiting ?? 0;
  const tiles = [
    {
      label: "New demo requests",
      value: leads?.demos ?? 0,
      hint: "From Book a demo",
      href: `${routes.teamDemos}?status=new`,
    },
    {
      label: "New quote requests",
      value: leads?.quotes ?? 0,
      hint: `${estimates} ${estimates === 1 ? "estimate is" : "estimates are"} awaiting a reply`,
      href: `${routes.teamQuotes}?status=new`,
    },
    {
      label: "New messages",
      value: leads?.messages ?? 0,
      hint: "From the contact form",
      href: `${routes.teamMessages}?status=new`,
    },
    {
      label: "Demos booked",
      value: leads?.demosBooked ?? 0,
      hint: leads?.nextDemo
        ? `Next: ${demoShort(leads.nextDemo)}`
        : "Nothing booked yet",
      href: `${routes.teamDemos}?status=scheduled`,
    },
  ];
  return (
    <section
      aria-labelledby="website-leads"
      className="rounded-[22px] border border-line bg-white p-[22px]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="website-leads" className="text-[17px] font-bold">
          Website leads
        </h2>
        <span className="text-[13px] text-muted-foreground">
          From Book a demo, Get a quote and the contact form
        </span>
      </div>
      <ul className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        {tiles.map((tile) => (
          <li key={tile.label}>
            <Link
              href={tile.href}
              className="flex flex-col items-start gap-1 rounded-2xl border border-line-2 bg-[#F6F8FC] p-4 hover:border-[#C8D3E3]"
            >
              <span className="text-[13px] font-bold text-muted-foreground">
                {tile.label}
              </span>
              <span className="font-heading text-[28px] leading-tight font-bold tracking-[-0.03em]">
                {tile.value}
              </span>
              <span className="text-xs text-muted-foreground">{tile.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Latest alerts: the person's newest notifications. */
export function LatestAlerts({
  alerts,
  timeZone,
}: {
  alerts: NotificationItem[];
  timeZone: string;
}) {
  const now = new Date();
  return (
    <DashboardCard title="Latest alerts">
      {alerts.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          No alerts for your requests.
        </p>
      ) : (
        <ul className="mt-2 overflow-hidden rounded-xl [&>li:first-child>a]:border-t-0">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <NotificationRow
                kind={alert.kind}
                text={alert.text}
                time={formatShortWhen(alert.createdAt, timeZone, now)}
                href={alert.href}
                unread={!alert.read}
              />
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
