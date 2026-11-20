import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/shell/page-loading";
import { NotificationList } from "@/components/shell/notification-list";
import { routes } from "@/lib/routes";
import { serverApi } from "@/lib/api-server";
import { requireCustomer } from "@/lib/auth/server";
import type { NotificationList as Notifications } from "@/lib/portal/types";

export const metadata: Metadata = { title: "Notifications" };

/** Notifications (screen 14). */
async function PortalNotificationsPageContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page } = await searchParams;
  const pageNumber = typeof page === "string" ? page : "1";
  const me = await requireCustomer();
  const list = await serverApi<Notifications>(
    `/notifications?page=${encodeURIComponent(pageNumber)}`,
  );
  return (
    <NotificationList
      items={list.items}
      unread={list.unread}
      timeZone={me.timezone}
      paging={{
        page: list.page,
        pageSize: list.pageSize,
        total: list.total,
        href: routes.portalNotifications,
      }}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function PortalNotificationsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <PortalNotificationsPageContent {...props} />
    </Suspense>
  );
}
