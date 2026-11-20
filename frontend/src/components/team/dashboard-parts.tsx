import Link from "next/link";

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
    <section className="flex flex-wrap items-center justify-between gap-[18px] rounded-3xl bg-[radial-gradient(90%_140%_at_88%_0%,#0C3584_0%,#021A54_55%,#01123D_100%)] p-[clamp(20px,3vw,28px)] text-white">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2.5 text-[13px] font-bold text-on-navy-muted">
          {formatLongDate(now, timeZone)}
          <Pill
            tone={roles[role].tone}
            className="shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
          >
            {roles[role].label}
          </Pill>
        </p>
        <h1 className="mt-2 font-heading text-[clamp(24px,2.8vw,32px)] leading-[1.15] font-bold tracking-[-0.03em]">
          {greeting(now, timeZone)}, {name.trim().split(/\s+/)[0]}
        </h1>
        <p className="mt-1.5 text-[15px] text-on-navy">{subline}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </section>
  );
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
