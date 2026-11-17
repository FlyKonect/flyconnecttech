/**
 * Contact page, section by section.
 *
 * Converted from design/source/website-NsContact.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { ContactForms } from "@/components/site/forms/contact-forms";
import { contactEmail, contactEmailHref } from "@/lib/contact";
import { routes } from "@/lib/routes";

export function ContactPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <TechStackSection />
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
            Contact
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
          <div style={{ flex: "1 1 480px", minWidth: "0", maxWidth: "860px" }}>
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
              {"Contact & quotes"}
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
              Tell us about{" "}
              <span style={{ color: "#D3AF34" }}>your project.</span>
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
              Get a quote, ask a question or book a demo. We reply with next
              steps, a rough scope and an estimate within 5 business days.
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
                href="#form"
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
                Start your quote
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
              </a>
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
        </div>
      </div>
    </section>
  );
}

function TechStackSection() {
  return (
    <section id="form" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
            flexDirection: "row-reverse",
            flexWrap: "wrap",
            gap: "clamp(40px, 6vw, 72px)",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "1.4 1 520px", minWidth: "0" }}>
            <div
              style={{
                padding: "clamp(22px, 3vw, 36px)",
                background: "#FFFFFF",
                border: "1px solid #E1E8F2",
                borderRadius: "20px",
                boxShadow: "0 30px 60px -36px rgba(2,26,84,0.35)",
              }}
            >
              <ContactForms />
            </div>
          </div>
          <div style={{ flex: "1 1 340px", minWidth: "0" }}>
            <p
              style={{
                margin: "0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#846E21",
              }}
            >
              Other ways to reach us
            </p>
            <h2
              style={{
                margin: "12px 0 0",
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(28px, 3vw, 36px)",
                lineHeight: "1.12",
                letterSpacing: "-0.03em",
                fontWeight: "700",
              }}
            >
              Talk to the people who will build it.
            </h2>
            <div style={{ marginTop: "20px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  padding: "18px 0",
                  borderTop: "1px solid #E8EDF4",
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
                    background: "#F6F9FF",
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
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Email
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    <a
                      href={contactEmailHref}
                      style={{
                        color: "inherit",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      {contactEmail}
                    </a>
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  padding: "18px 0",
                  borderTop: "1px solid #E8EDF4",
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
                    background: "#F6F9FF",
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
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Book a demo
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    30-minute video call with our team
                  </p>
                  <DemoButton
                    style={{
                      marginTop: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      minHeight: "40px",
                      padding: "0",
                      border: "none",
                      background: "transparent",
                      color: "#846E21",
                      font: "inherit",
                      fontSize: "15px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Pick a time
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
                  </DemoButton>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  padding: "18px 0",
                  borderTop: "1px solid #E8EDF4",
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
                    background: "#F6F9FF",
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
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Response time
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Within 5 business days, Monday to Friday
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
