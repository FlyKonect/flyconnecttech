"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BellOff, CheckCheck } from "lucide-react";

import { NotificationRow } from "@/components/ui/notification-row";
import { apiFetch } from "@/lib/api";
import { formatShortWhen } from "@/lib/format-time";
import { notificationHeadings } from "@/lib/labels";
import type { NotificationItem } from "@/lib/portal/types";
import { cn } from "@/lib/utils";

/**
 * Notifications (portal screen 14, team screen 32): "{n} unread", Mark all
 * as read, and rows that open their page and are marked read on the way.
 */
export function NotificationList({
  items,
  unread,
  timeZone,
  unreadLabel = "unread",
  paging,
}: {
  items: NotificationItem[];
  unread: number;
  timeZone: string;
  /** Page links under the list: the page, its size, the total, and the address. */
  paging?: { page: number; pageSize: number; total: number; href: string };
  /** The words after the number: "unread" (portal), "unread alerts" (team). */
  unreadLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [onlyUnread, setOnlyUnread] = React.useState(false);
  const now = new Date();

  async function markAll() {
    setBusy(true);
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function open(event: React.MouseEvent, item: NotificationItem) {
    if (item.read || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    await apiFetch(`/notifications/${item.id}/read`, { method: "POST" }).catch(
      () => undefined,
    );
    router.push(item.href);
    router.refresh();
  }

  const shown = onlyUnread ? items.filter((item) => !item.read) : items;
  const tab =
    "inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] font-bold transition-colors aria-pressed:bg-navy aria-pressed:text-white";

  return (
    <section className="overflow-hidden rounded-[22px] border border-line-2 bg-white shadow-[0_1px_2px_rgba(2,26,84,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-10 items-center justify-center rounded-2xl bg-tint text-navy-700"
          >
            <Bell className="size-[19px]" strokeWidth={1.9} />
          </span>
          <h2 className="text-[17px] font-bold">
            {unread} {unreadLabel}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-1 rounded-xl border border-line-2 p-1">
            <button
              type="button"
              aria-pressed={!onlyUnread}
              onClick={() => setOnlyUnread(false)}
              className={cn(tab, "text-body hover:bg-soft")}
            >
              All
            </button>
            <button
              type="button"
              aria-pressed={onlyUnread}
              onClick={() => setOnlyUnread(true)}
              className={cn(tab, "text-body hover:bg-soft")}
            >
              Unread
              {unread ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-bold text-navy">
                  {unread}
                </span>
              ) : null}
            </button>
          </div>
          <button
            type="button"
            onClick={markAll}
            disabled={busy || unread === 0}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] bg-tint px-3.5 text-[13px] font-bold text-navy-700 hover:bg-[#E3E9F5] disabled:cursor-default disabled:opacity-60"
          >
            <CheckCheck aria-hidden="true" className="size-4" />
            Mark all as read
          </button>
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
          <span
            aria-hidden="true"
            className="inline-flex size-12 items-center justify-center rounded-full bg-soft text-muted-foreground"
          >
            <BellOff className="size-[22px]" strokeWidth={1.8} />
          </span>
          <p className="font-bold text-navy">
            {items.length === 0
              ? "No notifications yet."
              : "You're all caught up."}
          </p>
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "New replies, status changes and alerts will show here."
              : "No unread notifications."}
          </p>
        </div>
      ) : (
        <ul className="[&>li:first-child>a]:border-t-0">
          {shown.map((item) => (
            <li key={item.id}>
              <NotificationRow
                kind={item.kind}
                heading={notificationHeadings[item.kind]}
                text={item.text}
                time={formatShortWhen(item.createdAt, timeZone, now)}
                href={item.href}
                unread={!item.read}
                onClick={(event) => void open(event, item)}
              />
            </li>
          ))}
        </ul>
      )}
      {paging && paging.total > paging.pageSize ? (
        <PageLinks {...paging} />
      ) : null}
    </section>
  );
}

/** "Newer" and "Older", with where this page sits. */
function PageLinks({
  page,
  pageSize,
  total,
  href,
}: {
  page: number;
  pageSize: number;
  total: number;
  href: string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const link =
    "inline-flex min-h-10 items-center rounded-[10px] border border-line-2 px-3.5 text-sm font-bold text-navy hover:bg-tint";
  return (
    <nav
      aria-label="Notification pages"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-3 pt-4"
    >
      <span className="text-sm text-muted-foreground">
        {first}–{last} of {total}
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link className={link} href={`${href}?page=${page - 1}`}>
            ← Newer
          </Link>
        ) : null}
        {page < pages ? (
          <Link className={link} href={`${href}?page=${page + 1}`}>
            Older →
          </Link>
        ) : null}
      </span>
    </nav>
  );
}
