/**
 * Travel Technology page, section by section.
 *
 * Converted from design/source/website-NsTravel.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { LiveProjectLink } from "@/components/site/live-project-link";
import { routes } from "@/lib/routes";

export function TravelTechnologyPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <TwoWaysToStartSection />
      <EverythingATravelBusinessSection />
      <BuiltForTheHardSection />
      <SearchToETicketSection />
      <ProvenToolsChosenForSection />
      <SixStepsNoSurprisesSection />
      <ACompleteTravelBookingSection />
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
        // The biggest thing in view: load it straight away.
        loading="eager"
        fetchPriority="high"
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
            Travel Technology
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
              {"Travel technology · Amadeus & Sabre"}
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
              Our specialty: booking platforms{" "}
              <span style={{ color: "#D3AF34" }}>that sell.</span>
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
              We built a complete Amadeus-powered booking and agency platform,
              so we know where the hard parts are: live fares, price changes,
              ticketing and agent commissions.
            </p>
            <div
              style={{
                marginTop: "32px",
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
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px 24px",
                fontSize: "14px",
                color: "#C5D0EA",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D3AF34"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Amadeus live on FlyConnect
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D3AF34"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Sabre integration available
              </span>
            </div>
          </div>
          <div
            style={{ flex: "1 1 460px", minWidth: "0", position: "relative" }}
          >
            <div style={{ padding: "0 0 0 clamp(0px, 3vw, 40px)" }}>
              <div style={{ position: "relative", color: "#021A54" }}>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E1E8F2",
                    borderRadius: "16px",
                    boxShadow:
                      "0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}
                  >
                    <span
                      style={{
                        padding: "8px 14px",
                        borderRadius: "999px",
                        background: "#021A54",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      Return
                    </span>
                    <span
                      style={{
                        padding: "8px 14px",
                        borderRadius: "999px",
                        background: "#F1F5FA",
                        color: "#3E4C66",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      One way
                    </span>
                    <span
                      style={{
                        padding: "8px 14px",
                        borderRadius: "999px",
                        background: "#F1F5FA",
                        color: "#3E4C66",
                        fontSize: "13px",
                        fontWeight: "500",
                      }}
                    >
                      Multi-city
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "16px",
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 14px",
                        border: "1px solid #E1E8F2",
                        borderRadius: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0",
                          fontSize: "11px",
                          color: "#5A6882",
                        }}
                      >
                        From
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        London (LHR)
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "12px 14px",
                        border: "1px solid #E1E8F2",
                        borderRadius: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0",
                          fontSize: "11px",
                          color: "#5A6882",
                        }}
                      >
                        To
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        Dubai (DXB)
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "12px 14px",
                        border: "1px solid #E1E8F2",
                        borderRadius: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0",
                          fontSize: "11px",
                          color: "#5A6882",
                        }}
                      >
                        Depart · Return
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        14 Dec · 21 Dec
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "12px 14px",
                        border: "1px solid #E1E8F2",
                        borderRadius: "12px",
                      }}
                    >
                      <p
                        style={{
                          margin: "0",
                          fontSize: "11px",
                          color: "#5A6882",
                        }}
                      >
                        Travellers
                      </p>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontSize: "15px",
                          fontWeight: "600",
                        }}
                      >
                        2 adults · Economy
                      </p>
                    </div>
                  </div>{" "}
                  <span
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "48px",
                      borderRadius: "10px",
                      background: "#021A54",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: "600",
                    }}
                  >
                    Search flights
                  </span>
                </div>
                <div className="contents max-site:hidden">
                  <div
                    style={{
                      position: "absolute",
                      right: "-16px",
                      top: "-30px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 16px",
                      background: "#FFFFFF",
                      border: "1px solid #E1E8F2",
                      borderRadius: "14px",
                      boxShadow: "0 24px 48px -14px rgba(0,5,22,0.55)",
                      color: "#021A54",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#E7F6EC",
                        color: "#166534",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Fare re-checked
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          color: "#5A6882",
                        }}
                      >
                        £512.00 · price unchanged
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TwoWaysToStartSection() {
  return (
    <section id="start" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
              color: "#846E21",
            }}
          >
            Service overview
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
            Two ways to start.
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
            Add travel technology to the website you already have, or launch a
            complete platform from scratch.
          </p>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "32px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                color: "#846E21",
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
                <path d="M12 22v-5" />
                <path d="M9 8V2" />
                <path d="M15 8V2" />
                <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
              </svg>
            </span>
            <h3
              style={{
                margin: "22px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                letterSpacing: "-0.02em",
                fontWeight: "700",
              }}
            >
              Add it to your current website
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Keep the site you have. We add flight search, pricing and booking
              from Amadeus or Sabre, styled to match your brand.
            </p>
            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Search, fare rules and pricing
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Booking and ticketing flow
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Payments with Stripe
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Your existing design and content
              </span>
            </div>
            <Link
              href={routes.contact}
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "15px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              Discuss an integration
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
          <div
            style={{
              padding: "32px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                color: "#846E21",
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
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </span>
            <h3
              style={{
                margin: "22px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                letterSpacing: "-0.02em",
                fontWeight: "700",
              }}
            >
              Launch a complete booking platform
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A customer booking website plus a B2B dashboard for staff, agents
              and sub-agents, with payments, finance tools and reporting.
            </p>
            <div
              style={{
                marginTop: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Customer booking website (B2C)
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Agent and sub-agent portal (B2B)
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Refunds, invoices and ledger
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Staff and agent performance reports
              </span>
            </div>
            <Link
              href={routes.contact}
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "15px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              Plan your platform
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
      </div>
    </section>
  );
}

function EverythingATravelBusinessSection() {
  return (
    <section
      id="features"
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
              color: "#846E21",
            }}
          >
            {"Features & capabilities"}
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
            Everything a travel business needs to sell online.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
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
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Amadeus API integration
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Live flight search, pricing and booking. In production on
                FlyConnect.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <circle cx="18" cy="18" r="3" />
                <circle cx="6" cy="6" r="3" />
                <path d="M6 21V9a9 9 0 0 0 9 9" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Sabre GDS integration
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                GDS content and booking for agencies that work with Sabre.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Flight booking websites
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Search, filtered results, fare rules, passenger details and
                checkout.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <rect width="20" height="14" x="2" y="6" rx="2" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Travel agency management systems
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Bookings, staff, branches, discounts and airline blackouts in
                one admin.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                B2B and B2C travel portals
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                A public booking site for customers and a separate portal for
                trade partners.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <path d="M2 21a8 8 0 0 1 10.434-7.62" />
                <circle cx="10" cy="8" r="5" />
                <circle cx="18" cy="18" r="3" />
                <path d="m19.5 14.3-.4.9" />
                <path d="m16.9 20.8-.4.9" />
                <path d="m21.7 19.5-.9-.4" />
                <path d="m15.2 16.9-.9-.4" />
                <path d="m21.7 16.5-.9.4" />
                <path d="m15.2 19.1-.9.4" />
                <path d="m19.5 21.7-.4-.9" />
                <path d="m16.9 15.2-.4-.9" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Agent and sub-agent management
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Own logins, permissions, payment links and bookings for every
                agent.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Flight search and booking engines
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                One-way, return and multi-city search, with flexible dates.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <path d="M10 22v-6.57" />
                <path d="M12 11h.01" />
                <path d="M12 7h.01" />
                <path d="M14 15.43V22" />
                <path d="M15 16a5 5 0 0 0-6 0" />
                <path d="M16 11h.01" />
                <path d="M16 7h.01" />
                <path d="M8 11h.01" />
                <path d="M8 7h.01" />
                <rect x="4" y="2" width="16" height="20" rx="2" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Hotel booking systems
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Hotel search and booking, added to your platform or built on its
                own.
              </p>
            </div>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
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
                color: "#846E21",
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
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Custom travel management software
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Group bookings, queues, tracking and the workflows your team
                runs every day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuiltForTheHardSection() {
  return (
    <section
      id="problems"
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
              color: "#846E21",
            }}
          >
            Business problems solved
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
            Built for the hard parts of selling travel.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Fares change between search and payment, and customers are charged
              the wrong price.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              Price and availability are checked again before the card is
              charged.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Payment is taken only after the fare is confirmed, and the booking
              is then registered with the GDS.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Agents and sub-agents share logins, and nobody knows who booked
              what.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              Every agent gets their own login, permissions and bookings.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Four roles (super-admin, staff, agent and sub-agent), with
              sub-agents limited to their own bookings and payment links.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Tickets and confirmations are sent by hand.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              E-tickets, receipts and emails go out automatically.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Booking confirmations, e-tickets, payment receipts, cancellations
              and refunds each have their own email and PDF.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Phone and agent bookings cannot be paid online.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              Staff send secure Stripe payment links.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Staff and agents create a payment link for the booking, and the
              amount is always worked out on the server.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Refunds, invoices and profit live in spreadsheets.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              Finance tools are built into the dashboard.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Cancellations, refunds, credit notes, invoices, a ledger, sales
              summaries and customer profitability.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              The problem
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "16px",
                lineHeight: "1.55",
                color: "#23324F",
              }}
            >
              Managers cannot see how staff and agents are performing.
            </p>
            <div
              style={{ margin: "20px 0", height: "1px", background: "#E8EDF4" }}
            />
            <p
              style={{
                margin: "0",
                display: "flex",
                gap: "8px",
                alignItems: "center",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#846E21",
              }}
            >
              How we solve it
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "18px",
                lineHeight: "1.4",
                fontWeight: "700",
                color: "#021A54",
              }}
            >
              14 report types, from sales to agent vs staff.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Booking, sales, refund, invoice and performance reports, plus
              website vs app comparisons.
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
              color: "#846E21",
            }}
          >
            The booking flow we built
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
            Search to e-ticket, without the gaps.
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
            This is the flow running on FlyConnect, and the one we bring to your
            platform.
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

function ProvenToolsChosenForSection() {
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
              color: "#846E21",
            }}
          >
            Technology stack
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
            Proven tools, chosen for reliability.
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
              Travel APIs
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
                Sabre API
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
                Airline and airport data
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
                Express
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
                Redis caching
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
                Next.js
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
              Payments and documents
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
                Stripe
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
                Webhooks
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
                PDF e-tickets
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
                Transactional email
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SixStepsNoSurprisesSection() {
  return (
    <section
      id="process"
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
              color: "#846E21",
            }}
          >
            Our development process
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
            Six steps. No surprises.
          </h2>
        </div>
        <ol
          style={{
            listStyle: "none",
            margin: "56px 0 0",
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
              Discover
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Routes, fares, roles and payment rules agreed.
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
              Design
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Booking flow and dashboard as a clickable prototype.
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
              Build
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Short cycles with regular demos.
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
              Integrate
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Amadeus or Sabre, Stripe and email, tested end to end.
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
              Launch
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Deployment, QA, handover and staff training.
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
              Support
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Maintenance and new features as you grow.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function ACompleteTravelBookingSection() {
  return (
    <section id="work" style={{ padding: "clamp(40px, 6vw, 72px) 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 40px)",
        }}
      >
        <div
          style={{
            borderRadius: "28px",
            background:
              "radial-gradient(80% 120% at 100% 0%, #0C3584 0%, #021A54 60%)",
            color: "#FFFFFF",
            overflow: "hidden",
            padding: "clamp(28px, 5vw, 56px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(28px, 5vw, 56px)",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 460px", minWidth: "0" }}>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#D3AF34",
              }}
            >
              Relevant project · Travel technology
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "22px",
                fontWeight: "700",
                letterSpacing: "-0.01em",
              }}
            >
              FlyConnect
            </p>
            <h2
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(28px, 3.2vw, 40px)",
                lineHeight: "1.1",
                letterSpacing: "-0.03em",
                fontWeight: "700",
              }}
            >
              A complete travel booking platform, built end to end.
            </h2>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#C9D5EA",
              }}
            >
              A public booking website for customers and a B2B dashboard for
              staff, agents and sub-agents, with live Amadeus flights, Stripe
              payments, finance tools and reporting.
            </p>
            <div
              style={{
                marginTop: "28px",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <Link
                href={routes.caseStudies}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "50px",
                  padding: "0 22px",
                  borderRadius: "10px",
                  background: "#FFFFFF",
                  color: "#021A54",
                  fontSize: "15px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Read the case study
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
              <LiveProjectLink
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "50px",
                  padding: "0 22px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "#FFFFFF",
                  fontSize: "15px",
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
              </LiveProjectLink>
            </div>
          </div>
          <div
            style={{
              flex: "1 1 340px",
              minWidth: "0",
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                padding: "20px 22px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "34px",
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
                padding: "20px 22px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "34px",
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
                padding: "20px 22px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "34px",
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
            <div
              style={{
                padding: "20px 22px",
                borderRadius: "16px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "34px",
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
