"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";

import { UserMenu } from "@/components/shell/user-menu";
import { cn } from "@/lib/utils";

/**
 * The frame shared by the client portal and the team panel: a sidebar on the
 * left, a sticky header, and the page beside it.
 *
 * Below 900px the sidebar becomes a slide-in menu opened from a button in
 * the header. While it is open, Escape or a tap outside closes it and the
 * page behind it cannot be reached by keyboard.
 *
 * `tone` picks the colours: "portal" (white sidebar) or "team" (navy sidebar).
 */

export type AppShellProps = {
  tone: "portal" | "team";
  /** Page title shown in the header. */
  title: string;
  /** Names the sidebar for screen readers, for example "Client portal menu". */
  sidebarLabel: string;
  /** The sidebar's content. Call `closeMenu` when a link is followed. */
  sidebar: (closeMenu: () => void) => React.ReactNode;
  search: { action: string; label: string; placeholder: string };
  bell: { href: string; unread: boolean };
  /** The signed-in person at the right of the header, with their menu. */
  user?: { name: string; detail: string; profileHref: string };
  children: React.ReactNode;
};

const WIDE = "(min-width: 56.25rem)"; // 900px, the "app" breakpoint
const COLLAPSED_KEY = "fct.sidebar-hidden";

/**
 * Whether the wide-screen sidebar is hidden. Kept in localStorage so it is
 * remembered; if storage is blocked it still works for this visit.
 */
const sidebarHidden = (() => {
  const listeners = new Set<() => void>();
  let memory: boolean | null = null;
  return {
    get(): boolean {
      if (memory !== null) return memory;
      try {
        return localStorage.getItem(COLLAPSED_KEY) === "1";
      } catch {
        return false;
      }
    },
    set(hidden: boolean) {
      memory = hidden;
      try {
        localStorage.setItem(COLLAPSED_KEY, hidden ? "1" : "0");
      } catch {
        // Not remembered, still works for this visit.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
})();

export function AppShell({
  tone,
  title,
  sidebarLabel,
  sidebar,
  search,
  bell,
  user,
  children,
}: AppShellProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const aside = React.useRef<HTMLElement>(null);
  const sidebarId = React.useId();

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  // On wide screens the sidebar can be hidden; the choice is remembered.
  const collapsed = React.useSyncExternalStore(
    sidebarHidden.subscribe,
    sidebarHidden.get,
    () => false,
  );
  const toggleSidebar = () => sidebarHidden.set(!collapsed);

  // When the menu closes, put the keyboard back on the button that opened it.
  // This runs after the page behind the menu is reachable again.
  const wasOpen = React.useRef(false);
  React.useEffect(() => {
    if (wasOpen.current && !menuOpen) menuButton.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  React.useEffect(() => {
    if (!menuOpen) return;

    // Move the keyboard into the menu.
    aside.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    // If the window is made wide while the menu is open, the sidebar is
    // always visible again, so the "open" state must not linger.
    const wide = window.matchMedia(WIDE);
    const onWide = () => {
      if (wide.matches) setMenuOpen(false);
    };

    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [menuOpen]);

  const team = tone === "team";

  return (
    <div
      data-slot="app-shell"
      className={cn(
        "flex min-h-screen text-navy",
        team ? "bg-team-bg" : "bg-portal-bg",
      )}
    >
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-pointer bg-[rgba(2,26,84,0.45)] app:hidden"
        />
      ) : null}

      <aside
        ref={aside}
        id={sidebarId}
        aria-label={sidebarLabel}
        tabIndex={-1}
        className={cn(
          "w-[270px] shrink-0 flex-col overflow-y-auto py-[22px] outline-none app:sticky app:top-0 app:flex app:h-screen print:!hidden",
          team ? "bg-navy px-3.5" : "border-r border-line-2 bg-white px-4",
          menuOpen
            ? "max-app:fixed max-app:inset-y-0 max-app:left-0 max-app:z-50 max-app:flex"
            : "max-app:hidden",
          collapsed && "app:hidden",
        )}
      >
        {sidebar(closeMenu)}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col" inert={menuOpen}>
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-line-2 bg-white/95 px-[clamp(16px,3vw,32px)] shadow-[0_1px_2px_rgba(2,26,84,0.04)] backdrop-blur print:!hidden">
          <button
            ref={menuButton}
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls={sidebarId}
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-stroke bg-white text-navy app:hidden"
          >
            <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
            title={collapsed ? "Show sidebar" : "Hide sidebar"}
            aria-expanded={!collapsed}
            aria-controls={sidebarId}
            onClick={toggleSidebar}
            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-soft hover:text-navy max-app:hidden"
          >
            {collapsed ? (
              <PanelLeftOpen
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.8}
              />
            ) : (
              <PanelLeftClose
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.8}
              />
            )}
          </button>

          <span
            aria-hidden="true"
            className="h-7 w-px shrink-0 bg-line-2 max-app:hidden"
          />

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase max-app:hidden">
              {team ? "Team panel" : "Client portal"}
            </p>
            <p className="truncate text-lg font-bold tracking-[-0.02em]">
              {title}
            </p>
          </div>

          <form
            role="search"
            action={search.action}
            className={cn("max-app:hidden", team ? "w-[300px]" : "w-[280px]")}
          >
            <label className="flex h-10 items-center gap-2 rounded-full border border-transparent bg-soft px-4 text-muted-foreground transition-colors focus-within:border-navy focus-within:bg-white hover:border-line-2">
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <input
                type="search"
                name="q"
                aria-label={search.label}
                placeholder={search.placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>

          <Link
            href={bell.href}
            aria-label={
              bell.unread ? "Notifications, you have unread" : "Notifications"
            }
            className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-soft"
          >
            <Bell aria-hidden="true" className="size-[19px]" />
            {bell.unread ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-2 right-[9px] size-[9px] rounded-full border-2 border-white",
                  team ? "bg-gold" : "bg-navy",
                )}
              />
            ) : null}
          </Link>

          {user ? (
            <span
              aria-hidden="true"
              className="h-7 w-px shrink-0 bg-line-2 max-app:hidden"
            />
          ) : null}
          {user ? (
            <UserMenu
              area={tone}
              name={user.name}
              detail={user.detail}
              profileHref={user.profileHref}
            />
          ) : null}
        </header>

        <main className="flex flex-col gap-5 p-[clamp(16px,3vw,32px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
