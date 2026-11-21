import type * as React from "react";
import {
  CalendarDays,
  Check,
  Code2,
  ExternalLink,
  Flag,
  FlaskConical,
  Globe,
  LifeBuoy,
  Rocket,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { FileChip } from "@/components/ui/file-chip";
import { LabelPill } from "@/components/ui/pill";
import { formatMessageTime, formatShortWhen } from "@/lib/format-time";
import {
  formatDay,
  shortAddress,
  type ProjectItem,
  type ProjectPage,
  type ProjectUpdate,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

/**
 * A project's page parts that the team panel and the client portal share:
 * the details, "What's included" (read only) and the updates. Server
 * components; the team page adds its buttons through the `actions` slots.
 */

export const projectCard =
  "rounded-[22px] border border-line-2 bg-white p-6 max-app:p-5";

/** The details, one line a fact with its icon. Empty ones are left out. */
export function ProjectFacts({
  project,
  lead,
}: {
  project: ProjectPage;
  lead: { name: string; jobTitle: string | null } | null;
}) {
  const rows: [string, LucideIcon, React.ReactNode][] = [
    ["Start", CalendarDays, formatDay(project.startDate)],
    ["Target", Flag, formatDay(project.targetDate)],
    ["Went live", Rocket, formatDay(project.liveDate)],
    ["Support until", LifeBuoy, formatDay(project.supportUntil)],
    [
      "Project lead",
      UserRound,
      lead
        ? lead.jobTitle
          ? `${lead.name} · ${lead.jobTitle}`
          : lead.name
        : "",
    ],
    [
      "Live address",
      Globe,
      project.liveUrl ? <Address url={project.liveUrl} /> : "",
    ],
    [
      "Test address",
      FlaskConical,
      project.testUrl ? <Address url={project.testUrl} /> : "",
    ],
    ["Built with", Code2, project.builtWith ?? ""],
  ];
  const shown = rows.filter(([, , value]) => value);
  if (!shown.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No dates or addresses added yet.
      </p>
    );
  }
  return (
    <dl className="flex flex-col gap-3.5 text-sm">
      {shown.map(([label, Icon, value]) => (
        <div key={label} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-soft text-navy-700"
          >
            <Icon className="size-[17px]" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-bold [overflow-wrap:anywhere]">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

function Address({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-gold-text hover:underline"
    >
      {shortAddress(url)}
      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** One item of "What's included": its status, title and detail. */
export function ItemRow({
  item,
  zone,
  children,
}: {
  item: ProjectItem;
  zone: string;
  /** The team's controls (status selector, "⋯"); the pill otherwise. */
  children?: React.ReactNode;
}) {
  const done = item.status === "DONE";
  return (
    <li className="flex items-center gap-3 border-t border-line-3 bg-white px-4 py-3 transition-colors first:border-t-0 hover:bg-[#FAFBFD] max-app:px-3">
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full",
          done && "bg-[#22C55E] text-white",
          item.status === "IN_PROGRESS" &&
            "border-2 border-[#2563EB] bg-[conic-gradient(#2563EB_0_50%,transparent_50%_100%)]",
          item.status === "TODO" && "border-2 border-[#C5CFDE] bg-white",
        )}
      >
        {done ? <Check className="size-3.5" strokeWidth={3.2} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[15px] font-semibold",
            done
              ? "text-muted-foreground line-through decoration-1"
              : "text-navy",
          )}
        >
          {item.title}
        </span>
        {item.detail ? (
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            {item.detail}
          </span>
        ) : null}
        {done && item.doneAt ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Done {formatShortWhen(item.doneAt, zone)}
          </span>
        ) : null}
      </span>
      {children ?? <LabelPill group="projectItemStatus" value={item.status} />}
    </li>
  );
}

/**
 * The updates, newest first: who posted it and when (with a rail of their
 * initials down the left), the text and its files. The newest is marked
 * Latest.
 */
export function UpdatesList({
  updates,
  zone,
  fileHref,
  menu,
  empty,
}: {
  updates: ProjectUpdate[];
  zone: string;
  fileHref: (fileId: string) => string;
  /** The team's "⋯" for an update. */
  menu?: (update: ProjectUpdate) => React.ReactNode;
  empty: string;
}) {
  if (!updates.length) {
    return (
      <p className="rounded-[16px] border border-dashed border-line-2 bg-[#F8FAFD] px-4 py-6 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }
  const now = new Date();
  return (
    <ol className="relative flex flex-col gap-6">
      {updates.length > 1 ? (
        <span
          aria-hidden="true"
          className="absolute top-9 bottom-2 left-[17px] w-0.5 rounded bg-line-2"
        />
      ) : null}
      {updates.map((update, index) => (
        <li key={update.id} className="relative flex gap-3.5">
          <Avatar
            name={update.authorName}
            size="sm"
            className="relative z-[1] shrink-0 ring-4 ring-white"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-[13px] text-muted-foreground">
                <strong className="font-bold text-navy">
                  {update.authorName}
                </strong>
                <span>
                  {formatMessageTime(update.createdAt, zone, now)}
                  {update.editedAt ? " · edited" : ""}
                </span>
                {index === 0 ? (
                  <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                    Latest
                  </span>
                ) : null}
              </p>
              {menu?.(update)}
            </div>
            <div className="mt-2 rounded-[16px] rounded-tl-[6px] border border-line-2 bg-[#FAFBFD] px-4 py-3.5">
              {update.body ? (
                <p className="text-[15px] leading-[1.65] whitespace-pre-line text-body">
                  {update.body}
                </p>
              ) : null}
              {update.files.length ? (
                <div
                  className={cn("flex flex-wrap gap-2", update.body && "mt-3")}
                >
                  {update.files.map((file) => (
                    <FileChip
                      key={file.id}
                      look="link"
                      name={file.fileName}
                      href={fileHref(file.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
