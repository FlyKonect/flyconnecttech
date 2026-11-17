/**
 * About page, section by section.
 *
 * Converted from design/source/website-NsAbout.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { LiveProjectLink } from "@/components/site/live-project-link";
import { techStack } from "@/components/site/tech-stack";
import { routes } from "@/lib/routes";

export function AboutPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <WeStartedWithTravelSection />
      <WhatWorkingWithUsSection />
      <HowWeWorkFromSection />
      <TechStackSection />
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
            About
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
              About us
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
              A technology partner,{" "}
              <span style={{ color: "#D3AF34" }}>not just a vendor.</span>
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
              We design, develop and integrate digital solutions that grow your
              business, from ready-made products to custom software and API
              integrations.
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
                Talk to our team
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
          <div
            style={{ flex: "1 1 460px", minWidth: "0", position: "relative" }}
          >
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "16px",
                boxShadow:
                  "0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)",
                overflow: "hidden",
                color: "#021A54",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "16px 20px",
                  borderBottom: "1px solid #EEF2F7",
                }}
              >
                <p style={{ margin: "0", fontSize: "15px", fontWeight: "600" }}>
                  FlyConnect Tech at a glance
                </p>
                <span style={{ fontSize: "12px", color: "#5A6882" }}>
                  Design · Build · Integrate
                </span>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "13px 20px",
                    borderTop: "none",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flex: "none",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(211,175,52,0.13)",
                      color: "#846E21",
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
                      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                    </svg>
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: "0" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      FlyConnect travel platform shipped
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Live Amadeus booking, B2C and B2B
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "13px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flex: "none",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(211,175,52,0.13)",
                      color: "#846E21",
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
                      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
                    </svg>
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: "0" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Design to deployment
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      UI/UX, frontend, backend and integrations
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "13px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flex: "none",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(211,175,52,0.13)",
                      color: "#846E21",
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
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: "0" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Typed, tested stacks
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Next.js, TypeScript, Node.js, PostgreSQL
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "13px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flex: "none",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(211,175,52,0.13)",
                      color: "#846E21",
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
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                      <path d="M2 12h20" />
                    </svg>
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: "0" }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Remote and international
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Working with businesses across time zones
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WeStartedWithTravelSection() {
  return (
    <section id="story" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: "clamp(40px, 6vw, 80px)",
          }}
        >
          <div style={{ flex: "1 1 460px", minWidth: "0" }}>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
              }}
            >
              Our story
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
              We started with travel. We build for every industry.
            </h2>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Our team built FlyConnect, a complete travel booking platform with
              a customer website, an agent dashboard, live Amadeus flights,
              Stripe payments, finance tools and reporting.
            </p>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              That work is the foundation of what we offer today: ready-made
              products, custom software and websites, and API integrations, for
              travel agencies and for businesses in any industry.
            </p>
          </div>
          <div style={{ flex: "1 1 440px", minWidth: "0" }}>
            <div
              style={{
                padding: "8px clamp(24px, 3vw, 32px)",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                  padding: "22px 0",
                  borderTop: "none",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    fontFamily: "var(--font-heading)",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#846E21",
                  }}
                >
                  01
                </span>
                <div>
                  <p
                    style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}
                  >
                    Ready-made digital products
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#3E4C66",
                    }}
                  >
                    Booking engines, agency dashboards and business systems,
                    configured to your brand.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                  padding: "22px 0",
                  borderTop: "1px solid #E8EDF4",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    fontFamily: "var(--font-heading)",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#846E21",
                  }}
                >
                  02
                </span>
                <div>
                  <p
                    style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}
                  >
                    Custom software and websites
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#3E4C66",
                    }}
                  >
                    Websites, SaaS platforms and web apps built around how you
                    work.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                  padding: "22px 0",
                  borderTop: "1px solid #E8EDF4",
                }}
              >
                <span
                  style={{
                    flex: "none",
                    fontFamily: "var(--font-heading)",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#846E21",
                  }}
                >
                  03
                </span>
                <div>
                  <p
                    style={{ margin: "0", fontSize: "18px", fontWeight: "700" }}
                  >
                    API integrations and business solutions
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#3E4C66",
                    }}
                  >
                    GDS, payments, CRMs and third-party tools in one reliable
                    system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatWorkingWithUsSection() {
  return (
    <section
      id="why"
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
            Why choose us
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
            What working with us is like.
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
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
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
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Proven travel-tech depth
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A working Amadeus booking platform shipped, not just a prototype.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
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
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Design to deployment
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              UI/UX, frontend, backend and integrations from one team.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Built to scale
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Typed, tested stacks: Next.js, TypeScript, Node.js, PostgreSQL.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
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
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Secure by design
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Role-based access, and card data handled by Stripe, never stored
              by you.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Clear scope and estimates
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Know what is built, when, and at what cost before we start.
            </p>
          </div>
          <div
            style={{
              padding: "28px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <span style={{ color: "#846E21" }}>
              <svg
                width="24"
                height="24"
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
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Direct communication
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Work directly with the people building your product.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowWeWorkFromSection() {
  return (
    <section
      id="process"
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
            Our process
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
            How we work, from first call to launch.
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
              Requirements, scope and estimate agreed.
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
              Flows and a clickable Figma prototype.
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
              Payments, GDS and APIs tested end to end.
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
              Deployment, QA, handover and training.
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
              Maintenance and ongoing improvements.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section
      style={{
        padding: "clamp(40px, 5vw, 56px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px 40px",
        }}
      >
        <p
          style={{
            margin: "0",
            maxWidth: "220px",
            fontSize: "14px",
            fontWeight: "600",
            lineHeight: "1.45",
            color: "#23324F",
          }}
        >
          Technology we work with
        </p>
        <div
          style={{
            flex: "1 1 600px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px 32px",
          }}
        >
          {techStack.map((t) => (
            <span
              key={t.label}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "19px",
                fontWeight: "600",
                letterSpacing: "-0.01em",
                color: "#69768F",
              }}
            >
              {t.label}
            </span>
          ))}
        </div>
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
              Our flagship project · Travel technology
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
              A public booking website and a B2B dashboard for staff, agents and
              sub-agents, with live Amadeus flights, Stripe payments, finance
              tools and reporting.
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
