import type * as React from "react";
import { ExternalLink } from "lucide-react";

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

/**
 * A project's page parts that the team panel and the client portal share:
 * the details, "What's included" (read only) and the updates. Server
 * components; the team page adds its buttons through the `actions` slots.
 */

export const projectCard =
  "rounded-[22px] border border-line-2 bg-white p-6 max-app:p-5";

/** The details as label and value rows. Empty ones are left out. */
export function ProjectFacts({
  project,
  lead,
}: {
  project: ProjectPage;
  lead: { name: string; jobTitle: string | null } | null;
}) {
  const rows: [string, React.ReactNode][] = [
    ["Start", formatDay(project.startDate)],
    ["Target", formatDay(project.targetDate)],
    ["Went live", formatDay(project.liveDate)],
    ["Support until", formatDay(project.supportUntil)],
    [
      "Project lead",
      lead
        ? lead.jobTitle
          ? `${lead.name} · ${lead.jobTitle}`
          : lead.name
        : "",
    ],
    ["Live address", project.liveUrl ? <Address url={project.liveUrl} /> : ""],
    ["Test address", project.testUrl ? <Address url={project.testUrl} /> : ""],
    ["Built with", project.builtWith ?? ""],
  ];
  const shown = rows.filter(([, value]) => value);
  if (!shown.length) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No dates or addresses added yet.
      </p>
    );
  }
  return (
    <dl className="mt-3 flex flex-col gap-2.5 text-sm">
      {shown.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3">
          <dt className="shrink-0 text-muted-foreground">{label}</dt>
          <dd className="min-w-0 text-right font-bold [overflow-wrap:anywhere]">
            {value}
          </dd>
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

/** One item of "What's included": its title, detail and status. */
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
  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-3 py-3 first:border-t-0">
      <span className="min-w-0 flex-[1_1_220px]">
        <span
          className={
            item.status === "DONE"
              ? "block text-[15px] font-bold text-muted-foreground line-through decoration-1"
              : "block text-[15px] font-bold"
          }
        >
          {item.title}
        </span>
        {item.detail ? (
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            {item.detail}
          </span>
        ) : null}
        {item.status === "DONE" && item.doneAt ? (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Done {formatShortWhen(item.doneAt, zone)}
          </span>
        ) : null}
      </span>
      {children ?? <LabelPill group="projectItemStatus" value={item.status} />}
    </li>
  );
}

/** The updates, newest first, with their files. */
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
    return <p className="mt-3 text-sm text-muted-foreground">{empty}</p>;
  }
  const now = new Date();
  return (
    <ol className="mt-2 flex flex-col">
      {updates.map((update) => (
        <li
          key={update.id}
          className="border-t border-line-3 py-4 first:border-t-0"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[13px] text-muted-foreground">
              <strong className="font-bold text-navy">
                {update.authorName}
              </strong>{" "}
              · {formatMessageTime(update.createdAt, zone, now)}
              {update.editedAt ? " · edited" : ""}
            </p>
            {menu?.(update)}
          </div>
          {update.body ? (
            <p className="mt-1.5 text-[15px] leading-[1.6] whitespace-pre-line text-body">
              {update.body}
            </p>
          ) : null}
          {update.files.length ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
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
        </li>
      ))}
    </ol>
  );
}
