import type {
  NotificationKind,
  Priority,
  ProjectStatus,
  ProjectType,
  RequestStatus,
  RequestType,
} from "@/lib/labels";
import type { ProjectPage, Progress } from "@/lib/projects";

/**
 * What the backend's client portal routes return
 * (backend/src/requests/, backend/src/notifications/, profile).
 * Dates arrive as ISO text.
 */

export type PortalSummary = {
  requests: {
    total: number;
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
  };
  unreadNotifications: number;
};

/** GET /portal/projects: My Projects, and the choices in New request. */
export type PortalProject = {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string | null;
  targetDate: string | null;
  lead: string | null;
  progress: Progress;
};

/** GET /portal/projects/:code: one of the customer's projects. */
export type PortalProjectPage = ProjectPage & {
  lead: { name: string; jobTitle: string | null } | null;
};

export type PortalTab = "all" | "open" | "waiting" | "resolved";

export type RequestRow = {
  code: string;
  title: string;
  type: RequestType;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  project: { code: string; name: string };
  assignee: { name: string } | null;
};

export type RequestList = {
  tabs: Record<PortalTab, number>;
  rows: RequestRow[];
};

export type CustomerAction = "close" | "confirm" | "reopen";

export type RequestFile = {
  id: string;
  /** Empty for the files sent with the request itself. */
  messageId: string | null;
  fileName: string;
  contentType: string;
  size: number;
};

export type RequestMessage = {
  id: string;
  kind: "CUSTOMER_REPLY" | "STAFF_REPLY" | "SYSTEM";
  body: string;
  createdAt: string;
  author: { name: string; you: boolean } | null;
};

export type RequestDetail = {
  code: string;
  title: string;
  description: string;
  url: string | null;
  type: RequestType;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  project: { code: string; name: string; type: ProjectType };
  assignee: { name: string } | null;
  actions: CustomerAction[];
  /** A closed request can be reopened for this many days after closing. */
  reopenWithinDays: number;
  files: RequestFile[];
  messages: RequestMessage[];
  history: { status: RequestStatus; at: string }[];
};

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  text: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type NotificationList = {
  items: NotificationItem[];
  unread: number;
  total: number;
  page: number;
  pageSize: number;
};

export type EmailPrefs = {
  replies: boolean;
  statusChanges: boolean;
  weeklySummary: boolean;
  projectUpdates: boolean;
};

export type Profile = {
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  timezone: string;
  jobTitle: string | null;
  company: string | null;
  emailPrefs: EmailPrefs;
};
