import type * as React from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Lightbulb, LockKeyhole } from "lucide-react";

import { projectCard } from "@/components/shell/project-parts";
import { Avatar } from "@/components/ui/avatar";
import { FileChip } from "@/components/ui/file-chip";
import { LabelPill } from "@/components/ui/pill";
import type { TopicDetail, TopicPost } from "@/lib/discussions";
import { formatMessageTime } from "@/lib/format-time";
import { plural } from "@/lib/plural";
import { cn } from "@/lib/utils";

/**
 * One topic (both areas): a header card (shared with the customer or team
 * only, the title, status and module, who started it, who was asked, the
 * closing note and the marked answer), then the conversation as chat
 * bubbles: the customer's tinted, the team's white, proposals in amber
 * with their state, the answer in green, and small lines for what
 * happened (closed, reopened, …). The area adds its buttons through the
 * slots.
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
  const replies = Math.max(
    0,
    topic.posts.filter((post) => post.kind !== "SYSTEM").length - 1,
  );
  const internal = topic.kind === "INTERNAL";

  return (
    <>
      <div>{back}</div>
      <section
        aria-labelledby="topic-title"
        className={cn(projectCard, "flex flex-col gap-4")}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
                  internal
                    ? "bg-[#FEF3C7] text-[#92400E]"
                    : "bg-[#E0F2FE] text-[#075985]",
                )}
              >
                {internal ? (
                  <LockKeyhole aria-hidden="true" className="size-3.5" />
                ) : (
                  <Eye aria-hidden="true" className="size-3.5" />
                )}
                {internal
                  ? "Team only: the customer can't see this"
                  : "Shared with the customer"}
              </span>
              <span className="text-muted-foreground">#{topic.number}</span>
            </p>
            <h2
              id="topic-title"
              className="mt-2.5 flex flex-wrap items-center gap-2 font-heading text-[22px] leading-tight font-bold tracking-[-0.01em]"
            >
              {topic.title}
              <LabelPill group="topicStatus" value={topic.status} />
              {topic.module ? (
                <span className="rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-body">
                  {topic.module.name}
                </span>
              ) : null}
            </h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Started by{" "}
              <strong className="font-bold text-body">{topic.startedBy}</strong>{" "}
              · {formatMessageTime(topic.createdAt, zone)} ·{" "}
              {plural(replies, "reply", "replies")}
            </p>
          </div>
          {buttons}
        </div>

        {topic.asked.length ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-body">
            <span className="mr-0.5 font-bold">Asked:</span>
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
            className="flex gap-3 rounded-[14px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534] transition-colors hover:bg-[#DCFCE7]"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
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

      <section
        aria-label="Conversation"
        className={cn(projectCard, "flex flex-col gap-5")}
      >
        <ol aria-label="Messages" className="flex flex-col gap-5">
          {topic.posts.map((post, index) =>
            post.kind === "SYSTEM" ? (
              <li
                key={post.id}
                className="flex items-center gap-3 text-xs text-muted-foreground"
              >
                <span aria-hidden="true" className="h-px flex-1 bg-line-3" />
                <span className="max-w-[80%] text-center">
                  {post.body} · {formatMessageTime(post.createdAt, zone)}
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-line-3" />
              </li>
            ) : (
              <Message
                key={post.id}
                post={post}
                index={index}
                zone={zone}
                isAnswer={post.id === topic.answerPostId}
                company={company}
                postMenu={postMenu}
                decision={decision}
                fileHref={fileHref}
              />
            ),
          )}
        </ol>

        {composer ??
          (topic.status === "CLOSED" ? (
            <p className="rounded-[14px] bg-[#F6F8FC] px-4 py-4 text-center text-sm text-muted-foreground">
              This topic is closed.
            </p>
          ) : null)}
      </section>
    </>
  );
}

function Message({
  post,
  index,
  zone,
  isAnswer,
  company,
  postMenu,
  decision,
  fileHref,
}: {
  post: TopicPost;
  index: number;
  zone: string;
  isAnswer: boolean;
  company?: string;
  postMenu?: (post: TopicPost, index: number) => React.ReactNode;
  decision?: (post: TopicPost) => React.ReactNode;
  fileHref: (fileId: string) => string;
}) {
  const customer = Boolean(post.author?.customer);
  const name = post.author?.name ?? "FlyConnect Tech";
  return (
    <li id={`post-${post.id}`} className="flex scroll-mt-24 gap-3">
      <Avatar
        name={name}
        tone={customer ? "tint" : "navy"}
        size="sm"
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-bold">{name}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-bold",
              customer
                ? "bg-[#E0F2FE] text-[#075985]"
                : "bg-[#E3E9F5] text-navy",
            )}
          >
            {customer
              ? (company ?? "Customer")
              : (post.author?.jobTitle ?? "FlyConnect Tech")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(post.createdAt, zone)}
            {post.editedAt ? " · edited" : ""}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            {isAnswer ? <LabelPill group="topicFlag" value="ANSWERED" /> : null}
            {postMenu?.(post, index)}
          </span>
        </div>

        <div
          className={cn(
            "mt-1.5 rounded-[16px] rounded-tl-[6px] border px-4 py-3",
            post.kind === "PROPOSAL"
              ? "border-[#FCD34D] bg-[#FFFBEB]"
              : customer
                ? "border-[#DCE6F2] bg-[#F4F8FC]"
                : "border-line-2 bg-white",
            isAnswer && "border-[#86EFAC] ring-[3px] ring-[#DCFCE7]",
          )}
        >
          {post.proposal ? (
            <p className="mb-2 flex flex-wrap items-center gap-2 border-b border-[#FDE68A] pb-2 text-[13px] font-bold text-[#92400E]">
              <Lightbulb aria-hidden="true" className="size-4" />
              Proposal
              <LabelPill group="proposalState" value={post.proposal.state} />
            </p>
          ) : null}
          {post.body ? (
            <p className="text-[15px] leading-[1.6] whitespace-pre-line text-body">
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
              {post.proposal.decidedBy ? ` by ${post.proposal.decidedBy}` : ""}
              {post.proposal.decidedAt
                ? ` · ${formatMessageTime(post.proposal.decidedAt, zone)}`
                : ""}
              {post.proposal.note ? `: “${post.proposal.note}”` : ""}
            </p>
          ) : null}
          {post.proposal?.state === "PENDING" ? decision?.(post) : null}
        </div>
      </div>
    </li>
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
