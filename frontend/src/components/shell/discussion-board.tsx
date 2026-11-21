import type * as React from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import { LabelPill } from "@/components/ui/pill";
import { type TopicList, waitingWords } from "@/lib/discussions";
import { formatShortWhen } from "@/lib/format-time";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

/**
 * A discussion board (both areas): Open and Closed tabs, the "+ New
 * topic" button, and a row per topic with its module, who started it, the
 * replies, last activity and its flags (Answered, Proposal waiting,
 * Waiting for …).
 */
export function DiscussionBoard({
  list,
  status,
  pageHref,
  topicHref,
  zone,
  intro,
  start,
}: {
  list: TopicList;
  status: "open" | "closed";
  /** The board's address (?status=closed for the Closed tab). */
  pageHref: string;
  topicHref: (number: number) => string;
  zone: string;
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
      <h2 id="board-heading" className="sr-only">
        Topics
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Topic status" className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const active = status === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition-colors",
                  active
                    ? "bg-navy text-white"
                    : "text-body hover:bg-soft hover:text-navy",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    active ? "bg-white/20 text-white" : "bg-soft text-navy-700",
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </nav>
        {start}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{intro}</p>

      {list.rows.length ? (
        <ul className="mt-3">
          {list.rows.map((row) => (
            <li key={row.number} className="border-t border-line-3">
              <Link
                href={topicHref(row.number)}
                className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-xl px-1 py-3.5 hover:bg-[#F9FBFE]"
              >
                <MessagesSquare
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-[1_1_260px]">
                  <span className="block text-[15px] font-bold">
                    <span className="text-muted-foreground">#{row.number}</span>{" "}
                    {row.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {[
                      `Started by ${row.startedBy}`,
                      plural(row.replies, "reply", "replies"),
                      `last activity ${formatShortWhen(row.lastPostAt, zone, now)}`,
                    ].join(" · ")}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  {row.module ? (
                    <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-body">
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
                    <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-bold text-[#92400E]">
                      {waitingWords(row.waitingFor)}
                    </span>
                  ) : null}
                  {row.status === "CLOSED" ? (
                    <LabelPill group="topicStatus" value="CLOSED" />
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#F6F8FC] px-4 py-6 text-center text-sm text-muted-foreground">
          {status === "closed"
            ? "No closed topics."
            : "No open topics yet. Start one to talk about a specific part of the project."}
        </p>
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
