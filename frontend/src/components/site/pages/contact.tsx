/**
 * Contact page, section by section.
 *
 * Converted from design/source/website-NsContact.dc.html, keeping its
 * copy, order, colours and spacing. Edit it like any other component.
 */
import Image from "next/image";
import Link from "next/link";

import { DemoButton } from "@/components/site/demo/demo-button";
import { Faq } from "@/components/site/faq";
import { ContactForms } from "@/components/site/forms/contact-forms";
import { routes } from "@/lib/routes";

export function ContactPage() {
  return (
    <div className="design-page">
      <HeroSection />
      <TechStackSection />
      <FrequentlyAskedQuestionsSection />
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
              steps, a rough scope and an estimate within [X business days].
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
                color: "#887122",
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
                    color: "#16A34A",
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
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    WhatsApp
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Chat with us on [+00 000 000 0000]
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
                    [hello@yourdomain.com]
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
                      color: "#887122",
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
                    Within [X business days], Monday to Friday
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
                    <path d="m4.93 4.93 4.24 4.24" />
                    <path d="m14.83 9.17 4.24-4.24" />
                    <path d="m14.83 14.83 4.24 4.24" />
                    <path d="m9.17 14.83-4.24 4.24" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                </span>
                <div style={{ minWidth: "0" }}>
                  <p
                    style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}
                  >
                    Already a client?
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "15px",
                      lineHeight: "1.55",
                      color: "#3E4C66",
                    }}
                  >
                    Send support requests from the client portal so the team can
                    track them.
                  </p>
                  <Link
                    href={routes.portalSignIn}
                    style={{
                      marginTop: "8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      minHeight: "40px",
                      color: "#887122",
                      fontSize: "15px",
                      fontWeight: "600",
                      textDecoration: "none",
                    }}
                  >
                    Client login
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
            <div
              style={{
                marginTop: "28px",
                padding: "24px",
                borderRadius: "16px",
                background: "#F6F9FF",
                border: "1px solid #E1E8F2",
              }}
            >
              <p style={{ margin: "0", fontSize: "16px", fontWeight: "700" }}>
                What happens next
              </p>
              <ol
                style={{
                  listStyle: "none",
                  margin: "16px 0 0",
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <li
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      flex: "none",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#D3AF34",
                      color: "#021A54",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    1
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      We review your request
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: "2px",
                        fontSize: "14px",
                        lineHeight: "1.55",
                        color: "#3E4C66",
                      }}
                    >
                      And reply within [X business days].
                    </span>
                  </span>
                </li>
                <li
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      flex: "none",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#021A54",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    2
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      A short discovery call
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: "2px",
                        fontSize: "14px",
                        lineHeight: "1.55",
                        color: "#3E4C66",
                      }}
                    >
                      To understand your goals, users and requirements.
                    </span>
                  </span>
                </li>
                <li
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      flex: "none",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#021A54",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    3
                  </span>
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "15px",
                        fontWeight: "700",
                      }}
                    >
                      Scope and estimate
                    </span>
                    <span
                      style={{
                        display: "block",
                        marginTop: "2px",
                        fontSize: "14px",
                        lineHeight: "1.55",
                        color: "#3E4C66",
                      }}
                    >
                      A clear plan with a timeline and cost.
                    </span>
                  </span>
                </li>
              </ol>
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
        background: "#F6F9FF",
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
              question: "What do you need to prepare a quote?",
              answer: (
                <>
                  Your project type, requirements, budget range and contact
                  details. The form takes about two minutes.
                </>
              ),
            },
            {
              question: "How quickly will you reply?",
              answer: (
                <>
                  Within [X business days], with next steps, a rough scope and
                  an estimate.
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
              question: "Can I see a demo before I decide?",
              answer: (
                <>
                  Yes. Book a 30-minute video call and we will walk you through
                  a booking platform, dashboards or integrations.
                </>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
