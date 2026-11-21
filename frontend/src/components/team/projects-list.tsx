"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CircleCheckBig,
  Code2,
  FolderKanban,
  Palette,
  Search,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { LabelPill } from "@/components/ui/pill";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatCard } from "@/components/ui/stat-card";
import { projectTypes } from "@/lib/labels";
import { withPage } from "@/lib/paging";
import { plural } from "@/lib/plural";
import { formatDay, modulesWords } from "@/lib/projects";
import { routes } from "@/lib/routes";
import { PROJECT_TABS, projectsHref } from "@/lib/team/projects";
import type { ProjectList, ProjectRow } from "@/lib/team/types";
import { cn } from "@/lib/utils";

/**
 * Projects (team panel): every customer's projects with their progress.
 * Super admins and admins add them; managers see a "View only" tag.
 */
export function ProjectsList({
  list,
  filters,
}: {
  list: ProjectList;
  filters: { q: string; status: string };
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState(filters.q);
  const { summary } = list;
  const deletedTab = filters.status === "deleted";

  return (
    <>
      <ul
        aria-label="Projects summary"
        className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5"
      >
        <li>
          <StatCard
            icon={FolderKanban}
            value={summary.all}
            label={summary.all === 1 ? "Project" : "Projects"}
            note="Across all customers"
          />
        </li>
        <li>
          <StatCard
            icon={Palette}
            tone="gold"
            value={summary.PLANNING + summary.IN_DESIGN}
            label="Planning or design"
            note={`${summary.PLANNING} planning · ${summary.IN_DESIGN} in design`}
          />
        </li>
        <li>
          <StatCard
            icon={Code2}
            tone="orange"
            value={summary.IN_DEVELOPMENT}
            label="In development"
            note="Being built now"
          />
        </li>
        <li>
          <StatCard
            icon={CircleCheckBig}
            value={summary.LIVE + summary.COMPLETED}
            label="Live or completed"
            note={`${summary.LIVE} live · ${summary.COMPLETED} completed`}
          />
        </li>
      </ul>

      <div className="rounded-[18px] border border-line-2 bg-white p-2">
        <nav aria-label="Project status" className="flex flex-wrap gap-1">
          {PROJECT_TABS.map((tab) => {
            const active = filters.status === tab.status;
            return (
              <Link
                key={tab.key}
                href={projectsHref({ q: filters.q, status: tab.status })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-[13px] font-bold whitespace-nowrap transition-colors",
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
                  {summary[tab.key]}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-line-3 px-1 pt-3 pb-1">
          <form
            role="search"
            className="w-full max-w-[380px]"
            onSubmit={(event) => {
              event.preventDefault();
              router.push(
                projectsHref({ q: search.trim(), status: filters.status }),
              );
            }}
          >
            <label className="flex h-11 items-center gap-2 rounded-xl border border-line-2 bg-white px-3.5 text-muted-foreground focus-within:border-navy">
              <Search aria-hidden="true" className="size-4 shrink-0" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by code, project or customer"
                aria-label="Search projects"
                className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
              />
            </label>
          </form>
          {list.can.manage ? (
            <Link href={routes.teamNewProject} className={buttonVariants()}>
              + Add project
            </Link>
          ) : (
            <span className="inline-block rounded-full bg-chip px-3 py-1 text-xs font-bold text-body">
              View only
            </span>
          )}
        </div>
      </div>

      <DataTable<ProjectRow>
        caption="Projects"
        rows={list.rows}
        serverPaging={{
          page: list.page,
          pageSize: list.pageSize,
          total: list.total,
          href: (page, size) => withPage(projectsHref(filters), page, size),
        }}
        rowKey={(p) => p.id}
        rowHref={(p) => routes.teamProject(p.code)}
        empty={
          filters.q
            ? "No projects match your search."
            : deletedTab
              ? "No deleted projects."
              : "No projects here yet."
        }
        columns={[
          {
            header: "Project",
            primary: true,
            className: "min-w-[220px]",
            cell: (p) => (
              <span className="block min-w-0">
                <span className="block text-xs font-bold text-muted-foreground">
                  {p.code} · {projectTypes[p.type].label}
                </span>
                <span className="mt-0.5 block font-bold">{p.name}</span>
              </span>
            ),
          },
          {
            header: "Customer",
            className: "min-w-[140px] text-body",
            cell: (p) => p.customer.company,
          },
          {
            header: "Status",
            cell: (p) =>
              p.deletedAt ? (
                <span className="inline-block rounded-full bg-chip px-2.5 py-1 text-xs font-bold text-body">
                  Deleted
                </span>
              ) : (
                <LabelPill group="projectStatus" value={p.status} />
              ),
          },
          {
            header: "Progress",
            className: "min-w-[160px]",
            cell: (p) => (
              <span className="block">
                <ProgressBar progress={p.progress} label={p.name} />
                {p.modules.total ? (
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {modulesWords(p.modules.done, p.modules.total)}
                    {p.modules.inReview
                      ? ` · ${p.modules.inReview} in client review`
                      : ""}
                  </span>
                ) : null}
              </span>
            ),
          },
          {
            header: "Target",
            className: "whitespace-nowrap text-body",
            cell: (p) => formatDay(p.targetDate) || "—",
          },
          {
            header: "Lead",
            className: "min-w-[120px] text-body",
            cell: (p) => p.lead ?? "—",
          },
          {
            header: "Open requests",
            className: "font-bold",
            cell: (p) => p.openRequests,
          },
          {
            header: "",
            className: "text-right whitespace-nowrap font-bold text-gold-text",
            cell: () => "View →",
          },
        ]}
        card={(p) => (
          <span className="flex flex-col gap-1.5 text-navy">
            <span className="flex items-center justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-xs font-bold text-muted-foreground">
                  {p.code} · {p.customer.company}
                </span>
                <span className="block text-[15px] font-bold">{p.name}</span>
              </span>
              {p.deletedAt ? null : (
                <LabelPill group="projectStatus" value={p.status} />
              )}
            </span>
            <ProgressBar progress={p.progress} label={p.name} />
            <span className="text-[13px] text-body">
              {[
                p.targetDate ? `Target ${formatDay(p.targetDate)}` : null,
                p.lead,
                plural(p.openRequests, "open request"),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
        )}
      />
      {deletedTab && list.can.delete ? (
        <p className="text-[13px] text-muted-foreground">
          Open a deleted project to restore it. Its requests and updates were
          kept.
        </p>
      ) : null}
    </>
  );
}
