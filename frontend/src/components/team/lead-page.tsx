import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Banner } from "@/components/ui/banner";
import { LabelPill, Pill } from "@/components/ui/pill";
import { formatMessageTime, formatWhen } from "@/lib/format-time";
import { userStatuses } from "@/lib/labels";
import {
  firstOf,
  formatUsd,
  HOW_IT_WORKS,
  KIND_LABEL,
  leadBanner,
  leadFacts,
  leadListHref,
  longDate,
} from "@/lib/team/leads";
import type { LeadDetail, LeadPerson } from "@/lib/team/types";

import { LeadComposer, LeadHeaderActions, OwnerSelect } from "./lead-controls";

const card = "rounded-[22px] border border-line-2 bg-white p-6";
const BACK = {
  demo: "← Demo requests",
  quote: "← Quote requests",
  message: "← Messages",
} as const;

/**
 * A lead's page (screens 35, 38 and 41): the header with the buttons for
 * its status, the banner, the request, the estimate (quotes), the activity
 * and composer, and the Owner, Contact and "How this works" panels.
 */
export function LeadPage({
  lead,
  owners,
  meId,
  timeZone,
}: {
  lead: LeadDetail;
  owners: LeadPerson[];
  meId: string;
  timeZone: string;
}) {
  const now = new Date();
  const banner = leadBanner(lead);
  const { facts, textLabel, text } = leadFacts(lead);
  const company =
    (lead.kind === "message" ? null : lead.company) ??
    lead.customer?.company ??
    null;
  const first = firstOf(lead.name);

  return (
    <>
      <div>
        <Link
          href={leadListHref(lead.kind)}
          className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
        >
          {BACK[lead.kind]}
        </Link>
      </div>

      <section
        aria-label={KIND_LABEL[lead.kind]}
        className={`${card} flex flex-wrap items-center justify-between gap-4`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={lead.name} className="size-14 text-lg" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              {lead.code} · {KIND_LABEL[lead.kind]} · Received{" "}
              {formatWhen(lead.createdAt, timeZone, now)}
            </p>
            <h1 className="mt-0.5 flex flex-wrap items-center gap-2.5 font-heading text-[22px] font-bold tracking-[-0.02em]">
              {lead.name}
              {lead.kind === "demo" ? (
                <LabelPill group="demoStatus" value={lead.status} />
              ) : lead.kind === "quote" ? (
                <LabelPill group="quoteStatus" value={lead.status} />
              ) : (
                <LabelPill group="contactStatus" value={lead.status} />
              )}
              {lead.converted ? (
                <Pill tone={userStatuses.ACTIVE.tone}>Customer</Pill>
              ) : null}
            </h1>
            <p className="mt-0.5 text-[15px] break-all text-muted-foreground">
              {/* A message has no company of its own: just the email. */}
              {lead.kind !== "message" && company ? `${company} · ` : ""}
              {lead.email}
            </p>
          </div>
        </div>
        <LeadHeaderActions lead={lead} owners={owners} meId={meId} />
      </section>

      {banner ? (
        <Banner variant={banner.tone} className="font-semibold">
          {banner.text}
        </Banner>
      ) : null}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-4">
          <section aria-labelledby="lead-request" className={card}>
            <h2 id="lead-request" className="text-[17px] font-bold">
              {KIND_LABEL[lead.kind]}
            </h2>
            <dl className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-[14px] bg-[#F6F8FC] px-4 py-3"
                >
                  <dt className="text-xs font-semibold text-muted-foreground">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-[15px] font-bold">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs font-bold text-muted-foreground">
              {textLabel}
            </p>
            <p className="mt-2 rounded-[14px] border border-line-2 px-4 py-3.5 text-[15px] leading-[1.6] whitespace-pre-line text-body">
              {text}
            </p>
          </section>

          {lead.kind === "quote" && lead.estimates.length ? (
            <section aria-labelledby="lead-estimate" className={card}>
              <h2 id="lead-estimate" className="text-[17px] font-bold">
                Estimate
              </h2>
              <dl className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
                {[
                  ["Amount", formatUsd(lead.estimates[0].amountCents)],
                  ["Delivery", lead.estimates[0].deliveryTime],
                  ["Valid until", longDate(lead.estimates[0].validUntil)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[14px] bg-[#F6F8FC] px-4 py-3"
                  >
                    <dt className="text-xs font-semibold text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-[15px] font-bold">{value}</dd>
                  </div>
                ))}
              </dl>
              {lead.estimates[0].summary ? (
                <p className="mt-3 text-[15px] leading-[1.6] whitespace-pre-line text-body">
                  {lead.estimates[0].summary}
                </p>
              ) : null}
              {lead.estimates.length > 1 ? (
                <div className="mt-4 border-t border-line-3 pt-3">
                  <p className="text-xs font-bold text-muted-foreground">
                    Earlier estimates
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-1 text-[13px] text-body">
                    {lead.estimates.slice(1).map((estimate) => (
                      <li key={estimate.id}>
                        {formatUsd(estimate.amountCents)} · sent{" "}
                        {formatWhen(estimate.sentAt, timeZone, now)} by{" "}
                        {estimate.sentBy.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="lead-activity" className={card}>
            <h2 id="lead-activity" className="text-[17px] font-bold">
              Activity
            </h2>
            <ol className="mt-3 flex flex-col gap-3">
              {lead.activity.map((item) => {
                const when = formatMessageTime(item.createdAt, timeZone, now);
                if (item.kind === "NOTE") {
                  return (
                    <li
                      key={item.id}
                      className="rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3"
                    >
                      <p className="text-xs font-bold text-[#92400E]">
                        Internal note · {item.author?.name ?? "Team"} · {when}
                      </p>
                      <p className="mt-1 text-[15px] leading-[1.55] whitespace-pre-line text-[#451A03]">
                        {item.body}
                      </p>
                    </li>
                  );
                }
                if (item.kind === "EMAIL") {
                  return (
                    <li key={item.id} className="flex gap-3">
                      <Avatar
                        name={item.author?.name ?? "Team"}
                        className="size-9"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-navy">
                            {item.author?.name ?? "Team"}
                          </strong>{" "}
                          · Email to {first} · {when}
                        </p>
                        <p className="mt-1.5 rounded-[16px] border border-line-2 bg-[#F6F8FC] px-4 py-3 text-[15px] leading-[1.6] whitespace-pre-line text-body">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  );
                }
                return (
                  <li
                    key={item.id}
                    className="flex items-baseline gap-2.5 text-[13px]"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 translate-y-[-1px] rounded-full bg-[#CBD5E4]"
                    />
                    <span>
                      <strong className="font-semibold text-navy">
                        {item.body}
                      </strong>
                      <span className="text-muted-foreground"> · {when}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <LeadComposer lead={lead} />
          </section>
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <section aria-labelledby="lead-owner" className={card}>
            <h2 id="lead-owner" className="text-[17px] font-bold">
              Owner
            </h2>
            <div className="mt-3">
              <OwnerSelect lead={lead} owners={owners} />
            </div>
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              The owner replies and takes the next step.
            </p>
          </section>

          <section aria-labelledby="lead-contact" className={`${card} text-sm`}>
            <h2 id="lead-contact" className="text-[17px] font-bold">
              Contact
            </h2>
            <dl className="mt-3 flex flex-col gap-2.5">
              {[
                ["Email", lead.email],
                ["Phone", lead.phone ?? lead.customer?.phone ?? "Not given"],
                ["Company", company ?? "Not given"],
                ["Sent from", `${lead.sourcePage} page`],
                ["Received", formatWhen(lead.createdAt, timeZone, now)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-bold [overflow-wrap:anywhere]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="lead-how"
            className="rounded-[22px] bg-navy p-6 text-white"
          >
            <h2 id="lead-how" className="text-[17px] font-bold">
              How this works
            </h2>
            <ol className="mt-4 flex flex-col gap-3.5">
              {HOW_IT_WORKS[lead.kind].map(([title, line], index) => (
                <li key={title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy"
                  >
                    {index + 1}
                  </span>
                  <span>
                    <strong className="block text-sm">{title}</strong>
                    <span className="block text-[13px] text-[#C5D0EA]">
                      {line}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
