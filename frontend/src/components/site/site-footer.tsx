import Link from "next/link";
import { Mail } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { footerColumns } from "@/components/site/site-nav";
import { contactEmail, contactEmailHref, socialLinks } from "@/lib/contact";
import { routes } from "@/lib/routes";

const socialButton =
  "inline-flex size-11 items-center justify-center rounded-[10px] border border-white/18 text-[#E6ECF7] hover:bg-white/8";

/** The navy footer at the bottom of every website page. */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-navy-900 text-white">
      <div className="mx-auto max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-16 pb-10">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-[320px] flex-[1_1_260px]">
            <Link
              href={routes.home}
              aria-label="FlyConnect Tech home"
              className="inline-flex"
            >
              <Logo onNavy className="h-6" />
            </Link>
            <p className="mt-4 text-[15px] leading-[1.6] text-on-navy">
              We design, develop &amp; integrate digital solutions that grow
              your business.
            </p>

            <div className="mt-5 flex gap-2">
              <a
                href={socialLinks.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (opens in a new tab)"
                className={socialButton}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram (opens in a new tab)"
                className={socialButton}
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <path d="M17.5 6.5h.01" />
                </svg>
              </a>
              <a
                href={contactEmailHref}
                aria-label={`Email ${contactEmail}`}
                className={socialButton}
              >
                <Mail
                  aria-hidden="true"
                  className="size-[18px]"
                  strokeWidth={1.8}
                />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-sm font-bold">{column.title}</p>
                <ul className="mt-3.5 flex flex-col items-start text-[15px] leading-[2.1]">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-on-navy transition-colors hover:text-white"
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
          {/* Plain text until the client provides these three pages. */}
          <p>Privacy · Terms · Cookies</p>
        </div>
      </div>
    </footer>
  );
}
