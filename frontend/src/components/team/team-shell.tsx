"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { AppShell } from "@/components/shell/app-shell";
import { useSignOut } from "@/components/auth/use-sign-out";
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
  jobTitle: string | null;
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
  // One request: "Request TKT-2026-00124".
  const request = /^\/team\/requests\/([^/]+)\/?$/.exec(pathname);
  if (request) return `Request ${decodeURIComponent(request[1])}`;
  const path = pathname.replace(/\/$/, "");
  if (path === routes.teamNewCustomer) return "Add customer";
  if (path === routes.teamNewUser) return "Add user";
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
  const { signOut, signingOut } = useSignOut("team");
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
        }}
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
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={
                        isTeamNavItemActive(item, pathname, status)
                          ? "page"
                          : undefined
                      }
                      className={navItem}
                    >
                      {item.label}
                      <NavNumber
                        item={item}
                        value={user.counts[item.key] ?? 0}
                      />
                    </Link>
                  ))}
                </React.Fragment>
              ))}
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className={cn(navItem, "cursor-pointer disabled:opacity-60")}
              >
                {signingOut ? "Signing out…" : "Logout"}
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
    </TitleContext>
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
