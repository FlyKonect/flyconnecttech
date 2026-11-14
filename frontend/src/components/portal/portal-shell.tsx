"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Globe,
  LayoutGrid,
  LogOut,
  Plus,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/shell/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

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
  [routes.portalNotifications, "Notifications"],
  [routes.portalProfile, "Profile Settings"],
  [routes.portal, "Overview"],
];

export function portalTitle(pathname: string): string {
  const match = titles.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match[1] : "Overview";
}

/** The client portal layout. Reads the current address to mark the active menu item. */
export function PortalShell(props: ShellProps) {
  return <PortalShellView pathname={usePathname()} {...props} />;
}

/**
 * The same layout without reading the address. The layout file shows this
 * for an instant on pages whose address is only known when they are opened.
 */
export function PortalShellView({
  pathname,
  user,
  children,
}: ShellProps & { pathname: string }) {
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
      sidebar={(closeMenu) => (
        <>
          <div className="px-2 pt-1 pb-5">
            <Logo eager className="h-[22px]" />
            <p className="mt-1.5 text-xs font-semibold text-muted-foreground">
              Client portal
            </p>
          </div>

          <Button asChild className="mb-[18px] w-full">
            <Link href={routes.portalNewRequest} onClick={closeMenu}>
              <Plus aria-hidden="true" className="size-4" />
              Create support request
            </Link>
          </Button>

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
              active={under(routes.portalRequests)}
              onClick={closeMenu}
            >
              My Requests
              <span className="ml-auto text-xs font-bold text-muted-foreground">
                <span className="sr-only">, </span>
                {user.requestCount}
              </span>
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
              Profile Settings
            </NavItem>
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-line-3 pt-5">
            <div className="flex items-center gap-2.5 p-2">
              <Avatar name={user.name} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">
                  {user.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {user.company}
                </span>
              </span>
            </div>
            <NavItem href={routes.home} icon={Globe} onClick={closeMenu}>
              Visit website
            </NavItem>
            {/* Signing out is connected in Phase 4 (accounts). */}
            <button type="button" className={cn(navItem, "cursor-pointer")}>
              <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
              Logout
            </button>
          </div>
        </>
      )}
    >
      {children}
    </AppShell>
  );
}

const navItem =
  "text-body hover:bg-soft aria-[current=page]:bg-tint aria-[current=page]:text-navy-700 flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold aria-[current=page]:font-bold";

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
