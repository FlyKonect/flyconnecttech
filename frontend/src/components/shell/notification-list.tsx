"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { NotificationRow } from "@/components/ui/notification-row";
import { apiFetch } from "@/lib/api";
import { formatShortWhen } from "@/lib/format-time";
import { notificationHeadings } from "@/lib/labels";
import type { NotificationItem } from "@/lib/portal/types";

/**
 * Notifications (portal screen 14, team screen 32): "{n} unread", Mark all
 * as read, and rows that open their page and are marked read on the way.
 */
export function NotificationList({
  items,
  unread,
  timeZone,
  unreadLabel = "unread",
}: {
  items: NotificationItem[];
  unread: number;
  timeZone: string;
  /** The words after the number: "unread" (portal), "unread alerts" (team). */
  unreadLabel?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
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

  return (
    <section className="overflow-hidden rounded-[22px] border border-line-2 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line-3 px-5 py-4">
        <h2 className="text-[15px] font-bold">
          {unread} {unreadLabel}
        </h2>
        <button
          type="button"
          onClick={markAll}
          disabled={busy || unread === 0}
          className="min-h-10 cursor-pointer rounded-[10px] bg-tint px-3.5 text-[13px] font-bold text-navy-700 hover:bg-[#E3E9F5] disabled:cursor-default disabled:opacity-60"
        >
          Mark all as read
        </button>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        <ul className="[&>li:first-child>a]:border-t-0">
          {items.map((item) => (
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
    </section>
  );
}
