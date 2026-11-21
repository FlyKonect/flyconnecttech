import type * as React from "react";
import Link from "next/link";
import { CheckCircle2, Lightbulb } from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import { Avatar } from "@/components/ui/avatar";
import { FileChip } from "@/components/ui/file-chip";
import { LabelPill } from "@/components/ui/pill";
import type { TopicDetail, TopicPost } from "@/lib/discussions";
import { formatMessageTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

/**
 * One topic (both areas): its title and status, who was asked (team
 * topics), the closing note, the marked answer pinned on top, then the
 * thread: messages with their files, proposals with their state, and
 * small system lines. The area adds its buttons through the slots.
 */
export function DiscussionThread({
  topic,
  zone,
  back,
  buttons,
  postMenu,
  decision,
  composer,
  fileHref,
  company,
}: {
  topic: TopicDetail;
  zone: string;
  back: React.ReactNode;
  /** Close, Reopen, Delete. */
  buttons?: React.ReactNode;
  postMenu?: (post: TopicPost, index: number) => React.ReactNode;
  /** The customer's Approve / Request changes on a pending proposal. */
  decision?: (post: TopicPost) => React.ReactNode;
  composer?: React.ReactNode;
  fileHref: (fileId: string) => string;
  /** The customer's company, beside their name. */
  company?: string;
}) {
  const answer = topic.posts.find((post) => post.id === topic.answerPostId);
  return (
    <>
      <div>{back}</div>
      <section
        aria-labelledby="topic-title"
        className={`${projectCard} flex flex-col gap-3`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">
              #{topic.number} ·{" "}
              {topic.kind === "INTERNAL"
                ? "Team discussion (the customer can't see it)"
                : "Discussion with the customer"}
            </p>
            <h2
              id="topic-title"
              className="mt-1 flex flex-wrap items-center gap-2 font-heading text-[20px] font-bold tracking-[-0.01em]"
            >
              {topic.title}
              <LabelPill group="topicStatus" value={topic.status} />
              {topic.module ? (
                <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-body">
                  {topic.module.name}
                </span>
              ) : null}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Started by {topic.startedBy} ·{" "}
              {formatMessageTime(topic.createdAt, zone)}
            </p>
          </div>
          {buttons}
        </div>
        {topic.asked.length ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-body">
            <span className="font-bold">Asked:</span>
            {topic.asked.map((person) => (
              <span
                key={person.id}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold",
                  person.answered
                    ? "bg-[#DCFCE7] text-[#15803D]"
                    : "bg-[#FEF3C7] text-[#92400E]",
                )}
              >
                {person.name} · {person.answered ? "replied" : "waiting"}
              </span>
            ))}
          </p>
        ) : null}
        {topic.closed ? (
          <p className="rounded-[14px] border border-line-2 bg-[#F1F5F9] px-3.5 py-3 text-sm text-[#475569]">
            Closed
            {topic.closed.by ? ` by ${topic.closed.by}` : ""} on{" "}
            {formatMessageTime(topic.closed.at, zone)}
            {topic.closed.note ? (
              <>
                : <strong className="text-navy">{topic.closed.note}</strong>
              </>
            ) : (
              "."
            )}
          </p>
        ) : null}
        {answer ? (
          <a
            href={`#post-${answer.id}`}
            className="flex gap-3 rounded-[14px] border border-[#BBF7D0] bg-[#ECFDF5] px-3.5 py-3 text-sm text-[#166534] hover:underline"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <span className="min-w-0">
              <strong className="block">
                Answer, by {answer.author?.name ?? "the team"}
              </strong>
              <span className="line-clamp-3 whitespace-pre-line text-body">
                {answer.body}
              </span>
            </span>
          </a>
        ) : null}
      </section>

      <ol aria-label="Messages" className="flex flex-col gap-3">
        {topic.posts.map((post, index) =>
          post.kind === "SYSTEM" ? (
            <li
              key={post.id}
              className="px-2 text-center text-[13px] text-muted-foreground"
            >
              {post.body} · {formatMessageTime(post.createdAt, zone)}
            </li>
          ) : (
            <li
              key={post.id}
              id={`post-${post.id}`}
              className={cn(
                projectCard,
                "scroll-mt-24 !p-4",
                post.kind === "PROPOSAL" &&
                  "border-2 border-[#F59E0B] bg-[#FFFBEB]",
                post.id === topic.answerPostId && "border-2 border-[#16A34A]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    name={post.author?.name ?? "FlyConnect Tech"}
                    tone={post.author?.customer ? "tint" : "navy"}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">
                      {post.author?.name ?? "FlyConnect Tech"}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        ·{" "}
                        {post.author?.customer
                          ? (company ?? "Customer")
                          : (post.author?.jobTitle ?? "FlyConnect Tech")}
                      </span>
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatMessageTime(post.createdAt, zone)}
                      {post.editedAt ? " · edited" : ""}
                    </span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5">
                  {post.id === topic.answerPostId ? (
                    <LabelPill group="topicFlag" value="ANSWERED" />
                  ) : null}
                  {postMenu?.(post, index)}
                </span>
              </div>
              {post.proposal ? (
                <p className="mt-3 flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#92400E]">
                  <Lightbulb aria-hidden="true" className="size-4" />
                  Proposal
                  <LabelPill
                    group="proposalState"
                    value={post.proposal.state}
                  />
                </p>
              ) : null}
              {post.body ? (
                <p className="mt-2.5 text-[15px] leading-[1.6] whitespace-pre-line text-body">
                  {post.body}
                </p>
              ) : null}
              {post.files.length ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {post.files.map((file) => (
                    <FileChip
                      key={file.id}
                      look="link"
                      name={file.fileName}
                      href={fileHref(file.id)}
                    />
                  ))}
                </div>
              ) : null}
              {post.proposal && post.proposal.state !== "PENDING" ? (
                <p className="mt-2.5 text-[13px] text-body">
                  {post.proposal.state === "APPROVED"
                    ? "Approved"
                    : "Changes asked"}
                  {post.proposal.decidedBy
                    ? ` by ${post.proposal.decidedBy}`
                    : ""}
                  {post.proposal.decidedAt
                    ? ` · ${formatMessageTime(post.proposal.decidedAt, zone)}`
                    : ""}
                  {post.proposal.note ? `: “${post.proposal.note}”` : ""}
                </p>
              ) : null}
              {post.proposal?.state === "PENDING" ? decision?.(post) : null}
            </li>
          ),
        )}
      </ol>

      {composer ??
        (topic.status === "CLOSED" ? (
          <p className="rounded-2xl bg-[#F6F8FC] px-4 py-4 text-center text-sm text-muted-foreground">
            This topic is closed.
          </p>
        ) : null)}
    </>
  );
}

/** "← Discussions": back to the board. */
export function BoardLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center text-sm font-bold text-gold-text hover:underline"
    >
      ← {label}
    </Link>
  );
}
