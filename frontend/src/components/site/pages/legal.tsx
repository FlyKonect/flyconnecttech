/**
 * The Privacy, Terms and Cookies pages. The design has no screens for them,
 * so they follow the Support page: the navy top band, then plain text.
 *
 * The texts describe what this website really does (the forms, the client
 * portal, the sign-in cookies). Update LEGAL_UPDATED when a text changes.
 */
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { contactEmail, contactEmailHref } from "@/lib/contact";
import { routes } from "@/lib/routes";

export const LEGAL_UPDATED = "17 November 2026";

function LegalPage({
  title,
  intro,
  updated = LEGAL_UPDATED,
  children,
}: {
  title: string;
  intro: string;
  /** "Last updated …", when this page changed on another day. */
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <section className="relative overflow-hidden bg-[radial-gradient(90%_120%_at_88%_0%,#0C3584_0%,#021A54_52%,#01123D_100%)]">
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
          className="pointer-events-none absolute top-[clamp(40px,6vw,90px)] left-1/2 w-[max(1400px,130%)] max-w-none -translate-x-[30%] opacity-[0.22]"
        />
        <div className="relative mx-auto max-w-[1240px] px-[clamp(20px,4vw,40px)] pt-[clamp(24px,3vw,36px)] pb-[clamp(48px,6vw,80px)]">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <Link href={routes.home} className="text-on-navy hover:text-white">
              Home
            </Link>
            <span aria-hidden="true" className="text-[#6F82AE]">
              /
            </span>
            <span aria-current="page" className="font-medium text-white">
              {title}
            </span>
          </nav>
          <h1 className="mt-[clamp(28px,4vw,52px)] font-heading text-[clamp(36px,4.4vw,56px)] leading-[1.05] font-bold tracking-[-0.035em] text-white">
            {title}
          </h1>
          <p className="mt-5 max-w-[640px] text-[clamp(17px,1.5vw,19px)] leading-[1.6] text-on-navy">
            {intro}
          </p>
          <p className="mt-4 text-sm text-on-navy-muted">
            Last updated {updated}
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[800px] flex-col gap-10 px-[clamp(20px,4vw,40px)] py-[clamp(48px,6vw,88px)]">
        {children}
        <Section title="Questions">
          <p>
            Email us at <EmailLink />. We reply within 5 business days, Monday
            to Friday.
          </p>
        </Section>
      </div>
    </div>
  );
}

/** One numbered part of a legal page. */
/** The look of a legal page's text. */
const prose =
  "flex flex-col gap-3 text-base leading-[1.7] text-body [&_a]:font-semibold [&_a]:text-navy [&_a]:underline [&_a]:underline-offset-[3px] [&_strong]:text-ink-2 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5";

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <section aria-labelledby={id}>
      <h2
        id={id}
        className="font-heading text-[clamp(22px,2.2vw,26px)] leading-[1.2] font-bold tracking-[-0.02em] text-navy"
      >
        {title}
      </h2>
      <div className={`mt-3 ${prose}`}>{children}</div>
    </section>
  );
}

function EmailLink() {
  return <a href={contactEmailHref}>{contactEmail}</a>;
}

// ------------------------------------------------------------------ privacy

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="How FlyConnect Tech collects and uses your personal information when you visit this website, contact us or use the client portal."
    >
      <Section title="Who we are">
        <p>
          FlyConnect Tech runs this website and the client portal, and decides
          how the personal information you give us is used. You can reach us at{" "}
          <EmailLink />.
        </p>
      </Section>

      <Section title="What we collect">
        <ul>
          <li>
            <strong>Book a demo:</strong> what you would like to see, the time
            you pick, your name, work email, company, and your phone number and
            notes if you add them.
          </li>
          <li>
            <strong>Get a quote:</strong> the project type, budget range and
            timeline, your name, work email and requirements, and your company
            and phone number if you add them.
          </li>
          <li>
            <strong>Send a message:</strong> the topic, your name, email and
            message.
          </li>
          <li>
            <strong>Client portal:</strong> your name, work email, company,
            phone, country and time zone, your email choices, the support
            requests, replies and files you send, and when you last signed in.
          </li>
          <li>
            <strong>Technical information:</strong> our hosting provider&apos;s
            servers record details such as your IP address and browser, to keep
            the website secure and working.
          </li>
        </ul>
        <p>
          With each form we also note which page you sent it from, so we know
          what you were reading about.
        </p>
      </Section>

      <Section title="How we use it">
        <ul>
          <li>
            To reply to you, arrange your demo and prepare your quote. We do
            this because you asked us to, before any agreement is made.
          </li>
          <li>
            To give support through the client portal, as part of our agreement
            with you or your company.
          </li>
          <li>
            To send the emails you would expect: confirmations, calendar
            invites, updates on your requests, and the weekly summary if you
            turn it on. You can change these in your portal profile.
          </li>
          <li>
            To keep the website and accounts secure. This is in our legitimate
            interest and yours.
          </li>
        </ul>
        <p>
          We don&apos;t sell your information, and we don&apos;t use it for
          advertising.
        </p>
      </Section>

      <Section title="Who sees it">
        <p>
          Only the FlyConnect Tech team members who handle your request or
          project. Our web hosting provider stores the website, its database and
          our email for us. We share information with others only when the law
          requires it.
        </p>
      </Section>

      <Section title="How long we keep it">
        <ul>
          <li>
            <strong>Enquiries</strong> (demo, quote and contact forms) that did
            not lead to working together: deleted automatically 3 years after
            they were closed.
          </li>
          <li>
            <strong>Notifications</strong> in the client portal: deleted 12
            months after you read them.
          </li>
          <li>
            <strong>Client accounts and support requests</strong>: kept while we
            work together, and afterwards for as long as we need them for our
            records and legal duties. Then we delete them.
          </li>
          <li>
            <strong>Our record of account changes</strong> (for security): kept
            for 6 years.
          </li>
        </ul>
        <p>
          You can ask us for a copy of the data we hold about you at any time:
          write to the email address below.
        </p>
      </Section>

      <Section title="How we keep it safe">
        <ul>
          <li>The website is only reached over an encrypted connection.</li>
          <li>Passwords are stored in a form that can&apos;t be read back.</li>
          <li>
            Files you attach are kept private and shown only to the people
            allowed to see them.
          </li>
          <li>Our team signs in with a password and a one-time code.</li>
        </ul>
      </Section>

      <Section title="Your rights">
        <p>
          Under UK data protection law you can ask us for a copy of your
          information, ask us to correct or delete it, ask us to limit how we
          use it, or object to how we use it. Email <EmailLink /> and we will
          reply within one month.
        </p>
        <p>
          If you are unhappy with how we handle your information, you can
          complain to the Information Commissioner&apos;s Office at{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ico.org.uk
          </a>
          .
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          This website uses only the cookies needed to sign in. See our{" "}
          <Link href={routes.cookies}>Cookie policy</Link>.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          When we change this policy, we update this page and the date at the
          top.
        </p>
      </Section>
    </LegalPage>
  );
}

// -------------------------------------------------------------------- terms

export function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro="The rules for using the FlyConnect Tech website and client portal."
    >
      <Section title="About these terms">
        <p>
          These terms cover this website and the client portal, run by
          FlyConnect Tech. By using them, you accept these terms. The work we do
          for you (projects, support and prices) is covered by the written
          agreement we make with you. Where that agreement and these terms
          differ, the agreement applies.
        </p>
      </Section>

      <Section title="Using the website">
        <ul>
          <li>Use the website lawfully and honestly.</li>
          <li>
            Don&apos;t try to break it, overload it or get around its security,
            and don&apos;t send our forms in someone else&apos;s name.
          </li>
          <li>
            The information on the website is general. We keep it accurate and
            up to date as best we can, but it isn&apos;t a promise or
            professional advice for your situation.
          </li>
        </ul>
      </Section>

      <Section title="Quotes, estimates and demos">
        <p>
          A quote or estimate is based on what you tell us. It isn&apos;t
          binding until we both agree a written agreement. A demo time is
          confirmed when we email you the calendar invite.
        </p>
      </Section>

      <Section title="Client portal accounts">
        <ul>
          <li>
            Accounts are by invitation only: our team creates them for our
            clients.
          </li>
          <li>
            Keep your password private, and tell us straight away if you think
            someone else has used your account.
          </li>
          <li>
            Send requests only about your own projects, and upload only files
            you have the right to share.
          </li>
          <li>We may disable an account that is misused.</li>
        </ul>
      </Section>

      <Section title="Our content">
        <p>
          The text, design, logo and code of this website belong to FlyConnect
          Tech. You may view and share our pages, but not copy or reuse them
          without our permission. The names of other companies and products,
          such as Amadeus and Stripe, belong to their owners.
        </p>
      </Section>

      <Section title="Links to other websites">
        <p>
          Some links open other websites, such as our live projects. We are not
          responsible for their content.
        </p>
      </Section>

      <Section title="Our responsibility to you">
        <p>
          Nothing in these terms limits our responsibility where the law does
          not allow it to be limited, such as for death or personal injury
          caused by our negligence, or for fraud. Otherwise, we are not
          responsible for losses caused by using this website or by it being
          unavailable.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms. The date at the top shows when they last
          changed.
        </p>
      </Section>

      <Section title="The law that applies">
        <p>
          These terms are governed by the law of England and Wales, and the
          courts of England and Wales deal with any dispute about them.
        </p>
      </Section>
    </LegalPage>
  );
}

// ------------------------------------------------------------------ cookies

const COOKIES = [
  {
    name: "fct.session_token",
    purpose: "Keeps you signed in to the client portal or team panel.",
    lasts:
      'Up to 30 days if you tick "Keep me signed in", otherwise until you close your browser.',
  },
  {
    name: "fct.dont_remember",
    purpose:
      'Notes that you did not tick "Keep me signed in", so you are signed out when you close your browser.',
    lasts: "Until you close your browser.",
  },
  {
    name: "fct.two_factor",
    purpose:
      "Remembers the first step of a team member's two-step sign-in, until the one-time code is entered.",
    lasts: "10 minutes.",
  },
];

export function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro="Which cookies this website uses, and why."
    >
      <Section title="What cookies are">
        <p>
          Cookies are small files a website saves in your browser, so it can
          remember something between pages.
        </p>
      </Section>

      <Section title="The cookies we use">
        <p>
          Only the cookies needed to sign in to the client portal and the team
          panel. They are set when you sign in, not when you simply visit the
          website.
        </p>
        <div
          role="region"
          aria-label="The cookies we use"
          // Scrolls sideways on phones: reachable with the keyboard.
          tabIndex={0}
          className="overflow-x-auto rounded-[18px] border border-line-2"
        >
          <table className="w-full border-collapse text-left text-[15px] leading-[1.55]">
            <caption className="sr-only">The cookies we use</caption>
            <thead>
              <tr className="bg-[#F6F8FC] text-xs tracking-[0.02em] text-muted-foreground uppercase">
                <th scope="col" className="px-4 py-3 font-bold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  What it is for
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  How long it lasts
                </th>
              </tr>
            </thead>
            <tbody>
              {COOKIES.map((cookie) => (
                <tr key={cookie.name} className="border-t border-line-3">
                  <th
                    scope="row"
                    className="px-4 py-3 align-top font-semibold whitespace-nowrap text-navy"
                  >
                    {cookie.name}
                  </th>
                  <td className="min-w-[200px] px-4 py-3 align-top">
                    {cookie.purpose}
                  </td>
                  <td className="min-w-[160px] px-4 py-3 align-top">
                    {cookie.lasts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          On the live website their names begin with <strong>__Secure-</strong>,
          which means the browser only sends them over an encrypted connection.
        </p>
      </Section>

      <Section title="No tracking">
        <p>
          We don&apos;t use analytics, advertising or social media cookies, and
          no other company sets cookies through this website. Because our
          cookies are needed for signing in, the law doesn&apos;t require us to
          ask before using them, so there is no cookie banner.
        </p>
      </Section>

      <Section title="Managing cookies">
        <p>
          You can delete or block cookies in your browser&apos;s settings. If
          you block them, you can still read the website, but you can&apos;t
          sign in.
        </p>
      </Section>

      <Section title="More about your information">
        <p>
          Our <Link href={routes.privacy}>Privacy policy</Link> explains how we
          use the information you give us.
        </p>
      </Section>
    </LegalPage>
  );
}

// ------------------------------------------------- legal entity and ownership

/**
 * Who stands behind the brand, from the client's "Legal Entity and
 * Ownership" document (18 November 2026). Linked from the footer.
 */
export function LegalEntityPage() {
  return (
    <LegalPage
      title="Legal Entity and Ownership"
      intro="FlyConnect Tech is a trading brand and technology division operated by FlyConnect Limited."
      updated="18 November 2026"
    >
      <div className={prose}>
        <p>
          FlyConnect Tech is a trading brand and technology division operated by{" "}
          <strong>FlyConnect Limited</strong>, a company incorporated in England
          and Wales under company registration number <strong>16152024</strong>.
        </p>
        <p>
          All software products, technology services, subscriptions, licences,
          commercial agreements and related services offered through the
          FlyConnect Tech website are provided by FlyConnect Limited, unless
          expressly stated otherwise in an individual agreement.
        </p>
        <p>
          Any contracts entered into through FlyConnect Tech shall be legally
          entered into with FlyConnect Limited.
        </p>
        <p>
          References to FlyConnect Tech throughout this website refer to the
          technology brand and services operated by FlyConnect Limited.
        </p>
        <p>
          FlyConnect Limited retains responsibility for the contractual and
          commercial obligations associated with FlyConnect Tech services.
        </p>
      </div>
    </LegalPage>
  );
}
