import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/portal/page-loading";
import { NotificationList } from "@/components/portal/notification-list";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import type { NotificationList as Notifications } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Notifications" };

/** Notifications (screen 14). */
async function PortalNotificationsPageContent() {
  const me = await requireCustomer();
  const list = await serverApi<Notifications>("/notifications");
  return (
    <NotificationList
      items={list.items}
      unread={list.unread}
      timeZone={me.timezone}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalNotificationsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalNotificationsPageContent />
    </Suspense>
  );
}
