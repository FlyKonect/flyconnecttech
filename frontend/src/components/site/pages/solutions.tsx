/**
 * Solutions page, section by section.
 *
 * Converted from design/source/website-NsSolutions.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { Faq } from "@/components/site/faq";
import { routes } from "@/lib/routes";

export function SolutionsPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <ReadyMadeCustomOrSection />
      <TellUsWhereYouSection />
      <EveryProductAndServiceSection />
      <TwoStartingPointsOneSection />
      <ACompleteTravelBookingSection />
      <FrequentlyAskedQuestionsSection />
      <NotSureWhichOptionSection />
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
            {"Products & Solutions"}
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
              {"Products & solutions"}
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
              Everything you need to launch, run and{" "}
              <span style={{ color: "#D3AF34" }}>grow online.</span>
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
              Start from a ready-made product, build something custom, or
              connect the systems you already use. One team takes it from idea
              to launch.
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
                  Ready-made modules
                </p>
                <span style={{ fontSize: "12px", color: "#5A6882" }}>
                  Proven on FlyConnect
                </span>
              </div>
              <div aria-hidden="true">
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
                      {"Flight search & booking"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Live Amadeus fares and ticketing
                    </span>
                  </span>
                  <span
                    style={{
                      width: "40px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "999px",
                      background: "#D3AF34",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
                      {"Agent & sub-agent portal"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Own logins, roles and bookings
                    </span>
                  </span>
                  <span
                    style={{
                      width: "40px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "999px",
                      background: "#D3AF34",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
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
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
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
                      {"Payments & payment links"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Stripe checkout and links from staff
                    </span>
                  </span>
                  <span
                    style={{
                      width: "40px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "999px",
                      background: "#D3AF34",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
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
                      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 17.5v-11" />
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
                      {"Finance & invoicing"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Refunds, invoices and ledger
                    </span>
                  </span>
                  <span
                    style={{
                      width: "40px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "999px",
                      background: "#D3AF34",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
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
                      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                      <path d="M18 17V9" />
                      <path d="M13 17V5" />
                      <path d="M8 17v-3" />
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
                      {"Reports & analytics"}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      14 report types
                    </span>
                  </span>
                  <span
                    style={{
                      width: "40px",
                      height: "24px",
                      flex: "none",
                      borderRadius: "999px",
                      background: "#D3AF34",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: "3px",
                        right: "3px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "#FFFFFF",
                      }}
                    />
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
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
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
                      Your custom module
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Built around your process
                    </span>
                  </span>
                  <span
                    style={{
                      flex: "none",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px dashed #B8C3D6",
                      color: "#3E4C66",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    + Add
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

function ReadyMadeCustomOrSection() {
  return (
    <section id="capabilities" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
            Three ways we help
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
            Ready-made, custom, or connected.
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
            Most projects combine all three: a proven base, the features only
            your business needs, and integrations with the tools you already
            run.
          </p>
        </div>
        <div
          style={{
            marginTop: "56px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                <path d="M12 22V12" />
                <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                <path d="m7.5 4.27 9 5.15" />
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
              Ready-made digital products
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Booking engines, agency dashboards and business systems,
              configured to your brand and launched faster.
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
                Flight booking website
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
                {"Agent & sub-agent portal"}
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
                Payments, invoices and reports
              </span>
            </div>
            <Link
              href={routes.travel}
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
              Explore travel products
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
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
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
              {"Custom software & websites"}
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Websites, SaaS platforms and web apps engineered around how your
              business actually works.
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
                Business and e-commerce websites
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
                SaaS platforms and web apps
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
                Business management systems
              </span>
            </div>
            <Link
              href={routes.websiteDevelopment}
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
              Explore website development
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
              {"API integrations & business solutions"}
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              GDS, payments, CRMs and third-party tools connected into one
              reliable system.
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
                Amadeus and Sabre
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
                Stripe and payment gateways
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
                CRMs and custom REST APIs
              </span>
            </div>
            <Link
              href={routes.apiIntegrations}
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
              Explore API integrations
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

function TellUsWhereYouSection() {
  return (
    <section
      id="start"
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
            Where to start
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
            Tell us where you are. We take it from there.
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
          <Link
            href={routes.websiteDevelopment}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              A completely new website
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A fast, modern site that explains what you sell and turns visitors
              into enquiries.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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
          <Link
            href={routes.uiUxDesign}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              A redesign of your current website
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              We review what you have, redesign it in Figma, then rebuild it on
              a modern stack.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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
          <Link
            href={routes.travel}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Amadeus or Sabre in your travel website
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Add flight search, pricing and booking to the website you already
              run.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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
          <Link
            href={routes.travel}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
                <circle cx="6" cy="19" r="3" />
                <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                <circle cx="18" cy="5" r="3" />
              </svg>
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              A complete booking platform
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              A customer booking site, an agent dashboard, payments and reports,
              built from scratch.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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
          <Link
            href={routes.websiteDevelopment}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              Custom business software
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Replace spreadsheets with a system built around your process,
              roles and data.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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
          <Link
            href={routes.uiUxDesign}
            className="ns-lift"
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "26px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              color: "#021A54",
              textDecoration: "none",
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
                <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                <path d="m2.3 2.3 7.286 7.286" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </span>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              UI/UX design and development
            </p>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Flows and a clickable prototype first, then the build, by the same
              team.
            </p>
            <span
              style={{
                marginTop: "auto",
                paddingTop: "18px",
                display: "inline-flex",
                color: "#846E21",
              }}
            >
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

function EveryProductAndServiceSection() {
  return (
    <section
      id="catalogue"
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
            Solution catalogue
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
            Every product and service, in one place.
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
            Pick a single item, or combine several into one project.
          </p>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
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
                width: "40px",
                height: "40px",
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
                width="18"
                height="18"
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
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              {"Travel & booking"}
            </p>
            <ul
              style={{
                margin: "12px 0 0",
                padding: "0",
                listStyle: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#3E4C66",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Amadeus API integration</li>
              <li>Sabre GDS integration</li>
              <li>Flight booking websites</li>
              <li>Travel agency management systems</li>
              <li>B2B and B2C travel portals</li>
              <li>Agent and sub-agent management</li>
              <li>Flight search and booking engines</li>
              <li>Hotel booking systems</li>
              <li>Custom travel management software</li>
            </ul>
            <Link
              href={routes.travel}
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              View details
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
                width: "40px",
                height: "40px",
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
                width="18"
                height="18"
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
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Website development
            </p>
            <ul
              style={{
                margin: "12px 0 0",
                padding: "0",
                listStyle: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#3E4C66",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Business websites</li>
              <li>E-commerce websites</li>
              <li>SaaS platforms</li>
              <li>Custom web applications</li>
              <li>Landing pages</li>
              <li>Admin dashboards</li>
              <li>Customer portals</li>
            </ul>
            <Link
              href={routes.websiteDevelopment}
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              View details
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
                width: "40px",
                height: "40px",
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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                <path d="m2.3 2.3 7.286 7.286" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              UI/UX design
            </p>
            <ul
              style={{
                margin: "12px 0 0",
                padding: "0",
                listStyle: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#3E4C66",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Website UI/UX design</li>
              <li>Figma prototypes</li>
              <li>Dashboard design</li>
              <li>Mobile app design</li>
              <li>Responsive web design</li>
            </ul>
            <Link
              href={routes.uiUxDesign}
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              View details
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
                width: "40px",
                height: "40px",
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
                width="18"
                height="18"
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
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              {"API & integrations"}
            </p>
            <ul
              style={{
                margin: "12px 0 0",
                padding: "0",
                listStyle: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#3E4C66",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Amadeus API</li>
              <li>Sabre API</li>
              <li>Stripe payments</li>
              <li>Payment gateway integrations</li>
              <li>CRM integrations</li>
              <li>Custom REST API development</li>
              <li>Third-party software integrations</li>
            </ul>
            <Link
              href={routes.apiIntegrations}
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              View details
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
                width: "40px",
                height: "40px",
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
                width="18"
                height="18"
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
                fontSize: "17px",
                fontWeight: "700",
              }}
            >
              Custom software
            </p>
            <ul
              style={{
                margin: "12px 0 0",
                padding: "0",
                listStyle: "none",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#3E4C66",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <li>Business management systems</li>
              <li>Inventory management</li>
              <li>Booking management</li>
              <li>SaaS development</li>
              <li>Enterprise dashboards</li>
              <li>Automation solutions</li>
            </ul>
            <Link
              href={routes.websiteDevelopment}
              style={{
                marginTop: "auto",
                paddingTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "44px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
                textDecoration: "none",
              }}
            >
              View details
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

function TwoStartingPointsOneSection() {
  return (
    <section
      id="compare"
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
            Ready-made or custom?
          </p>
          <h2
            id="compare-heading"
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 48px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            Two starting points, one standard of quality.
          </h2>
        </div>
        {/* Scrolls sideways on phones, so keyboard users can reach it too. */}
        <div
          role="region"
          aria-labelledby="compare-heading"
          tabIndex={0}
          style={{
            marginTop: "48px",
            overflowX: "auto",
            border: "1px solid #E1E8F2",
            borderRadius: "18px",
            background: "#FFFFFF",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "640px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    fontSize: "14px",
                    verticalAlign: "bottom",
                    width: "22%",
                    color: "#5A6882",
                    fontWeight: "600",
                  }}
                >
                  Compare
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "700",
                    verticalAlign: "bottom",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
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
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                        <path d="M12 22V12" />
                        <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
                        <path d="m7.5 4.27 9 5.15" />
                      </svg>
                    </span>
                    Ready-made product
                  </span>
                </th>
                <th
                  scope="col"
                  style={{
                    padding: "16px 20px",
                    textAlign: "left",
                    fontSize: "14px",
                    fontWeight: "700",
                    verticalAlign: "bottom",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "32px",
                        height: "32px",
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
                        width="16"
                        height="16"
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
                    Custom build
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Best for
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Travel agencies that want to sell online quickly
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Businesses with processes no product covers
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Starting point
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Proven booking, agent, payment and reporting modules
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Your requirements, mapped into flows and a prototype
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Branding
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Your logo, colours, domain and content
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Designed from scratch around your brand
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Features
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Configured, then extended with what you need
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Everything built to your specification
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Timeline
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Shorter
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Longer
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    verticalAlign: "top",
                    fontWeight: "600",
                    color: "#021A54",
                    textAlign: "left",
                  }}
                >
                  Budget
                </th>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Lower upfront cost
                </td>
                <td
                  style={{
                    padding: "16px 20px",
                    borderTop: "1px solid #E8EDF4",
                    fontSize: "15px",
                    lineHeight: "1.5",
                    color: "#23324F",
                    verticalAlign: "top",
                  }}
                >
                  Scoped to your requirements
                </td>
              </tr>
            </tbody>
          </table>
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
              See it working · Travel technology
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
              A customer booking website and a B2B dashboard for staff, agents
              and sub-agents, with live Amadeus flights, Stripe payments,
              finance tools and reporting.
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
              <a
                href="https://dev.flyconnect.co.uk"
                target="_blank"
                rel="noopener"
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
              </a>
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
              question:
                "What is the difference between a ready-made product and a custom build?",
              answer: (
                <>
                  A ready-made product starts from proven modules, such as
                  booking, agent management, payments and reports, configured to
                  your brand. A custom build starts from your requirements and
                  is designed and built around them.
                </>
              ),
            },
            {
              question:
                "Can you combine ready-made modules with custom features?",
              answer: (
                <>
                  Yes. You can start from the modules you need and add the
                  features only your business has.
                </>
              ),
            },
            {
              question:
                "Can you work with the website or software we already have?",
              answer: (
                <>
                  Yes. We can redesign it, extend it, or connect it to new
                  systems such as Amadeus, Sabre, Stripe or your CRM.
                </>
              ),
            },
            {
              question: "How do we get started?",
              answer: (
                <>
                  Send a quote request or book a demo. We reply with next steps,
                  a rough scope and an estimate.
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

function NotSureWhichOptionSection() {
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
            Not sure which option fits?
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
            Tell us what you want to achieve. We will recommend the fastest
            route and give you a clear estimate.
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
