/**
 * Website Development page, section by section.
 *
 * Converted from design/source/website-NsWebsite.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { LiveProjectLink } from "@/components/site/live-project-link";
import { routes } from "@/lib/routes";

export function WebsiteDevelopmentPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <StartWhereYourBusinessSection />
      <WhatWeBuildSection />
      <TheDetailsThatMakeSection />
      <SoftwareThatFixesHowSection />
      <ModernTypedAndBuiltSection />
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
          <Link
            href={routes.services}
            style={{ color: "#C5D0EA", textDecoration: "none" }}
          >
            Services
          </Link>
          <span aria-hidden="true" style={{ color: "#6F82AE" }}>
            /
          </span>
          <span
            aria-current="page"
            style={{ color: "#FFFFFF", fontWeight: "500" }}
          >
            Website development
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
              Website development
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
              From a fast website to a{" "}
              <span style={{ color: "#D3AF34" }}>full business system.</span>
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
              Whether you need a brand-new site, a redesign, or software that
              replaces spreadsheets, we build it to fit your process.
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
          </div>
          <div
            style={{ flex: "1 1 460px", minWidth: "0", position: "relative" }}
          >
            <div style={{ color: "#021A54" }}>
              <div
                style={{
                  border: "1px solid #E1E8F2",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow:
                    "0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)",
                  background: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    height: "36px",
                    padding: "0 14px",
                    background: "#F6F9FF",
                    borderBottom: "1px solid #E8EDF4",
                  }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#D5DDE9",
                    }}
                  />
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#D5DDE9",
                    }}
                  />
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "#D5DDE9",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: "12px",
                      flex: "1",
                      height: "18px",
                      borderRadius: "6px",
                      background: "#FFFFFF",
                      border: "1px solid #E8EDF4",
                    }}
                  />
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "90px",
                        height: "12px",
                        borderRadius: "4px",
                        background: "#021A54",
                      }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "8px",
                          borderRadius: "4px",
                          background: "#D5DDE9",
                        }}
                      />
                      <div
                        style={{
                          width: "40px",
                          height: "8px",
                          borderRadius: "4px",
                          background: "#D5DDE9",
                        }}
                      />
                      <div
                        style={{
                          width: "56px",
                          height: "20px",
                          borderRadius: "6px",
                          background: "#D3AF34",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "26px 22px",
                      borderRadius: "12px",
                      background: "#F1F5FB",
                    }}
                  >
                    <div
                      style={{
                        width: "70%",
                        height: "16px",
                        borderRadius: "4px",
                        background: "#021A54",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "10px",
                        width: "50%",
                        height: "16px",
                        borderRadius: "4px",
                        background: "#021A54",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "14px",
                        width: "80%",
                        height: "8px",
                        borderRadius: "4px",
                        background: "#C8D3E3",
                      }}
                    />
                    <div
                      style={{
                        marginTop: "16px",
                        width: "110px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "#D3AF34",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        height: "70px",
                        borderRadius: "10px",
                        border: "1px solid #E8EDF4",
                      }}
                    />
                    <div
                      style={{
                        height: "70px",
                        borderRadius: "10px",
                        border: "1px solid #E8EDF4",
                      }}
                    />
                    <div
                      style={{
                        height: "70px",
                        borderRadius: "10px",
                        border: "1px solid #E8EDF4",
                      }}
                    />
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

function StartWhereYourBusinessSection() {
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
            Start where your business is today.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
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
              A new website
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A fast, SEO-ready site that explains what you sell and turns
              visitors into enquiries.
            </p>
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
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
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
              A website redesign
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              We review your current site, redesign it in Figma and rebuild it
              on a modern stack, keeping what already works.
            </p>
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
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
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
              Software that replaces spreadsheets
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A web application with the roles, data and workflows your team
              uses every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatWeBuildSection() {
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
            What we build.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "clamp(24px, 3vw, 32px)",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              <h3
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "22px",
                  letterSpacing: "-0.02em",
                  fontWeight: "700",
                }}
              >
                Website development
              </h3>
            </div>
            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "none",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Business websites
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Clear service pages, quote forms and WhatsApp contact.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    E-commerce websites
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Product catalogues, cart and secure checkout.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    SaaS platforms
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Accounts, plans and multi-user access.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Custom web applications
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Tools built around one specific workflow.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Landing pages
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Fast, focused pages for campaigns and launches.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Admin dashboards
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Manage content, users, orders and data.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Customer portals
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Self-service accounts, bookings and documents.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "clamp(24px, 3vw, 32px)",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              <h3
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "22px",
                  letterSpacing: "-0.02em",
                  fontWeight: "700",
                }}
              >
                Custom software
              </h3>
            </div>
            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "none",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Business management systems
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Customers, staff, branches and permissions in one place.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Inventory management
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Stock levels, locations and movements.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Booking management
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Calendars, availability and confirmations.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    SaaS development
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Your idea, built as a product you can sell.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Enterprise dashboards
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    KPIs and reports across teams and branches.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0",
                  borderTop: "1px solid #EEF2F7",
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
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Automation solutions
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Scheduled jobs, emails and documents generated for you.
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

function TheDetailsThatMakeSection() {
  return (
    <section
      id="included"
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
            Included as standard
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
            The details that make a site work.
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
                <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
                <path d="M10 19v-3.96 3.15" />
                <path d="M7 19h5" />
                <rect width="6" height="10" x="16" y="12" rx="2" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Responsive on every screen
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Designed and tested for phones, tablets and desktops.
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
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                SEO-ready
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Metadata, readable page structure and fast-loading pages.
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Secure sign-in
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Role-based access, hashed passwords and one-time codes where
                needed.
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
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Admin area
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Update content, users and data without a developer.
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
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Online payments
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Stripe checkout and payment links when you need them.
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
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
              </svg>
            </span>
            <div style={{ minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "17px", fontWeight: "700" }}>
                Reports and analytics
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#3E4C66",
                }}
              >
                Dashboards that show what is selling and who is performing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftwareThatFixesHowSection() {
  return (
    <section
      id="problems"
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
            Software that fixes how work gets done.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
              Your website looks dated, and visitors leave without getting in
              touch.
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
              A modern site with clear calls to action.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Quote forms, WhatsApp contact and service pages that explain what
              you sell.
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
              Work runs on spreadsheets, email and memory.
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
              One system for your data and workflows.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Roles, permissions and dashboards, with scheduled jobs that handle
              routine work.
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
              Customers call or email for every update.
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
              A customer portal for self-service.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Customers see and manage their own bookings, documents and
              payments.
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
              You cannot see what is happening across the business.
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
              Dashboards and reports built in.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Sales, bookings, refunds and performance, by staff, branch or
              channel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernTypedAndBuiltSection() {
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
            Modern, typed and built to scale.
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
                React
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
              Backend and data
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
                Redis
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
              Quality and security
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
                Automated tests
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
                Input validation
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
                OpenAPI docs
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
                Transactional email
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
                Cloud file storage
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
                CRMs
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
              Goals, pages, features and budget agreed.
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
              Sitemap, flows and a clickable Figma prototype.
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
              Payments, forms, CRM and analytics connected.
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
              Relevant project · Web platform
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
              A public booking website and a B2B dashboard on one platform: 46
              data models, 4 user roles and 14 report types.
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
