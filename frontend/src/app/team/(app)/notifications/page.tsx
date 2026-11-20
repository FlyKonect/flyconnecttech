import { Suspense } from "react";
import type { Metadata } from "next";

import { NotificationList } from "@/components/shell/notification-list";
import { PageLoading } from "@/components/shell/page-loading";
import { serverApi } from "@/lib/api-server";
import { requireTeamMember } from "@/lib/auth/server";
import type { NotificationList as Notifications } from "@/lib/portal/types";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Notifications" };

/** Team notifications (screen 32), 25 a page (`?page=`). */
async function TeamNotificationsContent({
  searchParams,
}: PageProps<"/team/notifications">) {
  const { page } = await searchParams;
  const pageNumber = typeof page === "string" ? page : "1";
  const me = await requireTeamMember();
  const list = await serverApi<Notifications>(
    `/notifications?page=${encodeURIComponent(pageNumber)}`,
    { signIn: routes.teamSignIn },
  );
  return (
    <NotificationList
      items={list.items}
      unread={list.unread}
      timeZone={me.timezone}
      unreadLabel="unread alerts"
      paging={{
        page: list.page,
        pageSize: list.pageSize,
        total: list.total,
        href: routes.teamNotifications,
      }}
    />
  );
}

/** Its data loads inside Suspense, so moving between pages is instant. */
export default function TeamNotificationsPage(
  props: PageProps<"/team/notifications">,
) {
  return (
    <Suspense fallback={<PageLoading />}>
      <TeamNotificationsContent {...props} />
    </Suspense>
  );
}
