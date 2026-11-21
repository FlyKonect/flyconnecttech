import type { TeamRole } from "@/lib/labels";
import { routes } from "@/lib/routes";

/**
 * The team panel's sidebar menu, per role (docs/01, section 5 "Layout").
 *
 * This list only decides what the menu SHOWS. It is not security: the backend
 * checks every request against the permission table, whatever the menu shows.
 */

export type TeamNavKey =
  | "dashboard"
  | "all"
  | "new"
  | "underReview"
  | "inProgress"
  | "waiting"
  | "resolved"
  | "closed"
  | "demos"
  | "quotes"
  | "messages"
  | "websiteContent"
  | "customers"
  | "projects"
  | "users"
  | "reports"
  | "failedEmails"
  | "activityLog"
  | "notifications"
  | "settings";

export type TeamNavItem = {
  key: TeamNavKey;
  label: string;
  href: string;
  /**
   * How the number beside the item looks.
   * "count": plain number, always shown. "badge": gold badge, hidden at zero.
   */
  number?: "count" | "badge";
  /** For the request filters: the ?status= value this item stands for. */
  status?: string;
};

export type TeamNavSection = {
  /** Small capital heading above the items. Left out for the first group. */
  label?: string;
  items: TeamNavItem[];
};

/** The numbers shown beside menu items. A missing key shows as 0. */
export type TeamNavCounts = Partial<Record<TeamNavKey, number>>;

export function teamNav(role: TeamRole): TeamNavSection[] {
  const isDeveloper = role === "DEVELOPER";
  const isSuperAdmin = role === "SUPER_ADMIN";
  const canSeeUsers = role === "SUPER_ADMIN" || role === "ADMIN";

  const sections: TeamNavSection[] = [
    {
      items: [{ key: "dashboard", label: "Dashboard", href: routes.team }],
    },
    {
      // Developers only ever see the requests assigned to them.
      label: isDeveloper ? "MY REQUESTS" : "SUPPORT REQUESTS",
      items: [
        {
          key: "all",
          label: "All requests",
          href: routes.teamRequests,
          number: "count",
        },
        // No shortcut per status: All requests has them as filter tabs.
      ],
    },
  ];

  if (!isDeveloper) {
    sections.push({
      label: "WEBSITE",
      items: [
        {
          key: "demos",
          label: "Demo requests",
          href: routes.teamDemos,
          number: "badge",
        },
        {
          key: "quotes",
          label: "Quote requests",
          href: routes.teamQuotes,
          number: "badge",
        },
        {
          key: "messages",
          label: "Messages",
          href: routes.teamMessages,
          number: "badge",
        },
        // Testimonials and the live-project link: super admins and admins.
        ...(canSeeUsers
          ? [
              {
                key: "websiteContent",
                label: "Website content",
                href: routes.teamWebsiteContent,
              } satisfies TeamNavItem,
            ]
          : []),
      ],
    });
  }

  const manage: TeamNavItem[] = [];
  if (!isDeveloper) {
    manage.push({
      key: "customers",
      label: "Customers",
      href: routes.teamCustomers,
    });
  }
  // Developers see the projects they are on.
  manage.push({
    key: "projects",
    label: isDeveloper ? "My projects" : "Projects",
    href: routes.teamProjects,
  });
  if (canSeeUsers) {
    manage.push({ key: "users", label: "Users", href: routes.teamUsers });
  }
  if (!isDeveloper) {
    manage.push({
      key: "reports",
      label: "Reports & Analytics",
      href: routes.teamReports,
    });
  }
  if (canSeeUsers) {
    manage.push({
      key: "failedEmails",
      label: "Failed emails",
      href: routes.teamFailedEmails,
    });
  }

  sections.push({
    // Developers only have their projects here: no heading.
    label: isDeveloper ? undefined : "MANAGE",
    items: [
      ...manage,
      {
        key: "notifications",
        label: "Notifications",
        href: routes.teamNotifications,
        number: "badge",
      },
      ...(isSuperAdmin
        ? [
            {
              key: "activityLog",
              label: "Activity log",
              href: routes.teamActivityLog,
            } satisfies TeamNavItem,
            {
              key: "settings",
              label: "Settings",
              href: routes.teamSettings,
            } satisfies TeamNavItem,
          ]
        : []),
    ],
  });

  return sections;
}

/** Is this menu item the page being looked at? */
export function isTeamNavItemActive(
  item: TeamNavItem,
  pathname: string,
  status: string | null,
): boolean {
  if (item.key === "dashboard") return pathname === routes.team;

  const onRequests =
    pathname === routes.teamRequests ||
    pathname.startsWith(`${routes.teamRequests}/`);

  // Stays active whichever status tab is chosen on the page.
  if (item.key === "all") return onRequests;
  if (item.status) return onRequests && status === item.status;

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
