"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { BookDemoButton } from "@/components/site/book-demo-button";
import { isCurrent, mainLinks, serviceLinks } from "@/components/site/site-nav";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The website header.
 *
 * Three widths:
 * - 1240px and up: logo, full menu with the Services dropdown, Contact and the two buttons.
 * - 860px to 1239px: logo, the two buttons and a menu button.
 * - below 860px: logo and a menu button, with the two buttons in a row underneath.
 *
 * The design switches to the full menu at 1180px. That is 1240px here, with
 * slightly tighter spacing between the menu items, because
 * the FlyConnect Tech logo is wider than the design's placeholder logo.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  const closeMenu = () => setMenuOpen(false);

  // Escape closes the phone menu and puts the keyboard back on its button.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="relative z-20 border-b border-line-2 bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center justify-between gap-5 px-[clamp(20px,4vw,40px)]">
        <Link
          href={routes.home}
          aria-label="FlyConnect Tech home"
          className="flex min-w-0 shrink-0 items-center max-nav:shrink"
        >
          <Logo eager className="h-6 nav:h-[22px]" />
        </Link>

        <nav
          aria-label="Main"
          className="flex shrink-0 items-center gap-[18px] text-[15px] font-medium whitespace-nowrap max-nav:hidden"
        >
          {mainLinks.map((link) =>
            link.services ? (
              <ServicesMenu key={link.href} pathname={pathname} />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  isCurrent(link.href, pathname) ? "page" : undefined
                }
                className={navLink}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href={routes.contact}
            aria-current={
              isCurrent(routes.contact, pathname) ? "page" : undefined
            }
            className="inline-flex h-11 items-center px-2 text-[15px] font-medium text-ink-2 transition-colors hover:text-navy aria-[current=page]:font-semibold max-nav:hidden"
          >
            Contact
          </Link>

          <span className="flex items-center gap-2.5 max-site:hidden">
            <Button asChild size="siteSm">
              <Link href={routes.contact}>Get a quote</Link>
            </Button>
            <BookDemoButton />
          </span>

          <button
            ref={menuButton}
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-[10px] border border-stroke bg-white text-navy nav:hidden"
          >
            {menuOpen ? (
              <X aria-hidden="true" className="size-[18px]" />
            ) : (
              <Menu aria-hidden="true" className="size-5" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </div>

      {/* Phones: the two buttons sit in a row under the header. */}
      <div className="flex gap-2.5 px-5 pb-3.5 site:hidden">
        <Button asChild size="siteSm" className="min-w-0 flex-1">
          <Link href={routes.contact}>Get a quote</Link>
        </Button>
        <BookDemoButton className="min-w-0 flex-1" />
      </div>

      <nav
        id={menuId}
        aria-label="Menu"
        hidden={!menuOpen}
        className="mx-auto flex max-w-[1240px] flex-col border-t border-line-2 px-[clamp(20px,4vw,40px)] pt-1 pb-4 nav:hidden [&[hidden]]:hidden"
      >
        <MenuLink href={routes.home} pathname={pathname} onClick={closeMenu}>
          Home
        </MenuLink>
        {mainLinks.map((link) => (
          <React.Fragment key={link.href}>
            <MenuLink href={link.href} pathname={pathname} onClick={closeMenu}>
              {link.label}
            </MenuLink>
            {link.services
              ? serviceLinks.slice(1).map((service) => (
                  <MenuLink
                    key={service.href}
                    href={service.href}
                    pathname={pathname}
                    onClick={closeMenu}
                    indented
                  >
                    {service.label}
                  </MenuLink>
                ))
              : null}
          </React.Fragment>
        ))}
        <MenuLink href={routes.contact} pathname={pathname} onClick={closeMenu}>
          Contact
        </MenuLink>
        <MenuLink href={routes.support} pathname={pathname} onClick={closeMenu}>
          Support
        </MenuLink>
        <MenuLink
          href={routes.portalSignIn}
          pathname={pathname}
          onClick={closeMenu}
        >
          Client login
        </MenuLink>
      </nav>
    </header>
  );
}

const navLink =
  "text-ink-2 hover:text-navy aria-[current=page]:border-gold aria-[current=page]:text-navy inline-flex h-[76px] items-center gap-1 border-b-2 border-transparent pt-0.5 transition-colors aria-[current=page]:font-semibold";

/**
 * "Services" with its dropdown. The dropdown opens when the mouse is over it
 * or the keyboard is inside it, and Escape closes it.
 */
function ServicesMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = React.useState(false);
  const current = isCurrent(routes.services, pathname);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        // Close only when the keyboard has left the whole dropdown.
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <Link
        href={routes.services}
        aria-haspopup="true"
        aria-expanded={open}
        aria-current={current ? "page" : undefined}
        className={navLink}
      >
        Services
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </Link>

      {open ? (
        <div className="absolute top-full -left-6 z-40">
          <div className="w-[360px] rounded-2xl border border-line bg-white p-2 shadow-[0_28px_56px_-24px_rgba(2,26,84,0.35)]">
            {serviceLinks.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-xl p-3 text-navy hover:bg-soft"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gold/13 text-gold-text">
                  <service.icon aria-hidden="true" className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold">
                    {service.label}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[1.45] font-normal text-muted-foreground">
                    {service.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** One line in the phone menu. The current page is bold with a gold dot. */
function MenuLink({
  href,
  pathname,
  onClick,
  indented = false,
  children,
}: {
  href: string;
  pathname: string;
  onClick: () => void;
  indented?: boolean;
  children: React.ReactNode;
}) {
  const current = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line-3",
        indented
          ? "min-h-11 pl-4 text-[15px] font-medium text-body"
          : "min-h-12 text-base font-medium text-navy",
        current && "font-bold text-navy",
      )}
    >
      {children}
      {current ? (
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-full bg-gold"
        />
      ) : null}
    </Link>
  );
}
