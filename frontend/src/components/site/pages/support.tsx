/**
 * Support page, section by section.
 *
 * Converted from design/source/website-NsSupport.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { Faq } from "@/components/site/faq";
import { routes } from "@/lib/routes";

export function SupportPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <OnePlaceForEverySection />
      <FromInvitationToFixedSection />
      <FrequentlyAskedQuestionsSection />
      <NotAClientYetSection />
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
            Support
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
              Client support
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
              Help for the projects{" "}
              <span style={{ color: "#D3AF34" }}>we build for you.</span>
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
              Already working with us? Sign in to the client portal to send a
              support request, follow its progress and reply to the team.
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
                href={routes.portalSignIn}
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
                Sign in to the client portal
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
                href={routes.portalInvitation}
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
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  color: "#FFFFFF",
                }}
              >
                Open my invitation
              </Link>
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
                  Your client portal
                </p>
                <span style={{ fontSize: "12px", color: "#5A6882" }}>
                  Requests · updates · replies
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
                      color: "#887122",
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
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                      <path d="M13 5v2" />
                      <path d="M13 17v2" />
                      <path d="M13 11v2" />
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
                      Send a support request
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Choose the project, the type and the priority
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
                      color: "#887122",
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
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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
                      Follow every update
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Status changes and replies by email
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
                      color: "#887122",
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
                      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
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
                      Talk to your project team
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Reply and attach screenshots or files
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
                      color: "#887122",
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
                      <path d="m9 12 2 2 4-4" />
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
                      Confirm the fix
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#5A6882",
                      }}
                    >
                      Close the request, or reopen it
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

function OnePlaceForEverySection() {
  return (
    <section id="requests" style={{ padding: "clamp(64px, 8vw, 112px) 0" }}>
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
            What you can request
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
            One place for every request.
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
            Pick the project and the request type when you send it. The team
            replies in the same conversation, and you get an email at every
            update.
          </p>
        </div>
        <div
          style={{
            marginTop: "48px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Technical Issue
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Something is not working as expected.
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
                <path d="m8 2 1.88 1.88" />
                <path d="M14.12 3.88 16 2" />
                <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                <path d="M12 20v-9" />
                <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                <path d="M6 13H2" />
                <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                <path d="M22 13h-4" />
                <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Bug Report
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              An error you can reproduce.
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
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Feature Request
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Something new you would like added.
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
                <path d="M12 22v-5" />
                <path d="M9 8V2" />
                <path d="M15 8V2" />
                <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Integration Problem
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              API, GDS or payment issues.
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
                <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
                <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
                <path d="m2.3 2.3 7.286 7.286" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Design Modification
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Changes to layout, content or styles.
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
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              General Inquiry
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Questions about your project.
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
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </span>
            <p
              style={{
                margin: "16px 0 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Maintenance Request
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Updates, renewals and routine work.
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
                Planning a new project?
              </p>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#C9D5EA",
                }}
              >
                Tell us about it and we will send next steps, a rough scope and
                an estimate.
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

function FromInvitationToFixedSection() {
  return (
    <section
      id="how"
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
            How support works
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
            From invitation to fixed.
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
              Get your invitation
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              When your project starts, we create your account and email you an
              invitation.
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
              Set your password
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Open the invitation, verify your email and choose a password.
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
              Send a request
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Choose the project, describe the issue and add screenshots.
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
              Track and confirm
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                lineHeight: "1.55",
                color: "#3E4C66",
              }}
            >
              Follow every update, reply to the team and confirm the fix.
            </p>
          </li>
        </ol>
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
              question: "How do I get an account?",
              answer: (
                <>
                  Our team creates it when your project starts and emails you an
                  invitation to verify your address and set a password. There is
                  no public sign-up.
                </>
              ),
            },
            {
              question: "I cannot find my invitation email",
              answer: (
                <>
                  Check your spam folder first. If it is not there, send us a
                  message from the Contact page and we will send a new
                  invitation.
                </>
              ),
            },
            {
              question: "Which projects can I send requests for?",
              answer: (
                <>
                  Every project linked to your account. Each project belongs to
                  one client account.
                </>
              ),
            },
            {
              question: "What if something is urgent?",
              answer: (
                <>
                  Choose Urgent priority when you send the request. The team is
                  alerted straight away.
                </>
              ),
            },
            {
              question: "Are you on the FlyConnect Tech team?",
              answer: (
                <>
                  Use{" "}
                  <Link
                    href={routes.teamSignIn}
                    style={{
                      color: "#887122",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Team sign in
                  </Link>{" "}
                  with your work email and your two-factor code.
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

function NotAClientYetSection() {
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
            Not a client yet?
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
            Get a quote for your project, or book a demo to see what we build.
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
