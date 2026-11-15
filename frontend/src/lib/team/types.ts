import type {
  Budget,
  ContactStatus,
  DemoStatus,
  DemoTopic,
  MessageTopic,
  Priority,
  ProjectStatus,
  ProjectType,
  QuoteProjectType,
  QuoteStatus,
  RequestStatus,
  RequestType,
  TeamRole,
  Timeline,
  UserStatus,
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
  /** New website leads (the sidebar badges). Null for developers. */
  leads: { demos: number; quotes: number; messages: number } | null;
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
  /** The Website leads card. */
  leads: LeadsCard | null;
  alerts: NotificationItem[];
};

export type LeadsCard = {
  demos: number;
  quotes: number;
  messages: number;
  estimatesAwaiting: number;
  demosBooked: number;
  nextDemo: string | null;
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

// ------------------------------------------------- customers and projects

/** GET /team/customers (screen 26). */
export type CustomerList = {
  summary: { customers: number; projects: number; invited: number };
  /** Super admins and admins; managers only look. */
  canManage: boolean;
  /** How many match the search; rows holds the newest of them. */
  total: number;
  rows: CustomerRow[];
};

export type CustomerRow = {
  id: string;
  company: string;
  name: string;
  email: string;
  status: UserStatus;
  /** Project names, oldest first. */
  projects: string[];
  openRequests: number;
};

/** GET /team/customers/:id (screen 28). */
export type CustomerDetail = {
  id: string;
  company: string;
  createdAt: string;
  addedBy: string | null;
  /** The website lead this customer was converted from (Phase 8). */
  cameFrom: { type: "DEMO" | "QUOTE" | "MESSAGE"; code: string } | null;
  contact: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    status: UserStatus;
    invitedAt: string | null;
    activatedAt: string | null;
    lastActiveAt: string | null;
  };
  projects: CustomerProject[];
  requests: {
    code: string;
    title: string;
    status: RequestStatus;
    project: { name: string };
    assignee: { name: string } | null;
  }[];
  canManage: boolean;
};

export type CustomerProject = {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  openRequests: number;
};

// ------------------------------------------------------------------ users

/** GET /team/users (screen 29). */
export type TeamUserList = {
  /** Active and invited people; disabled ones are left out. */
  summary: { active: number; invited: number };
  byRole: Record<TeamRole, { active: number; invited: number }>;
  rows: TeamUserRow[];
};

export type TeamUserRow = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  jobTitle: string | null;
  status: UserStatus;
  lastActiveAt: string | null;
  invitedAt: string | null;
  /** Developers only: their open requests. */
  openAssigned: number | null;
  /** Whether the "⋯" menu has anything for this person. */
  canManage: boolean;
};

/** GET /team/users/roles (screen 30): from the backend's policies.ts. */
export type RolesInfo = {
  canInvite: TeamRole[];
  permissions: Record<string, TeamRole[]>;
};

// ------------------------------------------------------------ website leads

export type LeadKind = "demo" | "quote" | "message";

export type LeadPerson = { id: string; name: string };

/** GET /team/leads/{demos,quotes,messages}. */
export type LeadList<Row> = {
  /** Every lead of this kind. */
  all: number;
  /** Per status, for the tabs. A missing status has none. */
  tabs: Partial<Record<string, number>>;
  /** How many match the tab and search; rows holds the newest of them. */
  matching: number;
  rows: Row[];
};

type LeadRowBase = {
  code: string;
  createdAt: string;
  name: string;
  customerId: string | null;
  owner: LeadPerson | null;
};

export type DemoRow = LeadRowBase & {
  company: string;
  topic: DemoTopic;
  preferredStart: string;
  scheduledStart: string | null;
  status: DemoStatus;
};

export type QuoteRow = LeadRowBase & {
  company: string | null;
  projectType: QuoteProjectType;
  budget: Budget;
  timeline: Timeline | null;
  status: QuoteStatus;
};

export type MessageRow = LeadRowBase & {
  email: string;
  topic: MessageTopic;
  /** A preview. */
  message: string;
  status: ContactStatus;
};

export type LeadActivityItem = {
  id: string;
  kind: "SYSTEM" | "EMAIL" | "NOTE";
  body: string;
  createdAt: string;
  author: { name: string } | null;
};

export type Estimate = {
  id: string;
  amountCents: number;
  currency: string;
  deliveryTime: string;
  /** A date, "2026-11-23T00:00:00.000Z". */
  validUntil: string;
  summary: string;
  sentAt: string;
  sentBy: { name: string };
};

type LeadDetailBase = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string | null;
  sourcePage: string;
  createdAt: string;
  owner: LeadPerson | null;
  activity: LeadActivityItem[];
  /** The customer this lead belongs to: converted, linked or same email. */
  customer: { id: string; company: string; phone: string | null } | null;
  /** A demo or quote that was converted to a customer. */
  converted: boolean;
  /** Super admins and admins may convert. */
  canConvert: boolean;
};

export type DemoDetail = LeadDetailBase & {
  kind: "demo";
  status: DemoStatus;
  topic: DemoTopic;
  company: string;
  notes: string | null;
  preferredStart: string;
  scheduledStart: string | null;
  host: LeadPerson | null;
  videoLink: string | null;
  cancelReason: string | null;
};

export type QuoteDetail = LeadDetailBase & {
  kind: "quote";
  status: QuoteStatus;
  projectType: QuoteProjectType;
  budget: Budget;
  timeline: Timeline | null;
  company: string | null;
  requirements: string;
  lostReason: string | null;
  /** Newest first. */
  estimates: Estimate[];
};

export type MessageDetail = LeadDetailBase & {
  kind: "message";
  status: ContactStatus;
  topic: MessageTopic;
  message: string;
};

export type LeadDetail = DemoDetail | QuoteDetail | MessageDetail;

/** GET /team/leads/convert/:code: what Add customer starts with. */
export type ConvertPrefill = {
  lead: { type: "DEMO" | "QUOTE"; code: string; label: string };
  name: string;
  email: string;
  company: string;
  phone: string;
  project: { name: string; type: ProjectType };
};
