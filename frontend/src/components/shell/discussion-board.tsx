import type * as React from "react";
import Link from "next/link";
import { ChevronRight, MessageCircle, MessagesSquare } from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import { Avatar } from "@/components/ui/avatar";
import { LabelPill } from "@/components/ui/pill";
import { type TopicList, waitingWords } from "@/lib/discussions";
import { formatShortWhen } from "@/lib/format-time";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

/**
 * A discussion board (both areas): its heading and "+ New topic", Open and
 * Closed tabs, and a row per topic: who started it, the title and its
 * module, its flags (Proposal waiting, Answered, Waiting for …), the
 * replies and the last activity.
 */
export function DiscussionBoard({
  list,
  status,
  pageHref,
  topicHref,
  zone,
  title,
  intro,
  start,
}: {
  list: TopicList;
  status: "open" | "closed";
  /** The board's address (?status=closed for the Closed tab). */
  pageHref: string;
  topicHref: (number: number) => string;
  zone: string;
  /** "Discussions with the customer", "Team discussions". */
  title: string;
  intro: string;
  /** The "+ New topic" button, when this person may start one. */
  start?: React.ReactNode;
}) {
  const tabs = [
    { key: "open", label: "Open", count: list.counts.open, href: pageHref },
    {
      key: "closed",
      label: "Closed",
      count: list.counts.closed,
      href: `${pageHref}?status=closed`,
    },
  ] as const;
  const pages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const pageLink = (page: number) =>
    `${pageHref}?${new URLSearchParams({
      ...(status === "closed" ? { status } : {}),
      page: String(page),
    }).toString()}`;
  const now = new Date();

  return (
    <section aria-labelledby="board-heading" className={projectCard}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-[720px] min-w-0">
          <h2 id="board-heading" className="text-[17px] font-bold">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {intro}
          </p>
        </div>
        {start}
      </div>

      <nav
        aria-label="Topic status"
        className="mt-4 flex gap-1 border-b border-line-2"
      >
        {tabs.map((tab) => {
          const active = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative -mb-px inline-flex h-11 items-center gap-2 border-b-[3px] px-3 text-[13.5px] font-bold transition-colors",
                active
                  ? "border-gold text-navy"
                  : "border-transparent text-muted-foreground hover:text-navy",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                  active ? "bg-navy text-white" : "bg-soft text-navy-700",
                )}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {list.rows.length ? (
        <ul className="mt-2 flex flex-col">
          {list.rows.map((row) => (
            <li key={row.number}>
              <Link
                href={topicHref(row.number)}
                className="group flex items-center gap-3.5 rounded-[14px] px-2 py-3.5 transition-colors hover:bg-[#F6F8FC] max-app:px-1"
              >
                <Avatar
                  name={row.startedBy}
                  tone={row.startedByCustomer ? "tint" : "navy"}
                  size="sm"
                  className="shrink-0"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[15px] font-bold text-navy group-hover:underline">
                      {row.title}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      #{row.number}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {[
                      `Started by ${row.startedBy}`,
                      `last activity ${formatShortWhen(row.lastPostAt, zone, now)}`,
                    ].join(" · ")}
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {row.module ? (
                      <span className="rounded-full bg-chip px-2.5 py-0.5 text-xs font-bold text-body">
                        {row.module.name}
                      </span>
                    ) : null}
                    {row.proposalWaiting ? (
                      <LabelPill group="topicFlag" value="PROPOSAL_WAITING" />
                    ) : null}
                    {row.answered ? (
                      <LabelPill group="topicFlag" value="ANSWERED" />
                    ) : null}
                    {row.waitingFor.length ? (
                      <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#92400E]">
                        {waitingWords(row.waitingFor)}
                      </span>
                    ) : null}
                    {row.status === "CLOSED" ? (
                      <LabelPill group="topicStatus" value="CLOSED" />
                    ) : null}
                  </span>
                </span>
                <span
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-[13px] font-bold text-navy"
                  title={plural(row.replies, "reply", "replies")}
                >
                  <MessageCircle aria-hidden="true" className="size-3.5" />
                  {row.replies}
                  <span className="sr-only">
                    {row.replies === 1 ? " reply" : " replies"}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 max-app:hidden"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-[18px] border border-dashed border-line-2 bg-[#F8FAFD] px-4 py-10 text-center">
          <span
            aria-hidden="true"
            className="inline-flex size-12 items-center justify-center rounded-full bg-white text-navy-700 shadow-[0_2px_8px_rgba(2,26,84,0.08)]"
          >
            <MessagesSquare className="size-6" />
          </span>
          <p className="mt-3 text-[15px] font-bold">
            {status === "closed" ? "No closed topics" : "No open topics yet"}
          </p>
          <p className="mt-1 max-w-[420px] text-sm text-muted-foreground">
            {status === "closed"
              ? "Topics show here once they are closed."
              : "Start one to talk about a specific part of the project."}
          </p>
        </div>
      )}

      {pages > 1 ? (
        <nav
          aria-label="Topic pages"
          className="mt-3 flex items-center justify-between border-t border-line-3 pt-3 text-sm font-bold"
        >
          {list.page > 1 ? (
            <Link href={pageLink(list.page - 1)} className="text-gold-text">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {list.page} of {pages}
          </span>
          {list.page < pages ? (
            <Link href={pageLink(list.page + 1)} className="text-gold-text">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </section>
  );
}
