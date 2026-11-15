import type {
  Priority,
  ProjectType,
  RequestStatus,
  RequestType,
  TeamRole,
} from "@/lib/labels";
import type { NotificationItem } from "@/lib/portal/types";

/**
 * What the backend's team routes return (backend/src/requests/team-*).
 * Dates arrive as ISO text.
 */

export type TeamCounts = {
  all: number;
  new: number;
  underReview: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
};

export type TeamSummary = {
  requests: TeamCounts;
  unreadNotifications: number;
};

/** A request in a dashboard list. */
export type DashboardRow = {
  code: string;
  title: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  dueAt: string | null;
  slaPausedAt: string | null;
  resolvedAt: string | null;
  project: { name: string };
  customer: { company: string };
};

export type Developer = {
  id: string;
  name: string;
  jobTitle: string | null;
  open: number;
};

export type DeveloperDashboard = {
  role: "DEVELOPER";
  counts: TeamCounts;
  open: number;
  queue: DashboardRow[];
  dueSoon: DashboardRow[];
  alerts: NotificationItem[];
};

export type StaffDashboard = {
  role: Exclude<TeamRole, "DEVELOPER">;
  counts: TeamCounts;
  open: number;
  unassigned: number;
  atRisk: number;
  firstResponse: { thisMonth: number | null; lastMonth: number | null };
  resolvedThisMonth: number;
  resolvedLastMonth: number;
  newRequests: DashboardRow[];
  unassignedRequests: DashboardRow[];
  workload: Developer[];
  customers: { total: number; invited: number } | null;
  team: {
    active: number;
    invited: number;
    byRole: Record<TeamRole, { active: number; invited: number }>;
  } | null;
  alerts: NotificationItem[];
};

export type TeamDashboard = DeveloperDashboard | StaffDashboard;

export type TeamRequestRow = {
  code: string;
  title: string;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  slaPausedAt: string | null;
  resolvedAt: string | null;
  project: { name: string };
  customer: { company: string; name: string | null };
  assignee: { name: string } | null;
};

export type TeamRequestList = {
  tabs: TeamCounts;
  rows: TeamRequestRow[];
  /** How many match in all; at most `limit` are in `rows`. */
  total: number;
  limit: number;
  projects: { id: string; name: string; company: string }[];
  developers: { id: string; name: string }[];
};

export type TeamMessage = {
  id: string;
  kind: "CUSTOMER_REPLY" | "STAFF_REPLY" | "INTERNAL_NOTE" | "SYSTEM";
  body: string;
  createdAt: string;
  author: { name: string; customer: boolean; you: boolean } | null;
};

export type TeamRequestFile = {
  id: string;
  messageId: string | null;
  fileName: string;
  contentType: string;
  size: number;
  createdAt: string;
  uploadedBy: string;
};

export type TeamRequestDetail = {
  code: string;
  title: string;
  description: string;
  url: string | null;
  type: RequestType;
  status: RequestStatus;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  dueAt: string | null;
  slaPausedAt: string | null;
  resolvedAt: string | null;
  firstResponseAt: string | null;
  project: { code: string; name: string; type: ProjectType };
  assignee: { id: string; name: string; jobTitle: string | null } | null;
  customer: {
    id: string;
    company: string;
    country: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  messages: TeamMessage[];
  files: TeamRequestFile[];
  history: { status: RequestStatus; at: string }[];
  can: {
    assign: boolean;
    changePriority: boolean;
    close: boolean;
    statuses: RequestStatus[];
  };
  /** The starting text of the "Request more info" dialog. */
  requestInfoText: string;
};
