"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, Search } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
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
  /** Name and role at the right of the header (team panel only). */
  user?: { name: string; detail: string };
  children: React.ReactNode;
};

const WIDE = "(min-width: 56.25rem)"; // 900px, the "app" breakpoint

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
          "w-[270px] shrink-0 flex-col overflow-y-auto py-[22px] outline-none app:sticky app:top-0 app:flex app:h-screen",
          team ? "bg-navy px-3.5" : "border-r border-line-2 bg-white px-4",
          menuOpen
            ? "max-app:fixed max-app:inset-y-0 max-app:left-0 max-app:z-50 max-app:flex"
            : "max-app:hidden",
        )}
      >
        {sidebar(closeMenu)}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col" inert={menuOpen}>
        <header
          className={cn(
            "sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b px-[clamp(16px,3vw,32px)]",
            team
              ? "border-line bg-[rgba(244,246,250,0.94)]"
              : "border-line-2 bg-[rgba(246,248,252,0.92)]",
          )}
        >
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

          <p className="min-w-0 flex-1 truncate text-lg font-bold tracking-[-0.02em]">
            {title}
          </p>

          <form
            role="search"
            action={search.action}
            className={cn("max-app:hidden", team ? "w-[300px]" : "w-[280px]")}
          >
            <label className="flex h-11 items-center gap-2 rounded-xl border border-stroke bg-white px-3.5 text-muted-foreground focus-within:border-navy">
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
            className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-stroke bg-white text-navy"
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
            <span className="flex items-center gap-2.5 max-app:hidden">
              <Avatar name={user.name} />
              <span className="text-[13px] leading-[1.3]">
                <strong className="block">{user.name}</strong>
                <span className="text-muted-foreground">{user.detail}</span>
              </span>
            </span>
          ) : null}
        </header>

        <main className="flex flex-col gap-5 p-[clamp(16px,3vw,32px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
