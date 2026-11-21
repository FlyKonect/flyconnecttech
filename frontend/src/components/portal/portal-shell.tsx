"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderKanban,
  LayoutGrid,
  Plus,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/shell/app-shell";
import { UserMenu } from "@/components/shell/user-menu";
import { routes } from "@/lib/routes";

/** The customer shown in the sidebar, with the numbers beside the menu. */
export type PortalUser = {
  name: string;
  company: string;
  requestCount: number;
  unreadNotifications: number;
};

type ShellProps = { user: PortalUser; children: React.ReactNode };

/** The title in the header, from the address. Longest match wins. */
const titles: [prefix: string, title: string][] = [
  [routes.portalNewRequest, "Create Support Request"],
  [routes.portalRequests, "My Requests"],
  [routes.portalProjects, "My Projects"],
  [routes.portalNotifications, "Notifications"],
  [routes.portalProfile, "Profile Settings"],
  [routes.portal, "Overview"],
];

export function portalTitle(pathname: string): string {
  // One request: "Request TKT-2026-00118", or its "Request submitted" page.
  const request =
    /^\/portal\/requests\/(?!new(?:\/|$))([^/]+)(\/submitted)?\/?$/.exec(
      pathname,
    );
  if (request) {
    return request[2]
      ? "Request submitted"
      : `Request ${decodeURIComponent(request[1])}`;
  }
  // One project: "Project P-0004".
  const project = /^\/portal\/projects\/([^/]+)\/?$/.exec(pathname);
  if (project) return `Project ${decodeURIComponent(project[1])}`;
  const match = titles.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : "Overview";
}

/** The client portal layout for the signed-in customer. */
export function PortalShell({ user, children }: ShellProps) {
  const pathname = usePathname();

  const onOverview = pathname === routes.portal;
  const under = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AppShell
      tone="portal"
      title={portalTitle(pathname)}
      sidebarLabel="Client portal menu"
      search={{
        action: routes.portalRequests,
        label: "Search requests",
        placeholder: "Search requests",
      }}
      bell={{
        href: routes.portalNotifications,
        unread: user.unreadNotifications > 0,
      }}
      user={{
        name: user.name,
        detail: user.company,
        profileHref: routes.portalProfile,
      }}
      sidebar={(closeMenu) => (
        <>
          <div className="px-2 pt-1">
            <Logo eager className="h-[22px]" />
          </div>
          <div className="mx-2 mt-3 mb-4 flex items-center gap-2 border-b border-line-3 pb-4 text-xs">
            <span className="rounded-full bg-tint px-2.5 py-1 font-semibold text-navy-700">
              Client portal
            </span>
          </div>

          <Link
            href={routes.portalNewRequest}
            onClick={closeMenu}
            className="mx-1 mb-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy text-sm font-bold text-white transition-colors hover:bg-[#0d2a6b]"
          >
            <Plus
              aria-hidden="true"
              className="size-[18px]"
              strokeWidth={2.2}
            />
            New request
          </Link>

          <p className="mx-3 mb-1.5 text-[11px] font-bold tracking-[0.1em] text-muted-foreground">
            MENU
          </p>
          <nav aria-label="Customer" className="flex flex-col gap-0.5">
            <NavItem
              href={routes.portal}
              icon={LayoutGrid}
              active={onOverview}
              onClick={closeMenu}
            >
              Overview
            </NavItem>
            <NavItem
              href={routes.portalRequests}
              icon={Ticket}
              active={
                under(routes.portalRequests) && !under(routes.portalNewRequest)
              }
              onClick={closeMenu}
            >
              My Requests
              <span className="ml-auto inline-flex h-[22px] min-w-[28px] items-center justify-center rounded-full bg-soft px-2 text-xs font-bold text-navy-700">
                <span className="sr-only">, </span>
                {user.requestCount}
              </span>
            </NavItem>
            <NavItem
              href={routes.portalProjects}
              icon={FolderKanban}
              active={under(routes.portalProjects)}
              onClick={closeMenu}
            >
              My Projects
            </NavItem>
            <NavItem
              href={routes.portalNotifications}
              icon={Bell}
              active={under(routes.portalNotifications)}
              onClick={closeMenu}
            >
              Notifications
              {user.unreadNotifications > 0 ? (
                <span className="ml-auto inline-flex h-[22px] min-w-[34px] items-center justify-center rounded-full bg-navy px-1.5 text-xs font-bold text-white">
                  <span className="sr-only">, </span>
                  {user.unreadNotifications}
                  <span className="sr-only"> unread</span>
                </span>
              ) : null}
            </NavItem>
            <NavItem
              href={routes.portalProfile}
              icon={UserRound}
              active={under(routes.portalProfile)}
              onClick={closeMenu}
            >
              Profile settings
            </NavItem>
          </nav>

          <div className="mt-auto border-t border-line-3 pt-3">
            <UserMenu
              area="portal"
              placement="sidebar"
              name={user.name}
              detail={user.company}
              profileHref={routes.portalProfile}
            />
          </div>
        </>
      )}
    >
      {children}
    </AppShell>
  );
}

// The current page gets a tinted panel and a navy bar on its left edge.
const navItem =
  "group relative text-body hover:bg-soft hover:text-navy aria-[current=page]:bg-tint aria-[current=page]:text-navy-700 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition-colors aria-[current=page]:font-bold before:absolute before:top-2.5 before:bottom-2.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-navy before:opacity-0 aria-[current=page]:before:opacity-100";

function NavItem({
  href,
  icon: Icon,
  active = false,
  onClick,
  children,
}: {
  href: string;
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={navItem}
    >
      <Icon aria-hidden="true" className="size-[18px] shrink-0" />
      {children}
    </Link>
  );
}
