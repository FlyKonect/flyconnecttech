import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { footerColumns } from "@/components/site/site-nav";
import { routes } from "@/lib/routes";

const legalLinks = [
  { label: "Privacy", href: routes.privacy },
  { label: "Terms", href: routes.terms },
  { label: "Cookies", href: routes.cookies },
];

/** The navy footer at the bottom of every website page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-navy-900 text-white">
      {/* As wide as the header on big screens, so five columns fit beside the logo. */}
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-16 pb-10 nav:max-w-[1360px] nav:px-6">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-[330px] flex-none">
            <Link
              href={routes.home}
              aria-label="FlyConnect Tech home"
              className="inline-flex"
            >
              <Logo onNavy className="h-7 site:h-8" />
            </Link>
            <p className="mt-3 text-sm text-on-navy">
              FlyConnect Tech is a trading brand of FlyConnect Limited.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-9 gap-y-10">
            {footerColumns.map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                // A long link wraps onto two lines instead of widening the row.
                className="max-w-[160px]"
              >
                <p className="text-sm font-bold">{column.title}</p>
                <ul className="mt-3.5 flex flex-col items-start text-[15px]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-block py-[5px] leading-[1.45] text-on-navy transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-white/12 pt-6 text-sm text-on-navy-muted">
          <p>© 2026 FlyConnect Tech. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap items-center gap-x-1.5">
              {legalLinks.map((link, index) => (
                <li key={link.href} className="flex items-center gap-x-1.5">
                  {index > 0 && <span aria-hidden="true">·</span>}
                  <Link
                    href={link.href}
                    className="inline-flex min-h-6 items-center transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
