/**
 * Case Studies page, section by section.
 *
 * Converted from design/source/website-NsWork.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { routes } from "@/lib/routes";

export function CaseStudiesPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <OverviewSection />
      <TwoPortalsOnePlatformSection />
      <WhatMakesItWorkSection />
      <SearchToETicketSection />
      <TheStackBehindFlyconnectSection />
      <InsideThePlatformSection />
      <TestimonialSection />
      <MoreProjectsComingSoonSection />
      <WantAPlatformLikeSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(90% 120% at 88% 0%, #0C3584 0%, #021A54 52%, #01123D 100%)",
      }}
    >
      <Image
        src="/images/route-map.svg"
        alt=""
        aria-hidden="true"
        width={1440}
        height={528}
        unoptimized
        style={{
          position: "absolute",
          left: "50%",
          top: "clamp(40px, 6vw, 90px)",
          width: "max(1400px, 130%)",
          maxWidth: "none",
          transform: "translateX(-30%)",
          opacity: "0.22",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: "1240px",
          margin: "0 auto",
          padding:
            "clamp(24px, 3vw, 36px) clamp(20px, 4vw, 40px) clamp(56px, 7vw, 96px)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <Link
            href={routes.home}
            style={{ color: "#C5D0EA", textDecoration: "none" }}
          >
            Home
          </Link>
          <span aria-hidden="true" style={{ color: "#6F82AE" }}>
            /
          </span>
          <span
            aria-current="page"
            style={{ color: "#FFFFFF", fontWeight: "500" }}
          >
            Case Studies
          </span>
        </nav>
        <div
          style={{
            marginTop: "clamp(28px, 4vw, 52px)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "clamp(40px, 6vw, 72px)",
          }}
        >
          <div style={{ flex: "1 1 480px", minWidth: "0" }}>
            <p
              style={{
                margin: "0",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "rgba(211,175,52,0.14)",
                border: "1px solid rgba(211,175,52,0.4)",
                color: "#D3AF34",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Case study · Travel technology
            </p>
            <h1
              style={{
                margin: "20px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(38px, 4.8vw, 62px)",
                lineHeight: "1.04",
                letterSpacing: "-0.035em",
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              FlyConnect: a complete travel booking platform,{" "}
              <span style={{ color: "#D3AF34" }}>built end to end.</span>
            </h1>
            <p
              style={{
                margin: "22px 0 0",
                maxWidth: "580px",
                fontSize: "clamp(17px, 1.5vw, 19px)",
                lineHeight: "1.6",
                color: "#C5D0EA",
              }}
            >
              A public booking website for customers and a B2B dashboard for
              staff, agents and sub-agents for a UK travel business, with live
              Amadeus flights, Stripe payments, finance tools and reporting.
            </p>
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <a
                href="https://dev.flyconnect.co.uk"
                target="_blank"
                rel="noopener"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "52px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  background: "#FFFFFF",
                  color: "#021A54",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                View live project
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h11" />
                </svg>
              </a>
              <Link
                href={routes.contact}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "52px",
                  padding: "0 24px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  background: "#D3AF34",
                  color: "#021A54",
                }}
              >
                Start a similar project
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div
            style={{ flex: "1 1 460px", minWidth: "0", position: "relative" }}
          >
            <div
              style={{
                minHeight: "340px",
                borderRadius: "18px",
                border: "1px dashed rgba(255,255,255,0.28)",
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#E6ECF7",
                }}
              >
                FlyConnect screenshot
              </p>
              <p style={{ margin: "0", fontSize: "13px", color: "#B4C3E6" }}>
                Add a capture of the booking site or dashboard
              </p>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: "clamp(40px, 5vw, 64px)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "20px",
            background: "rgba(255,255,255,0.04)",
            color: "#FFFFFF",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            }}
          >
            <div
              style={{
                padding: "24px clamp(20px, 3vw, 36px)",
                borderRight: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "38px",
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                }}
              >
                46
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#B4C3E6",
                }}
              >
                Data models
              </p>
            </div>
            <div
              style={{
                padding: "24px clamp(20px, 3vw, 36px)",
                borderRight: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "38px",
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                }}
              >
                14
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#B4C3E6",
                }}
              >
                Report types
              </p>
            </div>
            <div
              style={{
                padding: "24px clamp(20px, 3vw, 36px)",
                borderRight: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "38px",
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                }}
              >
                4
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#B4C3E6",
                }}
              >
                User roles
              </p>
            </div>
            <div style={{ padding: "24px clamp(20px, 3vw, 36px)" }}>
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "38px",
                  fontWeight: "700",
                  letterSpacing: "-0.03em",
                }}
              >
                2
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "#B4C3E6",
                }}
              >
                {"Portals: B2C & B2B"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewSection() {
  return (
    <section id="overview" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A6882",
              }}
            >
              Client
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#021A54",
              }}
            >
              FlyConnect, a UK travel business
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A6882",
              }}
            >
              Platform
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#021A54",
              }}
            >
              Customer booking website and B2B dashboard
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A6882",
              }}
            >
              Services
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#021A54",
              }}
            >
              Travel technology, web development and API integrations
            </p>
          </div>
          <div>
            <p
              style={{
                margin: "0",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A6882",
              }}
            >
              Live project
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.5",
                color: "#021A54",
              }}
            >
              <a
                href="https://dev.flyconnect.co.uk"
                target="_blank"
                rel="noopener"
                style={{
                  color: "#021A54",
                  fontWeight: "600",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                dev.flyconnect.co.uk
              </a>
            </p>
          </div>
        </div>
        <div
          style={{
            marginTop: "56px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "clamp(24px, 3vw, 36px)",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#887122",
              }}
            >
              The brief
            </p>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#23324F",
              }}
            >
              Sell flights online to customers, and give staff, agents and
              sub-agents one system for bookings, payments, finance and
              reporting.
            </p>
          </div>
          <div
            style={{
              padding: "clamp(24px, 3vw, 36px)",
              borderRadius: "18px",
              background: "#F6F9FF",
              border: "1px solid #E1E8F2",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#887122",
              }}
            >
              What we delivered
            </p>
            <p
              style={{
                margin: "14px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#23324F",
              }}
            >
              Two portals on one platform: a public booking website connected
              live to Amadeus, and a B2B dashboard with role-based access,
              payment links, finance tools and 14 report types.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TwoPortalsOnePlatformSection() {
  return (
    <section
      id="built"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        background: "#F6F9FF",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            What we built
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            Two portals, one platform.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "clamp(24px, 3vw, 36px)",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  width: "48px",
                  height: "48px",
                  flex: "none",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(211,175,52,0.13)",
                  color: "#887122",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </span>
              <div>
                <h3
                  style={{
                    margin: "0",
                    fontFamily: "var(--font-heading)",
                    fontSize: "22px",
                    letterSpacing: "-0.02em",
                    fontWeight: "700",
                  }}
                >
                  Customer booking website
                </h3>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "14px",
                    color: "#5A6882",
                  }}
                >
                  B2C · public site
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: "12px 24px",
                fontSize: "15px",
                color: "#23324F",
              }}
            >
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Flight search: one-way, return and multi-city
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Results with filters and flexible dates
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Flight details, baggage allowance and fare rules
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Passenger details and Stripe checkout
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Booking confirmation, e-ticket and emails
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Manage booking and cancellation
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Holiday packages, help and support pages
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Customer accounts with email verification
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "clamp(24px, 3vw, 36px)",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span
                style={{
                  width: "48px",
                  height: "48px",
                  flex: "none",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(211,175,52,0.13)",
                  color: "#887122",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
              </span>
              <div>
                <h3
                  style={{
                    margin: "0",
                    fontFamily: "var(--font-heading)",
                    fontSize: "22px",
                    letterSpacing: "-0.02em",
                    fontWeight: "700",
                  }}
                >
                  B2B dashboard
                </h3>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "14px",
                    color: "#5A6882",
                  }}
                >
                  Staff, agents and sub-agents
                </p>
              </div>
            </div>
            <div
              style={{
                marginTop: "22px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: "12px 24px",
                fontSize: "15px",
                color: "#23324F",
              }}
            >
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                KPI dashboard and Amadeus flight search for staff
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Bookings: calendar, tracking, queues and group bookings
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Post-booking requests: void, change and enquiry
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Staff, branches, roles, discounts and coupons
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Agents and sub-agents with their own access
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Payment links, admin fees and airline blackouts
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Refunds, credit notes, invoices and ledger
              </span>
              <span
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#887122"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                14 report types and real-time chat
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatMakesItWorkSection() {
  return (
    <section
      id="features"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            Key features
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            What makes it work.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Live Amadeus search and booking
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Live fares, pricing and booking through the Amadeus API.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Price check before payment
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Fare and availability confirmed again before the card is charged.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Stripe checkout and payment links
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Customers pay online; staff and agents send payment links.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Agent and sub-agent portals
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Each agent works in their own space, with their own bookings.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Role-based permissions
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Super-admin, staff, agent and sub-agent roles, with permissions
              per module.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
                <path d="m9 16 2 2 4-4" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Group bookings and queues
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Group requests, booking queues and a booking calendar.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 17.5v-11" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Refunds, invoices and ledger
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Cancellations, refunds, credit notes, invoices and accounts.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Real-time chat
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Staff and agents chat live inside the dashboard.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              PDF e-tickets and emails
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              E-tickets, receipts and booking emails generated automatically.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                flex: "none",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(211,175,52,0.13)",
                color: "#887122",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              14 report types
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Sales, bookings, refunds, and staff and agent performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchToETicketSection() {
  return (
    <section
      id="flow"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        background: "#F6F9FF",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            Booking flow
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            Search to e-ticket, in six steps.
          </h2>
          <p
            style={{
              margin: "18px auto 0",
              maxWidth: "620px",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            Payment is taken only after the fare is confirmed, and the booking
            is registered with the GDS straight after.
          </p>
        </div>
        <ol
          style={{
            listStyle: "none",
            margin: "48px 0 0",
            padding: "0",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#D3AF34",
                color: "#021A54",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              1
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Search
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Live fares from Amadeus, with filters and flexible dates.
            </p>
          </li>
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#021A54",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              2
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Price check
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Fare and availability confirmed again before payment.
            </p>
          </li>
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#021A54",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              3
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Passengers
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Traveller details captured and checked.
            </p>
          </li>
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#021A54",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              4
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Payment
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Stripe checkout, or a payment link sent by staff.
            </p>
          </li>
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#021A54",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              5
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Confirm
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Booking registered with the GDS.
            </p>
          </li>
          <li
            style={{
              padding: "24px",
              borderRadius: "16px",
              background: "#F6F9FF",
            }}
          >
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#021A54",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: "700",
              }}
            >
              6
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              E-ticket
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              PDF e-ticket and confirmation email sent automatically.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function TheStackBehindFlyconnectSection() {
  return (
    <section
      id="stack"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            Architecture
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            The stack behind FlyConnect.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
              Frontend
            </p>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Next.js 16
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                TypeScript
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Tailwind CSS
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Radix UI
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Ant Design
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                TanStack Query
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
              Backend
            </p>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Node.js
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Express 5
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                PostgreSQL
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Sequelize
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Redis
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Socket.IO
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
              Integrations
            </p>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Amadeus SDK
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Stripe and webhooks
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Cloudinary
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Resend email
              </span>
            </div>
          </div>
          <div
            style={{
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
              Security and quality
            </p>
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                JWT and one-time codes
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Helmet
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Rate limiting
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Joi validation
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Jest and Supertest
              </span>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "#F1F5FA",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#23324F",
                }}
              >
                Vitest
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InsideThePlatformSection() {
  return (
    <section
      id="screens"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        background: "#F6F9FF",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            Screens
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            Inside the platform.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              minHeight: "320px",
              borderRadius: "18px",
              border: "1px dashed #C8D3E3",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#23324F",
              }}
            >
              Booking website screenshot
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#5A6882" }}>
              Add a capture of search results or checkout
            </p>
          </div>
          <div
            style={{
              minHeight: "320px",
              borderRadius: "18px",
              border: "1px dashed #C8D3E3",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#23324F",
              }}
            >
              B2B dashboard screenshot
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#5A6882" }}>
              Add a capture of the bookings or reports screen
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section
      id="testimonial"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <figure
          style={{
            margin: "0 auto",
            maxWidth: "860px",
            padding: "clamp(28px, 4vw, 44px)",
            border: "1px dashed #C8D3E3",
            borderRadius: "18px",
            background: "#FFFFFF",
            textAlign: "center",
          }}
        >
          <blockquote
            style={{
              margin: "0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(20px, 2.2vw, 26px)",
              lineHeight: "1.45",
              fontWeight: "600",
              letterSpacing: "-0.01em",
              color: "#23324F",
            }}
          >
            “[Client testimonial about the FlyConnect project.]”
          </blockquote>
          <figcaption
            style={{
              marginTop: "24px",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              textAlign: "left",
            }}
          >
            <span
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "#E8EDF4",
              }}
            />
            <span style={{ fontSize: "14px", color: "#3E4C66" }}>
              [Client name]
              <br />
              [Role, FlyConnect]
            </span>
          </figcaption>
        </figure>
        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: "14px",
            color: "#5A6882",
          }}
        >
          Placeholder content. Real quotes are added with the client’s
          permission.
        </p>
      </div>
    </section>
  );
}

function MoreProjectsComingSoonSection() {
  return (
    <section
      id="more"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        background: "#F6F9FF",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            More case studies
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            More projects coming soon.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              minHeight: "240px",
              borderRadius: "18px",
              border: "1px dashed #C8D3E3",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#23324F",
              }}
            >
              [Next case study]
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#5A6882" }}>
              Placeholder · add the project, industry and results
            </p>
          </div>
          <div
            style={{
              minHeight: "240px",
              borderRadius: "18px",
              border: "1px dashed #C8D3E3",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                margin: "0",
                fontSize: "15px",
                fontWeight: "600",
                color: "#23324F",
              }}
            >
              [Next case study]
            </p>
            <p style={{ margin: "0", fontSize: "13px", color: "#5A6882" }}>
              Placeholder · add the project, industry and results
            </p>
          </div>
          <Link
            href={routes.contact}
            className="ns-lift"
            style={{
              minHeight: "240px",
              boxSizing: "border-box",
              padding: "28px",
              borderRadius: "18px",
              background: "#021A54",
              color: "#FFFFFF",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                margin: "0",
                fontFamily: "var(--font-heading)",
                fontSize: "24px",
                lineHeight: "1.2",
                fontWeight: "700",
                letterSpacing: "-0.02em",
              }}
            >
              Your project could be next.
            </p>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "15px",
                fontWeight: "600",
                color: "#D3AF34",
              }}
            >
              Get a quote
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function WantAPlatformLikeSection() {
  return (
    <section
      style={{
        background:
          "radial-gradient(90% 120% at 0% 100%, #0C3584 0%, #021A54 55%)",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "clamp(56px, 8vw, 96px) clamp(20px, 4vw, 40px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "32px 48px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: "1 1 520px", minWidth: "0" }}>
          <h2
            style={{
              margin: "0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4.2vw, 52px)",
              lineHeight: "1.06",
              letterSpacing: "-0.035em",
              fontWeight: "700",
            }}
          >
            Want a platform like FlyConnect?
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              maxWidth: "580px",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#C9D5EA",
            }}
          >
            Book a demo to see the booking flow and the dashboard, or ask for a
            quote for your own platform.
          </p>
        </div>
        <div
          style={{
            flex: "0 1 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Link
            href={routes.contact}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "52px",
              padding: "0 24px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              textDecoration: "none",
              whiteSpace: "nowrap",
              background: "#D3AF34",
              color: "#021A54",
            }}
          >
            Get a quote
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <DemoButton
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "52px",
              padding: "0 24px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.32)",
              color: "#FFFFFF",
              font: "inherit",
              fontSize: "16px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            Book a demo
          </DemoButton>
        </div>
      </div>
    </section>
  );
}
