"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { roles, type TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";
import {
  isTeamNavItemActive,
  teamNav,
  type TeamNavCounts,
  type TeamNavItem,
} from "@/lib/team-nav";
import { cn } from "@/lib/utils";

/** The team member shown in the sidebar and header. */
export type TeamUser = {
  name: string;
  jobTitle: string;
  role: TeamRole;
  counts: TeamNavCounts;
};

/** The title in the header, from the address. */
const titles: [prefix: string, title: string][] = [
  [routes.teamRequests, "Support Requests"],
  [routes.teamDemos, "Demo Requests"],
  [routes.teamQuotes, "Quote Requests"],
  [routes.teamMessages, "Messages"],
  [routes.teamCustomers, "Customers"],
  [routes.teamUsers, "Users"],
  [routes.teamReports, "Reports & Analytics"],
  [routes.teamNotifications, "Notifications"],
  [routes.teamSettings, "Settings"],
];

export function teamTitle(pathname: string): string {
  const match = titles.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : "Dashboard";
}

const previewRoles: Record<string, TeamRole> = {
  "super-admin": "SUPER_ADMIN",
  admin: "ADMIN",
  manager: "MANAGER",
  developer: "DEVELOPER",
};

type ShellProps = {
  /**
   * TEMPORARY, until sign-in exists (Phase 4): one sample person per role.
   * On a developer's PC, adding ?role=developer (or admin, manager,
   * super-admin) to the address previews that role. On the live site the
   * address is ignored and `defaultRole` is always used.
   */
  users: Record<TeamRole, Omit<TeamUser, "role">>;
  defaultRole: TeamRole;
  children: React.ReactNode;
};

/** The team panel layout. Reads the address to mark the active menu item. */
export function TeamShell({ users, defaultRole, children }: ShellProps) {
  const pathname = usePathname();
  const params = useSearchParams();

  const preview =
    process.env.NODE_ENV === "development"
      ? previewRoles[params.get("role") ?? ""]
      : undefined;
  const role = preview ?? defaultRole;

  return (
    <TeamShellView
      pathname={pathname}
      status={params.get("status")}
      user={{ ...users[role], role }}
      // Keep the previewed role while clicking around.
      previewQuery={preview ? `role=${params.get("role")}` : undefined}
    >
      {children}
    </TeamShellView>
  );
}

/**
 * The same layout without reading the address. The layout file shows this
 * for an instant while the address is being read.
 */
export function TeamShellView({
  pathname,
  status,
  user,
  previewQuery,
  children,
}: {
  pathname: string;
  status: string | null;
  user: TeamUser;
  previewQuery?: string;
  children: React.ReactNode;
}) {
  const roleLabel = roles[user.role].label;
  const withPreview = (href: string) =>
    previewQuery
      ? `${href}${href.includes("?") ? "&" : "?"}${previewQuery}`
      : href;

  return (
    <AppShell
      tone="team"
      title={teamTitle(pathname)}
      sidebarLabel="Team panel menu"
      search={{
        action: routes.teamRequests,
        label: "Search requests and customers",
        placeholder: "Search requests, customers",
      }}
      bell={{
        href: withPreview(routes.teamNotifications),
        unread: (user.counts.notifications ?? 0) > 0,
      }}
      user={{ name: user.name, detail: `${roleLabel} · ${user.jobTitle}` }}
      sidebar={(closeMenu) => (
        <>
          <div className="px-2.5 pt-1 pb-1.5">
            <Logo eager onNavy className="h-[22px]" />
          </div>
          <p className="mx-2.5 mb-3 text-xs text-on-navy-muted">
            Team panel ·{" "}
            <Link
              href={routes.home}
              className="inline-block py-1 font-bold text-gold-on-navy"
            >
              View website
            </Link>
          </p>

          <nav aria-label="Team" className="flex flex-col gap-0.5">
            {teamNav(user.role).map((section, index) => (
              <React.Fragment key={section.label ?? index}>
                {section.label ? (
                  <p className="mx-3 mt-3.5 mb-1.5 text-[11px] font-bold tracking-[0.08em] text-nav-label">
                    {section.label}
                  </p>
                ) : null}
                {section.items.map((item) => (
                  <Link
                    key={item.key}
                    href={withPreview(item.href)}
                    onClick={closeMenu}
                    aria-current={
                      isTeamNavItemActive(item, pathname, status)
                        ? "page"
                        : undefined
                    }
                    className={navItem}
                  >
                    {item.label}
                    <NavNumber item={item} value={user.counts[item.key] ?? 0} />
                  </Link>
                ))}
              </React.Fragment>
            ))}
            {/* Signing out is connected in Phase 4 (accounts). */}
            <button type="button" className={cn(navItem, "cursor-pointer")}>
              Logout
            </button>
          </nav>

          <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-2.5 pt-3.5">
            <Avatar name={user.name} tone="gold" size="sm" />
            <span className="min-w-0 text-[13px] leading-[1.35] text-white">
              <strong className="block truncate">{user.name}</strong>
              <span className="block truncate text-on-navy-muted">
                {roleLabel}
              </span>
            </span>
          </div>
        </>
      )}
    >
      {children}
    </AppShell>
  );
}

const navItem =
  "text-on-navy flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-3 text-left text-sm font-medium hover:bg-white/6 aria-[current=page]:bg-white/12 aria-[current=page]:font-bold aria-[current=page]:text-white";

/** The number beside a menu item: a plain count, or a gold badge that hides at zero. */
function NavNumber({ item, value }: { item: TeamNavItem; value: number }) {
  if (item.number === "count") {
    return (
      <span className="ml-auto text-xs opacity-80">
        <span className="sr-only">, </span>
        {value}
      </span>
    );
  }

  if (item.number === "badge" && value > 0) {
    return (
      <span className="ml-auto inline-flex h-[22px] min-w-[34px] items-center justify-center rounded-full bg-gold px-1.5 text-xs font-bold text-navy">
        <span className="sr-only">, </span>
        {value}
        <span className="sr-only"> new</span>
      </span>
    );
  }

  return null;
}
