/**
 * Home page, section by section.
 *
 * Converted from design/source/website-Light.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { Faq } from "@/components/site/faq";
import { QuoteForm } from "@/components/site/forms/quote-form";
import { techStack } from "@/components/site/tech-stack";
import { routes } from "@/lib/routes";

export function HomePage() {
  return (
    <div className="design-page">
      <HeroSection />
      <TechStackSection />
      <EverythingYouNeedToSection />
      <OurSpecialtyBookingPlatformsSection />
      <FromAFastWebsiteSection />
      <SeeItClickItSection />
      <ConnectTheSystemsYourSection />
      <ACompleteTravelBookingSection />
      <SixStepsNoSurprisesSection />
      <ATechnologyPartnerNotSection />
      <WhatOurClientsSaySection />
      <FrequentlyAskedQuestionsSection />
      <TechStack2Section />
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
          top: "clamp(60px, 8vw, 120px)",
          width: "max(1400px, 130%)",
          maxWidth: "none",
          transform: "translateX(-30%)",
          opacity: "0.3",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          maxWidth: "1240px",
          margin: "0 auto",
          padding:
            "clamp(48px, 8vw, 104px) clamp(20px, 4vw, 40px) clamp(56px, 8vw, 112px)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(48px, 6vw, 72px)",
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
            {"We design, develop & integrate"}
          </p>
          <h1
            style={{
              margin: "22px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(40px, 5.4vw, 72px)",
              lineHeight: "1.03",
              letterSpacing: "-0.035em",
              fontWeight: "700",
              color: "#FFFFFF",
            }}
          >
            Your Business Idea. Our Technology.{" "}
            <span style={{ color: "#D3AF34" }}>One Powerful Solution.</span>
          </h1>
          <p
            style={{
              margin: "24px 0 0",
              maxWidth: "540px",
              fontSize: "clamp(17px, 1.5vw, 19px)",
              lineHeight: "1.6",
              color: "#C5D0EA",
            }}
          >
            We design, develop and integrate custom digital products, travel
            booking platforms, and business management systems that help
            companies scale.
          </p>
          <div
            style={{
              marginTop: "34px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <Link
              href={routes.solutions}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "52px",
                padding: "0 24px",
                borderRadius: "10px",
                background: "#D3AF34",
                color: "#021A54",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Explore Our Solutions
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
            <Link
              href={routes.contact}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "52px",
                padding: "0 24px",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.32)",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Start Your Project
            </Link>
          </div>
          <div
            style={{
              marginTop: "36px",
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
              Live Amadeus booking platform shipped
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
              Design to deployment, one team
            </span>
          </div>
        </div>
        <div
          style={{
            flex: "1 1 520px",
            minWidth: "0",
            position: "relative",
            padding: "0 0 0 clamp(0px, 4vw, 56px)",
          }}
        >
          <div
            style={{
              position: "relative",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              boxShadow:
                "0 40px 80px -24px rgba(0,5,22,0.6), 0 10px 24px -10px rgba(0,5,22,0.4)",
              overflow: "hidden",
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
                Bookings overview
              </p>
              <span style={{ fontSize: "12px", color: "#5A6882" }}>
                This week
              </span>
            </div>
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div
                  style={{
                    flex: "1 1 110px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#F6F9FF",
                  }}
                >
                  <p
                    style={{ margin: "0", fontSize: "12px", color: "#5A6882" }}
                  >
                    Bookings
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    186
                  </p>
                </div>
                <div
                  style={{
                    flex: "1 1 110px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#F6F9FF",
                  }}
                >
                  <p
                    style={{ margin: "0", fontSize: "12px", color: "#5A6882" }}
                  >
                    Revenue
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    £71.4k
                  </p>
                </div>
                <div
                  style={{
                    flex: "1 1 110px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#F6F9FF",
                  }}
                >
                  <p
                    style={{ margin: "0", fontSize: "12px", color: "#5A6882" }}
                  >
                    Agents active
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontFamily: "var(--font-heading)",
                      fontSize: "24px",
                      fontWeight: "700",
                    }}
                  >
                    12
                  </p>
                </div>
              </div>
              <div
                aria-hidden="true"
                style={{
                  height: "96px",
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "8px",
                  padding: "0 4px",
                  borderBottom: "1px solid #EEF2F7",
                }}
              >
                <div
                  style={{
                    flex: "1",
                    height: "40%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "55%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "48%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "72%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "64%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "88%",
                    borderRadius: "4px 4px 0 0",
                    background: "#D3AF34",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "60%",
                    borderRadius: "4px 4px 0 0",
                    background: "#DCE6F7",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "10px 0",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>FC-10482</span>
                  <span style={{ color: "#3E4C66" }}>LHR → JFK</span>
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
                    Confirmed
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "10px 0",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>FC-10481</span>
                  <span style={{ color: "#3E4C66" }}>MAN → DXB</span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "999px",
                      background: "#FEF3E2",
                      color: "#9A3412",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    On hold
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    padding: "10px 0",
                    borderTop: "1px solid #EEF2F7",
                  }}
                >
                  <span style={{ fontWeight: "600" }}>FC-10479</span>
                  <span style={{ color: "#3E4C66" }}>LGW → IST</span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: "999px",
                      background: "rgba(211,175,52,0.13)",
                      color: "#887122",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Ticketed
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="contents max-site:hidden">
            <div
              style={{
                position: "absolute",
                left: "-8px",
                bottom: "-48px",
                width: "210px",
                padding: "14px",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "22px",
                boxShadow: "0 28px 56px -16px rgba(0,5,22,0.6)",
              }}
            >
              <p style={{ margin: "0", fontSize: "11px", color: "#5A6882" }}>
                London → New York
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: "var(--font-heading)",
                  fontSize: "18px",
                  fontWeight: "700",
                }}
              >
                <span>09:30</span>
                <span>12:35</span>
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "#5A6882",
                }}
              >
                <span>LHR</span>
                <span>8h 05m · Direct</span>
                <span>JFK</span>
              </p>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "18px",
                    fontWeight: "700",
                  }}
                >
                  £486
                </span>
                <span
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    background: "#D3AF34",
                    color: "#021A54",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  Select
                </span>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                right: "-16px",
                top: "-28px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "14px",
                boxShadow: "0 24px 48px -14px rgba(0,5,22,0.55)",
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
                  Payment received
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#5A6882",
                  }}
                >
                  £1,284.00 · via Stripe
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section style={{ padding: "clamp(40px, 5vw, 56px) 0" }}>
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
          {"Trusted technology & development expertise"}
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
                color: "#6B7891",
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

function EverythingYouNeedToSection() {
  return (
    <section
      id="solutions"
      style={{
        padding: "clamp(72px, 9vw, 120px) 0",
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
            {"Products & solutions"}
          </p>
          <h2
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(32px, 4vw, 50px)",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              fontWeight: "700",
            }}
          >
            Everything you need to launch, run and grow online.
          </h2>
          <p
            style={{
              margin: "18px auto 0",
              maxWidth: "600px",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            Start from a ready-made product, build something custom, or connect
            the systems you already use.
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
            }}
          >
            <span
              style={{
                width: "48px",
                height: "48px",
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
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </span>{" "}
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
          </div>
          <div
            style={{
              padding: "32px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <span
              style={{
                width: "48px",
                height: "48px",
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
                <path d="m16 18 6-6-6-6" />
                <path d="m8 6-6 6 6 6" />
              </svg>
            </span>{" "}
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
          </div>
          <div
            style={{
              padding: "32px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "18px",
            }}
          >
            <span
              style={{
                width: "48px",
                height: "48px",
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
                <path d="M12 22v-5" />
                <path d="M9 8V2" />
                <path d="M15 8V2" />
                <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
              </svg>
            </span>{" "}
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
          </div>
        </div>
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          <Link
            href={routes.travel}
            className="ns-lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              minHeight: "64px",
              padding: "0 20px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "14px",
              color: "#021A54",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {"Travel & booking"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#887122"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={routes.websiteDevelopment}
            className="ns-lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              minHeight: "64px",
              padding: "0 20px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "14px",
              color: "#021A54",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            Website development
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#887122"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={routes.uiUxDesign}
            className="ns-lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              minHeight: "64px",
              padding: "0 20px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "14px",
              color: "#021A54",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            UI/UX design
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#887122"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={routes.apiIntegrations}
            className="ns-lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              minHeight: "64px",
              padding: "0 20px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "14px",
              color: "#021A54",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            {"API & integrations"}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#887122"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={routes.websiteDevelopment}
            className="ns-lift"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              minHeight: "64px",
              padding: "0 20px",
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "14px",
              color: "#021A54",
              textDecoration: "none",
              fontSize: "15px",
              fontWeight: "600",
            }}
          >
            Custom software
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#887122"
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
        <div style={{ marginTop: "28px", textAlign: "center" }}>
          <Link
            href={routes.solutions}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
              textDecoration: "none",
            }}
          >
            {"Explore all products & solutions"}
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
    </section>
  );
}

function OurSpecialtyBookingPlatformsSection() {
  return (
    <section id="travel" style={{ padding: "clamp(72px, 9vw, 120px) 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
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
              color: "#887122",
            }}
          >
            {"Travel technology · Amadeus & Sabre"}
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
            Our specialty: booking platforms that sell.
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            We built a complete Amadeus-powered booking and agency platform, so
            we know where the hard parts are: live fares, price changes,
            ticketing and agent commissions.
          </p>
          <div
            style={{
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px 24px",
              fontSize: "15px",
              color: "#23324F",
            }}
          >
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              Amadeus API integration
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              Sabre GDS integration
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              Flight booking websites
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              {"B2B & B2C travel portals"}
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              {"Agent & sub-agent management"}
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              Agency management systems
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              {"Flight search & booking engines"}
            </span>
            <span
              style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
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
              Hotel booking systems
            </span>
          </div>
          <div
            style={{
              marginTop: "32px",
              padding: "20px 22px",
              borderRadius: "14px",
              background: "#F6F9FF",
              border: "1px solid #E1E8F2",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#23324F",
            }}
          >
            <strong>Two ways to start:</strong> add Amadeus or Sabre to your
            existing travel website, or launch a complete booking platform from
            scratch.
          </div>{" "}
          <Link
            href={routes.travel}
            style={{
              marginTop: "28px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
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
            flex: "1 1 440px",
            minWidth: "0",
            padding: "clamp(20px, 3vw, 32px)",
            borderRadius: "22px",
            background: "linear-gradient(160deg, #EEF3FC 0%, #F8FAFD 100%)",
            border: "1px solid #E1E8F2",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              boxShadow: "0 20px 40px -20px rgba(2,26,84,0.2)",
              padding: "20px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                <p style={{ margin: "0", fontSize: "11px", color: "#5A6882" }}>
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
                <p style={{ margin: "0", fontSize: "11px", color: "#5A6882" }}>
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
                <p style={{ margin: "0", fontSize: "11px", color: "#5A6882" }}>
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
                <p style={{ margin: "0", fontSize: "11px", color: "#5A6882" }}>
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
          <div
            style={{
              marginTop: "14px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#23324F",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#16A34A",
                }}
              />
              Amadeus · live on FlyConnect
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#23324F",
              }}
            >
              Fare re-checked before payment
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FromAFastWebsiteSection() {
  return (
    <section
      id="services"
      style={{
        padding: "clamp(72px, 9vw, 120px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
          display: "flex",
          flexWrap: "wrap-reverse",
          alignItems: "center",
          gap: "clamp(40px, 6vw, 80px)",
        }}
      >
        <div style={{ flex: "1 1 440px", minWidth: "0" }}>
          <div
            style={{
              border: "1px solid #E1E8F2",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 24px 48px -24px rgba(2,26,84,0.25)",
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
        <div style={{ flex: "1 1 460px", minWidth: "0" }}>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            {"Websites & custom software"}
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
            From a fast website to a full business system.
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            Whether you need a brand-new site, a redesign, or software that
            replaces spreadsheets, we build it to fit your process.
          </p>
          <div
            style={{
              marginTop: "28px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
                Website development
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.85",
                  color: "#3E4C66",
                }}
              >
                Business websites
                <br />
                E-commerce websites
                <br />
                SaaS platforms
                <br />
                Custom web applications
                <br />
                Landing pages
                <br />
                Admin dashboards
                <br />
                Customer portals
              </p>
            </div>
            <div>
              <p style={{ margin: "0", fontSize: "15px", fontWeight: "700" }}>
                Custom software
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.85",
                  color: "#3E4C66",
                }}
              >
                Business management systems
                <br />
                Inventory management
                <br />
                Booking management
                <br />
                SaaS development
                <br />
                Enterprise dashboards
                <br />
                Automation solutions
              </p>
            </div>
          </div>{" "}
          <Link
            href={routes.websiteDevelopment}
            style={{
              marginTop: "28px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
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
      </div>
    </section>
  );
}

function SeeItClickItSection() {
  return (
    <section
      id="design"
      style={{
        padding: "clamp(72px, 9vw, 120px) 0",
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
          gap: "clamp(40px, 6vw, 80px)",
        }}
      >
        <div style={{ flex: "1 1 460px", minWidth: "0" }}>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            UI/UX design
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
            See it, click it, approve it, before we build it.
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            Every project starts with user flows and a clickable Figma
            prototype, so decisions are made early, when they are cheap to
            change.
          </p>
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <span
              style={{
                padding: "9px 14px",
                borderRadius: "999px",
                background: "#F1F5FA",
                fontSize: "14px",
                color: "#23324F",
              }}
            >
              Website UI/UX
            </span>
            <span
              style={{
                padding: "9px 14px",
                borderRadius: "999px",
                background: "#F1F5FA",
                fontSize: "14px",
                color: "#23324F",
              }}
            >
              Figma prototypes
            </span>
            <span
              style={{
                padding: "9px 14px",
                borderRadius: "999px",
                background: "#F1F5FA",
                fontSize: "14px",
                color: "#23324F",
              }}
            >
              Dashboard design
            </span>
            <span
              style={{
                padding: "9px 14px",
                borderRadius: "999px",
                background: "#F1F5FA",
                fontSize: "14px",
                color: "#23324F",
              }}
            >
              Mobile app design
            </span>
            <span
              style={{
                padding: "9px 14px",
                borderRadius: "999px",
                background: "#F1F5FA",
                fontSize: "14px",
                color: "#23324F",
              }}
            >
              Responsive web design
            </span>
          </div>{" "}
          <Link
            href={routes.uiUxDesign}
            style={{
              marginTop: "28px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
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
            flex: "1 1 440px",
            minWidth: "0",
            position: "relative",
            padding: "28px",
            borderRadius: "22px",
            background: "#F6F9FF",
            border: "1px solid #E1E8F2",
            backgroundImage: "radial-gradient(#D5DDE9 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <div
            aria-hidden="true"
            style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}
          >
            <div
              style={{
                flex: "1.4 1 0",
                minWidth: "0",
                position: "relative",
                padding: "14px",
                background: "#FFFFFF",
                border: "2px solid #D3AF34",
                borderRadius: "8px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "-2px",
                  top: "-26px",
                  padding: "3px 8px",
                  borderRadius: "4px 4px 0 0",
                  background: "#D3AF34",
                  color: "#021A54",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                Checkout · Desktop
              </span>{" "}
              <div
                style={{
                  height: "10px",
                  width: "50%",
                  borderRadius: "3px",
                  background: "#021A54",
                }}
              />
              <div
                style={{
                  marginTop: "12px",
                  height: "34px",
                  borderRadius: "6px",
                  border: "1px solid #E1E8F2",
                }}
              />
              <div
                style={{
                  marginTop: "8px",
                  height: "34px",
                  borderRadius: "6px",
                  border: "1px solid #E1E8F2",
                }}
              />
              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                <div
                  style={{
                    flex: "1",
                    height: "34px",
                    borderRadius: "6px",
                    border: "1px solid #E1E8F2",
                  }}
                />
                <div
                  style={{
                    flex: "1",
                    height: "34px",
                    borderRadius: "6px",
                    border: "1px solid #E1E8F2",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "14px",
                  height: "36px",
                  borderRadius: "6px",
                  background: "#D3AF34",
                }}
              />
            </div>
            <div
              style={{
                flex: "0.8 1 0",
                minWidth: "0",
                padding: "10px",
                background: "#FFFFFF",
                border: "1px solid #D5DDE9",
                borderRadius: "18px",
              }}
            >
              <div
                style={{
                  height: "6px",
                  width: "36%",
                  margin: "0 auto 10px",
                  borderRadius: "3px",
                  background: "#D5DDE9",
                }}
              />
              <div
                style={{
                  height: "64px",
                  borderRadius: "8px",
                  background: "rgba(211,175,52,0.13)",
                }}
              />
              <div
                style={{
                  marginTop: "8px",
                  height: "8px",
                  width: "70%",
                  borderRadius: "3px",
                  background: "#D5DDE9",
                }}
              />
              <div
                style={{
                  marginTop: "6px",
                  height: "8px",
                  width: "50%",
                  borderRadius: "3px",
                  background: "#D5DDE9",
                }}
              />
              <div
                style={{
                  marginTop: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  background: "#D3AF34",
                }}
              />
            </div>
          </div>{" "}
          <span
            style={{
              marginTop: "18px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "999px 999px 999px 4px",
              background: "#021A54",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            Your feedback here
          </span>
        </div>
      </div>
    </section>
  );
}

function ConnectTheSystemsYourSection() {
  return (
    <section
      id="integrations"
      style={{
        padding: "clamp(72px, 9vw, 120px) 0",
        borderTop: "1px solid #E8EDF4",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
          display: "flex",
          flexWrap: "wrap-reverse",
          alignItems: "center",
          gap: "clamp(40px, 6vw, 80px)",
        }}
      >
        <div
          style={{
            flex: "1 1 440px",
            minWidth: "0",
            background: "#FFFFFF",
            border: "1px solid #E1E8F2",
            borderRadius: "18px",
            boxShadow: "0 24px 48px -28px rgba(2,26,84,0.25)",
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
                style={{ display: "block", fontSize: "12px", color: "#5A6882" }}
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
                style={{ display: "block", fontSize: "12px", color: "#5A6882" }}
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
                style={{ display: "block", fontSize: "12px", color: "#5A6882" }}
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
                style={{ display: "block", fontSize: "12px", color: "#5A6882" }}
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
                style={{ display: "block", fontSize: "12px", color: "#5A6882" }}
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
        <div style={{ flex: "1 1 460px", minWidth: "0" }}>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            {"API & payment integrations"}
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
            Connect the systems your business already runs on.
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#3E4C66",
            }}
          >
            GDS providers, payment gateways, CRMs and custom APIs, connected
            securely, with webhooks and error handling that keep bookings and
            payments in sync.
          </p>
          <p
            style={{
              margin: "24px 0 0",
              fontSize: "15px",
              lineHeight: "1.85",
              color: "#23324F",
            }}
          >
            Amadeus API · Sabre API · Stripe payments · Payment gateway
            integrations · CRM integrations · Custom REST APIs · Third-party
            software
          </p>{" "}
          <Link
            href={routes.apiIntegrations}
            style={{
              marginTop: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
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
          }}
        >
          <div
            style={{
              padding: "clamp(28px, 5vw, 64px)",
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(32px, 5vw, 64px)",
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
                  margin: "18px 0 0",
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
                  margin: "10px 0 0",
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(30px, 3.6vw, 44px)",
                  lineHeight: "1.1",
                  letterSpacing: "-0.03em",
                  fontWeight: "700",
                }}
              >
                A complete travel booking platform, built end to end.
              </h2>
              <p
                style={{
                  margin: "18px 0 0",
                  fontSize: "17px",
                  lineHeight: "1.6",
                  color: "#C9D5EA",
                }}
              >
                A public booking website for customers and a B2B dashboard for
                staff, agents and sub-agents for a UK travel business, with live
                Amadeus flights, Stripe payments, finance tools and reporting.
              </p>
              <div
                style={{
                  marginTop: "26px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "10px 24px",
                  fontSize: "15px",
                  color: "#E6ECF7",
                }}
              >
                <span>{"✓  Live Amadeus search & booking"}</span>
                <span>{"✓  Stripe checkout & payment links"}</span>
                <span>{"✓  Agent & sub-agent portals"}</span>
                <span>✓  Role-based permissions</span>
                <span>{"✓  Group bookings & queues"}</span>
                <span>{"✓  Refunds, invoices & ledger"}</span>
                <span>✓  Real-time chat</span>
                <span>{"✓  PDF e-tickets & emails"}</span>
              </div>
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
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </a>
                <Link
                  href={routes.caseStudies}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
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
                  Read the case study
                </Link>
              </div>
            </div>
            <div
              style={{
                flex: "1 1 380px",
                minWidth: "0",
                minHeight: "300px",
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              borderTop: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <div
              style={{
                padding: "28px clamp(24px, 4vw, 48px)",
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
                padding: "28px clamp(24px, 4vw, 48px)",
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
                padding: "28px clamp(24px, 4vw, 48px)",
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
            <div style={{ padding: "28px clamp(24px, 4vw, 48px)" }}>
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

function SixStepsNoSurprisesSection() {
  return (
    <section id="process" style={{ padding: "clamp(72px, 9vw, 120px) 0" }}>
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

function ATechnologyPartnerNotSection() {
  return (
    <section
      id="about"
      style={{
        padding: "clamp(72px, 9vw, 120px) 0",
        background: "#F6F9FF",
        borderTop: "1px solid #E8EDF4",
        borderBottom: "1px solid #E8EDF4",
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
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
          }}
        >
          <div style={{ maxWidth: "640px" }}>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#887122",
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
              A technology partner, not just a vendor.
            </h2>
          </div>
          <Link
            href={routes.contact}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "48px",
              padding: "0 20px",
              borderRadius: "10px",
              background: "#021A54",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            Talk to our team
          </Link>
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
            <span style={{ color: "#887122" }}>
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
            <span style={{ color: "#887122" }}>
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
            <span style={{ color: "#887122" }}>
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
            <span style={{ color: "#887122" }}>
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
            <span style={{ color: "#887122" }}>
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
            <span style={{ color: "#887122" }}>
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
        <div style={{ marginTop: "28px" }}>
          <Link
            href={routes.about}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              minHeight: "44px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#887122",
              textDecoration: "none",
            }}
          >
            More about FlyConnect Tech
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
    </section>
  );
}

function WhatOurClientsSaySection() {
  return (
    <section id="testimonials" style={{ padding: "clamp(72px, 9vw, 120px) 0" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 40px)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: "0",
              fontSize: "14px",
              fontWeight: "600",
              color: "#887122",
            }}
          >
            Client testimonials
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
            What our clients say
          </h2>
          <p style={{ margin: "14px 0 0", fontSize: "14px", color: "#5A6882" }}>
            {
              "Placeholder content. Real quotes are added with each client's permission."
            }
          </p>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: "16px",
          }}
        >
          <figure
            style={{
              margin: "0",
              padding: "28px",
              border: "1px dashed #C8D3E3",
              borderRadius: "16px",
              background: "#FFFFFF",
            }}
          >
            <blockquote
              style={{
                margin: "0",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#23324F",
              }}
            >
              “[Client testimonial about the project and results.]”
            </blockquote>
            <figcaption
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#E8EDF4",
                }}
              />
              <span style={{ fontSize: "14px", color: "#3E4C66" }}>
                [Client name]
                <br />
                [Role, Company]
              </span>
            </figcaption>
          </figure>
          <figure
            style={{
              margin: "0",
              padding: "28px",
              border: "1px dashed #C8D3E3",
              borderRadius: "16px",
              background: "#FFFFFF",
            }}
          >
            <blockquote
              style={{
                margin: "0",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#23324F",
              }}
            >
              “[Client testimonial about the project and results.]”
            </blockquote>
            <figcaption
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#E8EDF4",
                }}
              />
              <span style={{ fontSize: "14px", color: "#3E4C66" }}>
                [Client name]
                <br />
                [Role, Company]
              </span>
            </figcaption>
          </figure>
          <figure
            style={{
              margin: "0",
              padding: "28px",
              border: "1px dashed #C8D3E3",
              borderRadius: "16px",
              background: "#FFFFFF",
            }}
          >
            <blockquote
              style={{
                margin: "0",
                fontSize: "17px",
                lineHeight: "1.6",
                color: "#23324F",
              }}
            >
              “[Client testimonial about the project and results.]”
            </blockquote>
            <figcaption
              style={{
                marginTop: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#E8EDF4",
                }}
              />
              <span style={{ fontSize: "14px", color: "#3E4C66" }}>
                [Client name]
                <br />
                [Role, Company]
              </span>
            </figcaption>
          </figure>
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
        padding: "clamp(72px, 9vw, 120px) 0",
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
                "Can you integrate Amadeus or Sabre into my existing travel website?",
              answer: (
                <>
                  Yes. We connect flight search, pricing and booking to your
                  current site, or build a new booking flow alongside it,
                  without rebuilding everything.
                </>
              ),
            },
            {
              question:
                "Can you build a complete booking platform from scratch?",
              answer: (
                <>
                  Yes. FlyConnect is one: a customer booking site, an agent
                  dashboard, payments, finance tools and reporting.
                </>
              ),
            },
            {
              question: "Do you redesign existing websites?",
              answer: (
                <>
                  Yes. We review what you have, redesign it in Figma, then
                  rebuild it on a fast, modern stack.
                </>
              ),
            },
            {
              question: "How long does a project take?",
              answer: (
                <>
                  It depends on scope. A business website usually takes [X–Y
                  weeks]; a booking platform [X–Y months]. Your quote includes a
                  timeline.
                </>
              ),
            },
            {
              question: "Do you work with international clients?",
              answer: (
                <>
                  Yes. We work remotely with businesses worldwide, across time
                  zones.
                </>
              ),
            },
            {
              question: "What do you need to prepare a quote?",
              answer: (
                <>
                  Your project type, requirements, budget range and contact
                  details. The form below takes about two minutes.
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

function TechStack2Section() {
  return (
    <section
      id="contact"
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
          padding: "clamp(64px, 9vw, 112px) clamp(20px, 4vw, 40px)",
          display: "flex",
          flexWrap: "wrap",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 380px", minWidth: "0" }}>
          <h2
            style={{
              margin: "0",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(34px, 4.6vw, 56px)",
              lineHeight: "1.05",
              letterSpacing: "-0.035em",
              fontWeight: "700",
            }}
          >
            Ready to build something great?
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: "460px",
              fontSize: "18px",
              lineHeight: "1.6",
              color: "#C9D5EA",
            }}
          >
            Tell us about your project. We reply with next steps, a rough scope
            and an estimate within [X business days].
          </p>
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: "16px",
            }}
          >
            <a
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "44px",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4ADE80"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              Chat on WhatsApp · [+00 000 000 0000]
            </a>
            <a
              href="#contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "44px",
                color: "#FFFFFF",
                textDecoration: "none",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D3AF34"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              [hello@yourdomain.com]
            </a>
            <DemoButton
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                minHeight: "44px",
                padding: "0",
                border: "none",
                background: "transparent",
                color: "#FFFFFF",
                font: "inherit",
                fontSize: "16px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span style={{ display: "inline-flex", color: "#D3AF34" }}>
                <svg
                  width="20"
                  height="20"
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
              </span>
              <span>
                Prefer a live walkthrough?{" "}
                <span
                  style={{
                    color: "#D3AF34",
                    fontWeight: "600",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Book a demo
                </span>
              </span>
            </DemoButton>
          </div>
        </div>
        <div
          id="quote"
          style={{
            flex: "1 1 440px",
            minWidth: "0",
            padding: "clamp(22px, 3vw, 36px)",
            background: "#FFFFFF",
            color: "#021A54",
            borderRadius: "20px",
          }}
        >
          <QuoteForm variant="short" />
        </div>
      </div>
    </section>
  );
}
