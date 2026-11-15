/**
 * API Integrations page, section by section.
 *
 * Converted from design/source/website-NsApi.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { LiveProjectLink } from "@/components/site/live-project-link";
import { Faq } from "@/components/site/faq";
import { routes } from "@/lib/routes";

export function ApiIntegrationsPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <WhatWeConnectSection />
      <FewerGapsBetweenYourSection />
      <BuiltForTheRealSection />
      <SixStepsFromIdeaSection />
      <StandardsYourPartnersAlreadySection />
      <ACompleteTravelBookingSection />
      <FrequentlyAskedQuestionsSection />
      <LetSConnectYourSection />
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
            API integrations
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
              {"API & payment integrations"}
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
              Connect the systems your business{" "}
              <span style={{ color: "#D3AF34" }}>already runs on.</span>
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
              GDS providers, payment gateways, CRMs and custom APIs, connected
              securely, with webhooks and error handling that keep bookings and
              payments in sync.
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
            <div
              style={{
                color: "#021A54",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "18px",
                boxShadow:
                  "0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid #EEF2F7",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={{ margin: "0", fontSize: "15px", fontWeight: "600" }}>
                  Integrations
                </p>
                <span style={{ fontSize: "12px", color: "#5A6882" }}>
                  Your platform
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 20px",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Amadeus API
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#5A6882",
                    }}
                  >
                    {"Flight search, pricing & booking"}
                  </span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#E7F6EC",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  In production
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 20px",
                  borderTop: "1px solid #EEF2F7",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Stripe
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#5A6882",
                    }}
                  >
                    {"Checkout, payment links & webhooks"}
                  </span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#E7F6EC",
                    color: "#166534",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  In production
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 20px",
                  borderTop: "1px solid #EEF2F7",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Sabre API
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#5A6882",
                    }}
                  >
                    GDS content and booking
                  </span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#F1F5FA",
                    color: "#3E4C66",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  Available
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 20px",
                  borderTop: "1px solid #EEF2F7",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    CRM
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#5A6882",
                    }}
                  >
                    Leads, customers and follow-ups
                  </span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#F1F5FA",
                    color: "#3E4C66",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  Available
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 20px",
                  borderTop: "1px solid #EEF2F7",
                }}
              >
                <span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    Custom REST API
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#5A6882",
                    }}
                  >
                    Built and documented for your partners
                  </span>
                </span>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "#F1F5FA",
                    color: "#3E4C66",
                    fontSize: "12px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                  }}
                >
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatWeConnectSection() {
  return (
    <section id="integrations" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
            Integrations
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
            What we connect.
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
            Amadeus and Stripe run in production on FlyConnect today. The others
            we scope and build with you.
          </p>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#E7F6EC",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                In production
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Amadeus API
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Flight search, pricing and booking, live on FlyConnect.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#F1F5FA",
                  color: "#3E4C66",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Available
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Sabre API
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              GDS content and booking for agencies that work with Sabre.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#E7F6EC",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                In production
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Stripe payments
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Checkout, payment links and webhooks, live on FlyConnect.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
                  <rect width="20" height="12" x="2" y="6" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#F1F5FA",
                  color: "#3E4C66",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Available
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Payment gateway integrations
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Other gateways and local payment methods, connected to your
              checkout.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#F1F5FA",
                  color: "#3E4C66",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Available
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              CRM integrations
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Leads, customers and follow-ups kept in sync with your CRM.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#F1F5FA",
                  color: "#3E4C66",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Available
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Custom REST API development
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              APIs built and documented for your apps and partners.
            </p>
          </div>
          <div
            style={{
              padding: "24px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
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
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                </svg>
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "#F1F5FA",
                  color: "#3E4C66",
                  fontSize: "12px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                }}
              >
                Available
              </span>
            </div>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Third-party software integrations
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Email, file storage, accounting and the other tools you use.
            </p>
          </div>
          <Link
            href={routes.contact}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              padding: "32px",
              borderRadius: "18px",
              background:
                "radial-gradient(120% 120% at 100% 0%, #0C3584 0%, #021A54 60%)",
              color: "#FFFFFF",
              textDecoration: "none",
            }}
          >
            <div>
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
                Something else?
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#C9D5EA",
                }}
              >
                Tell us which systems you use. We will check what is possible
                and how long it takes.
              </p>
            </div>
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
              Ask about an integration
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

function FewerGapsBetweenYourSection() {
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
            Fewer gaps between your systems.
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
              Payments succeed, but bookings or orders are not updated.
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
              Webhooks keep every system in sync.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Payment events are confirmed by webhooks, and amounts are always
              calculated on the server.
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
              Staff copy data from one system to another.
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
              Integrations that move data for you.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Records sync between your platform, payment provider and CRM, with
              scheduled jobs for routine tasks.
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
              Partners want access to your data, but there is no API.
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
              A documented REST API.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Secure endpoints with authentication, validation and OpenAPI
              documentation your partners can use.
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
              Handling card data feels risky.
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
              Card details stay with Stripe.
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Customers enter card details into Stripe’s secure fields, so they
              are never stored on your servers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuiltForTheRealSection() {
  return (
    <section
      id="how"
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
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
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
              How we build integrations
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
              Built for the real world.
            </h2>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              APIs time out, prices change and webhooks can arrive twice. We
              design for that from day one.
            </p>
            <div
              style={{
                marginTop: "28px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                  stroke="#846E21"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ flexShrink: "0", marginTop: "2px" }}
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Sandbox first, then production
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
                Validation on every request
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
                Clear error handling and logging
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
                Rate limiting and security headers
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
                Caching where the data allows
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
                OpenAPI documentation
              </span>
            </div>
          </div>
          <div style={{ flex: "1 1 440px", minWidth: "0" }}>
            <div
              style={{
                borderRadius: "18px",
                background: "#01123D",
                color: "#E6ECF7",
                overflow: "hidden",
                boxShadow: "0 24px 48px -28px rgba(2,26,84,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "14px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#C5D0EA",
                  }}
                >
                  Example request
                </span>
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: "rgba(74,222,128,0.14)",
                    color: "#4ADE80",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  200 OK
                </span>
              </div>
              <pre
                aria-label="Example API request and response"
                style={{
                  margin: "0",
                  padding: "18px",
                  overflowX: "auto",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  whiteSpace: "pre",
                }}
              >
                <span style={{ color: "#D3AF34" }}>{"POST"}</span>
                {" /v1/bookings/confirm\n"}
                <span style={{ color: "#9FB0D6" }}>
                  {"Authorization: Bearer ••••••••"}
                </span>
                {
                  '\n\n{\n  "offerId": "OF-48213",\n  "priceCheck": "passed",\n  "payment": "succeeded"\n}\n\n'
                }
                <span style={{ color: "#9FB0D6" }}>{"// response"}</span>
                {
                  '\n{\n  "status": "BOOKING_CONFIRMED",\n  "reference": "FC-10482"\n}'
                }
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SixStepsFromIdeaSection() {
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
            Our integration process
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
            Six steps from idea to live integration.
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
              Map
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Systems, data and events mapped.
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
              Sandbox
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Built and tested against test accounts.
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
              Secure
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Authentication, validation and rate limits.
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
              Test
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              End-to-end tests, including failure cases.
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
              Switched to production and monitored.
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
              Document
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              OpenAPI docs and handover.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

function StandardsYourPartnersAlreadySection() {
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
            Standards your partners already know.
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
              APIs
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
                REST
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
                OpenAPI (Swagger)
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
                JSON
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
              Security
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
                JWT authentication
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
                Security headers
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
              Providers
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
                Amadeus
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
                Sabre
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
                CRMs
              </span>
            </div>
          </div>
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
              Relevant project · Integrations
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
              Live Amadeus search and booking, Stripe checkout and payment
              links, webhooks, email delivery and file storage, connected in one
              platform.
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

function FrequentlyAskedQuestionsSection() {
  return (
    <section
      id="faq"
      style={{
        padding: "clamp(64px, 8vw, 112px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <h2
          style={{
            margin: "0",
            textAlign: "center",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(32px, 4vw, 48px)",
            lineHeight: "1.08",
            letterSpacing: "-0.03em",
            fontWeight: "700",
          }}
        >
          Frequently asked questions
        </h2>
        <Faq
          style={{
            marginTop: "44px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
          items={[
            {
              question: "Can you connect Stripe to my existing website?",
              answer: (
                <>
                  Yes. We add checkout or payment links to your current site and
                  connect webhooks, so orders and payments stay in sync.
                </>
              ),
            },
            {
              question: "Do you work with payment gateways other than Stripe?",
              answer: (
                <>
                  Yes. Stripe is what runs on FlyConnect, and we integrate other
                  gateways on request.
                </>
              ),
            },
            {
              question: "Can you build an API for our partners?",
              answer: (
                <>
                  Yes. We design secure REST endpoints with authentication and
                  validation, documented with OpenAPI.
                </>
              ),
            },
            {
              question: "What about Sabre?",
              answer: (
                <>
                  Sabre integration is available as a service. We scope the
                  content and booking flows you need, then build and test them
                  with you.
                </>
              ),
            },
            {
              question: "Do you provide documentation?",
              answer: (
                <>
                  Yes. Every API we build comes with OpenAPI documentation and
                  handover notes.
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

function LetSConnectYourSection() {
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
            Let’s connect your systems.
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
            Tell us which tools you use and what should talk to what. We will
            map it out and give you an estimate.
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
