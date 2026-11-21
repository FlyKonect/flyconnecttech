"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Bell,
  Building2,
  CalendarClock,
  ChartColumn,
  FileText,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
  History,
  MailWarning,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/shell/app-shell";
import { UserMenu } from "@/components/shell/user-menu";
import { roles, type TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import {
  isTeamNavItemActive,
  teamNav,
  type TeamNavCounts,
  type TeamNavItem,
  type TeamNavKey,
} from "@/lib/team-nav";

/** The team member shown in the sidebar and header. */
export type TeamUser = {
  name: string;
  jobTitle: string | null;
  role: TeamRole;
  counts: TeamNavCounts;
};

/** The title in the header, from the address. */
const titles: [prefix: string, title: string][] = [
  [routes.teamRequests, "Support Requests"],
  [routes.teamDemos, "Demo requests"],
  [routes.teamQuotes, "Quote requests"],
  [routes.teamMessages, "Messages"],
  [routes.teamWebsiteContent, "Website content"],
  [routes.teamCustomers, "Customers"],
  [routes.teamProjects, "Projects"],
  [routes.teamUsers, "Users"],
  [routes.teamReports, "Reports & Analytics"],
  [routes.teamNotifications, "Notifications"],
  [routes.teamSettings, "Settings"],
  [routes.teamFailedEmails, "Failed emails"],
  [routes.teamActivityLog, "Activity log"],
  [routes.teamProfile, "Profile settings"],
];

export function teamTitle(pathname: string): string {
  // One request: "Request TKT-2026-00124".
  const request = /^\/team\/requests\/([^/]+)\/?$/.exec(pathname);
  if (request) return `Request ${decodeURIComponent(request[1])}`;
  // One lead: "Demo request · DEM-2026-031".
  const lead = /^\/team\/leads\/(demos|quotes|messages)\/([^/]+)\/?$/.exec(
    pathname,
  );
  if (lead) {
    const kind = {
      demos: "Demo request",
      quotes: "Quote request",
      messages: "Message",
    }[lead[1] as "demos" | "quotes" | "messages"];
    return `${kind} · ${decodeURIComponent(lead[2])}`;
  }
  const path = pathname.replace(/\/$/, "");
  if (path === routes.teamNewCustomer) return "Add customer";
  if (path === routes.teamNewUser) return "Add user";
  if (path === routes.teamNewProject) return "Add project";
  // One project: "Project P-0004".
  const project = /^\/team\/projects\/([^/]+)$/.exec(path);
  if (project) return `Project ${decodeURIComponent(project[1])}`;
  // One customer. The page adds the company with <TeamPageTitle>.
  if (path.startsWith(`${routes.teamCustomers}/`)) return "Customer";
  const match = titles.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : "Dashboard";
}

type TitleOverride = { pathname: string; title: string } | null;

const TitleContext = React.createContext<(override: TitleOverride) => void>(
  () => {},
);

/**
 * Sets the header title from a page whose title needs its data, such as
 * "Customer · Bluewave Holidays". Renders nothing.
 */
export function TeamPageTitle({ title }: { title: string }) {
  const setOverride = React.use(TitleContext);
  const pathname = usePathname();
  React.useEffect(() => {
    setOverride({ pathname, title });
    return () => setOverride(null);
  }, [setOverride, pathname, title]);
  return null;
}

/** The team panel layout for the signed-in team member. */
export function TeamShell({
  user,
  children,
}: {
  user: TeamUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const status = useSearchParams().get("status");

  const roleLabel = roles[user.role].label;
  const [override, setOverride] = React.useState<TitleOverride>(null);
  // Only for the page that set it, in case another page shows first.
  const title =
    override?.pathname === pathname ? override.title : teamTitle(pathname);
  return (
    <TitleContext value={setOverride}>
      <AppShell
        tone="team"
        title={title}
        sidebarLabel="Team panel menu"
        search={{
          action: routes.teamRequests,
          label: "Search requests and customers",
          placeholder: "Search requests, customers",
        }}
        bell={{
          href: routes.teamNotifications,
          unread: (user.counts.notifications ?? 0) > 0,
        }}
        user={{
          name: user.name,
          detail: user.jobTitle ? `${roleLabel} · ${user.jobTitle}` : roleLabel,
          profileHref: routes.teamProfile,
        }}
        sidebar={(closeMenu) => (
          <>
            <div className="px-2.5 pt-1">
              <Logo eager onNavy className="h-[22px]" />
            </div>
            <div className="mx-2.5 mt-3 mb-4 flex items-center gap-2 border-b border-white/10 pb-4 text-xs">
              <span className="rounded-full bg-white/8 px-2.5 py-1 font-semibold text-on-navy">
                Team panel
              </span>
            </div>

            <nav aria-label="Team" className="flex flex-col gap-0.5">
              {teamNav(user.role).map((section, index) => (
                <React.Fragment key={section.label ?? index}>
                  {section.label ? (
                    <p className="mx-3 mt-4 mb-1.5 text-[11px] font-bold tracking-[0.1em] text-nav-label">
                      {section.label}
                    </p>
                  ) : null}
                  {section.items.map((item) => {
                    const Icon = navIcons[item.key];
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={
                          isTeamNavItemActive(item, pathname, status)
                            ? "page"
                            : undefined
                        }
                        className={navItem}
                      >
                        <Icon
                          aria-hidden="true"
                          className="size-[18px] shrink-0 text-on-navy-muted transition-colors group-hover:text-white group-aria-[current=page]:text-gold"
                          strokeWidth={1.9}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                        <NavNumber
                          item={item}
                          value={user.counts[item.key] ?? 0}
                        />
                      </Link>
                    );
                  })}
                </React.Fragment>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-3">
              <UserMenu
                area="team"
                placement="sidebar"
                name={user.name}
                detail={roleLabel}
                profileHref={routes.teamProfile}
              />
            </div>
          </>
        )}
      >
        {children}
      </AppShell>
    </TitleContext>
  );
}

/** One icon per menu item (decorative: the label names the item). */
const navIcons: Record<TeamNavKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  all: Inbox,
  new: Inbox,
  underReview: Inbox,
  inProgress: Inbox,
  waiting: Inbox,
  resolved: Inbox,
  closed: Inbox,
  demos: CalendarClock,
  quotes: FileText,
  messages: MessageSquare,
  websiteContent: Globe,
  customers: Building2,
  projects: FolderKanban,
  users: Users,
  reports: ChartColumn,
  failedEmails: MailWarning,
  activityLog: History,
  notifications: Bell,
  settings: Settings,
};

// The current page gets a light panel and a gold bar on its left edge.
const navItem =
  "group relative text-on-navy flex min-h-10 w-full items-center gap-3 rounded-[10px] px-3 text-left text-sm font-medium transition-colors hover:bg-white/6 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:font-bold aria-[current=page]:text-white before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-gold before:opacity-0 aria-[current=page]:before:opacity-100";

/** The number beside a menu item: a plain count, or a gold badge that hides at zero. */
function NavNumber({ item, value }: { item: TeamNavItem; value: number }) {
  if (item.number === "count") {
    return (
      <span className="inline-flex h-[22px] min-w-[28px] items-center justify-center rounded-full bg-white/10 px-2 text-xs font-semibold text-white">
        <span className="sr-only">, </span>
        {value}
      </span>
    );
  }

  if (item.number === "badge" && value > 0) {
    return (
      <span className="inline-flex h-[22px] min-w-[28px] items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-navy">
        <span className="sr-only">, </span>
        {value}
        <span className="sr-only"> new</span>
      </span>
    );
  }

  return null;
}
