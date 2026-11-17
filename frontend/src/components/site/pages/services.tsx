/**
 * Services page, section by section.
 *
 * Converted from design/source/website-NsServices.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { LiveProjectLink } from "@/components/site/live-project-link";
import { techStack } from "@/components/site/tech-stack";
import { routes } from "@/lib/routes";

export function ServicesPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <EverythingWeOfferEndSection />
      <NoHandOffsBetweenSection />
      <SixStepsNoSurprisesSection />
      <TechStackSection />
      <ACompleteTravelBookingSection />
      <HaveAProjectInSection />
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
            Services
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
              Services
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
              Design, development and integration,{" "}
              <span style={{ color: "#D3AF34" }}>from one team.</span>
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
              Pick one service or the whole journey, from the first Figma
              prototype to a live platform with payments and APIs.
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
                  Your project
                </p>
                <span style={{ fontSize: "12px", color: "#5A6882" }}>
                  Design to launch
                </span>
              </div>
              <div aria-hidden="true">
                <div style={{ padding: "14px 20px", borderTop: "none" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      UI/UX design
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "#E7F6EC",
                        color: "#166534",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Approved
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      height: "6px",
                      borderRadius: "3px",
                      background: "#EEF2F7",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "#16A34A",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      Frontend
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "rgba(211,175,52,0.13)",
                        color: "#846E21",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      In progress
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      height: "6px",
                      borderRadius: "3px",
                      background: "#EEF2F7",
                    }}
                  >
                    <div
                      style={{
                        width: "70%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "#D3AF34",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      {"Backend & APIs"}
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "rgba(211,175,52,0.13)",
                        color: "#846E21",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      In progress
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      height: "6px",
                      borderRadius: "3px",
                      background: "#EEF2F7",
                    }}
                  >
                    <div
                      style={{
                        width: "60%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "#D3AF34",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      Integrations
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "rgba(211,175,52,0.13)",
                        color: "#846E21",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      In progress
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      height: "6px",
                      borderRadius: "3px",
                      background: "#EEF2F7",
                    }}
                  >
                    <div
                      style={{
                        width: "35%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "#D3AF34",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    padding: "14px 20px",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      {"Launch & support"}
                    </span>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: "999px",
                        background: "#F1F5FA",
                        color: "#5A6882",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Planned
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: "10px",
                      height: "6px",
                      borderRadius: "3px",
                      background: "#EEF2F7",
                    }}
                  >
                    <div
                      style={{
                        width: "0%",
                        height: "6px",
                        borderRadius: "3px",
                        background: "#D5DDE9",
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

function EverythingWeOfferEndSection() {
  return (
    <section id="services" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
            What we do
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
            Everything we offer, end to end.
          </h2>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
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
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
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
              Travel technology
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Amadeus and Sabre integration, booking websites, agent portals and
              travel management systems.
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
                Amadeus and Sabre integration
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
                Flight and hotel booking
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
                B2B and B2C travel portals
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
              Explore travel technology
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
              Website development
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Business and e-commerce websites, SaaS platforms, web apps,
              dashboards and customer portals.
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
                Admin dashboards and portals
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
                <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                <path d="m2.3 2.3 7.286 7.286" />
                <circle cx="11" cy="11" r="2" />
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
              UI/UX design
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              User flows, clickable Figma prototypes and design systems for
              websites, dashboards and mobile apps.
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
                Website and dashboard design
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
                Figma prototypes
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
                Mobile app design
              </span>
            </div>
            <Link
              href={routes.uiUxDesign}
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
              Explore UI/UX design
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
              API integrations
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Payment gateways, GDS, CRMs and custom REST APIs, connected
              securely and kept in sync.
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
                CRM and third-party software
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
                Custom REST APIs
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
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
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
              Custom software
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              Business management, inventory and booking systems, enterprise
              dashboards and automation.
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
                Business management systems
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
                Inventory and booking management
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
                Automation solutions
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
              Explore custom software
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
                Not sure what you need?
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#C9D5EA",
                }}
              >
                Tell us your goal. We will recommend the right mix of design,
                development and integrations, with a clear estimate.
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

function NoHandOffsBetweenSection() {
  return (
    <section
      id="team"
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
              Why one team
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
              No hand-offs between agencies.
            </h2>
            <p
              style={{
                margin: "18px 0 0",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "#3E4C66",
              }}
            >
              The people who design your product also build and integrate it, so
              nothing gets lost between design, code and launch.
            </p>
            <div
              style={{
                marginTop: "28px",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: "12px 24px",
                fontSize: "16px",
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
                UI/UX, frontend, backend and integrations in one team
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
                Clear scope and estimates before we start
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
                Typed, tested code on Next.js, TypeScript, Node.js and
                PostgreSQL
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
                Work directly with the people building your product
              </span>
            </div>
          </div>
          <div style={{ flex: "1 1 440px", minWidth: "0" }}>
            <div
              style={{
                padding: "clamp(24px, 3vw, 32px)",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "18px",
              }}
            >
              <p
                style={{
                  margin: "0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "22px",
                  letterSpacing: "-0.02em",
                  fontWeight: "700",
                }}
              >
                On every project
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "14px 0 14px",
                  borderTop: "none",
                  marginTop: "8px",
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
                    A clickable prototype first
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    You see and approve the product before it is built.
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
                    Responsive interfaces
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Designed for phones, tablets and desktops.
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
                    Documented APIs
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    OpenAPI documentation for every API we build.
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
                    Automated tests
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Checks that keep features working as the product grows.
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
                    Deployment and handover
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Launch, training and the documentation your team needs.
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

function SixStepsNoSurprisesSection() {
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
              Featured project · Travel technology
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
              sub-agents: travel technology, web development and API
              integrations in one platform.
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

function HaveAProjectInSection() {
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
            Have a project in mind?
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
            Tell us what you want to build. We reply with next steps, a rough
            scope and an estimate within 5 business days.
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
