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
import type { ProjectPage, Progress } from "@/lib/projects";

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
  /** The SLA fix clock (empty for requests made before it existed). */
  resolveDueAt?: string | null;
  firstResponseAt?: string | null;
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
  /** The SLA fix clock (empty for requests made before it existed). */
  resolveDueAt?: string | null;
  firstResponseAt?: string | null;
  slaPausedAt: string | null;
  resolvedAt: string | null;
  project: { name: string };
  customer: { company: string; name: string | null };
  assignee: { name: string } | null;
};

export type TeamRequestList = {
  tabs: TeamCounts;
  rows: TeamRequestRow[];
  /** How many match in all; `rows` is page `page` of them. */
  total: number;
  page: number;
  pageSize: number;
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
  /** The SLA fix clock (empty for requests made before it existed). */
  resolveDueAt?: string | null;
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
    /** Edit details: title, type, project. */
    edit: boolean;
    statuses: RequestStatus[];
  };
  projectId: string;
  /** The customer's stars (1-5) when they confirmed the fix, if they gave any. */
  rating: number | null;
  ratingComment: string | null;
  ratedAt: string | null;
  /** The customer's projects, for Edit details (empty without the right). */
  projectChoices: { id: string; code: string; name: string }[];
  /** The starting text of the "Request more info" dialog. */
  requestInfoText: string;
};

// ------------------------------------------------- customers and projects

/** GET /team/customers (screen 26). */
export type CustomerList = {
  summary: { customers: number; projects: number; invited: number };
  /** Super admins and admins; managers only look. */
  canManage: boolean;
  /** How many match the search; `rows` is page `page` of them. */
  total: number;
  page: number;
  pageSize: number;
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
  /** Delete customer: super admins and admins. */
  canDelete: boolean;
};

export type CustomerProject = {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: Progress;
  openRequests: number;
};

// --------------------------------------------------------------- projects

export type TeamMemberChoice = {
  id: string;
  name: string;
  jobTitle: string | null;
};

/** GET /team/projects: the Projects menu's list, one page. */
export type ProjectList = {
  summary: Record<ProjectStatus, number> & { all: number; deleted: number };
  can: { manage: boolean; delete: boolean };
  total: number;
  page: number;
  pageSize: number;
  rows: ProjectRow[];
};

export type ProjectRow = {
  id: string;
  code: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  targetDate: string | null;
  deletedAt: string | null;
  customer: { id: string; company: string };
  lead: string | null;
  progress: Progress;
  openRequests: number;
};

/** GET /team/projects/choices: for Add project. */
export type ProjectChoices = {
  customers: { id: string; company: string }[];
  leads: TeamMemberChoice[];
};

/** GET /team/projects/:code: a project's page in the team panel. */
export type TeamProjectPage = ProjectPage & {
  lead: TeamMemberChoice | null;
  /** Only the team sees these. */
  teamNotes: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  customer: {
    id: string;
    company: string;
    contactName: string | null;
    contactStatus: UserStatus | null;
  };
  can: { manage: boolean; delete: boolean };
  leadChoices: TeamMemberChoice[];
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
  /** Delete user: super admins and admins, never themselves or above their rank. */
  canDelete: boolean;
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
  page: number;
  pageSize: number;
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

// ------------------------------------------------------- reports, settings

/** GET /team/reports (screen 31). The words come from the backend. */
export type ReportCard = {
  label: string;
  value: string;
  change: { text: string; tone: "better" | "worse" | "same" } | null;
  /** Shown instead when there is no data yet. */
  note: string | null;
};

export type Report = {
  period: { from: string; to: string; words: string; custom: boolean };
  cards: ReportCard[];
  /** Reply SLA met, Fix SLA met. */
  sla: ReportCard[];
  /** True: the projects count all time; false: in the period. */
  projectsAllTime: boolean;
  filters: {
    customers: { id: string; company: string }[];
    developers: { id: string; name: string }[];
  };
  week: { day: string; count: number }[];
  projects: { id: string; name: string; count: number }[];
  developers: {
    id: string;
    name: string;
    jobTitle: string | null;
    assigned: number;
    resolved: number;
    firstResponse: string | null;
  }[];
};

/** GET /team/settings (screen 33). Targets are short: "4h", "1bd". */
export type AppSettings = {
  responseTargets: Record<"URGENT" | "HIGH" | "MEDIUM" | "LOW", string>;
  resolutionTargets: Record<"URGENT" | "HIGH" | "MEDIUM" | "LOW", string>;
  /** Bank holidays, "YYYY-MM-DD": not business days. */
  slaCalendar: { bankHolidays: string[] };
  requestRules: { reopenWithinDays: number };
  teamNotifications: {
    urgentAlert: boolean;
    notifyAssigneeOnReply: boolean;
    dailyDigest: boolean;
    autoCloseResolvedAfter7Days: boolean;
  };
};

/** One testimonial on the Website content screen (GET /team/website). */
export type TeamTestimonial = {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  company: string | null;
  showOnHome: boolean;
  showOnCaseStudy: boolean;
  createdAt: string;
  addedBy: string | null;
};

/** GET /team/website: the Website content screen. */
export type WebsiteContentView = {
  liveProjectUrl: string;
  testimonials: TeamTestimonial[];
};

/** GET /team/profile: the team member's own Profile settings. */
export type TeamProfile = {
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEVELOPER";
  jobTitle: string | null;
  phone: string | null;
  country: string | null;
  timezone: string;
};

/** GET /team/emails: emails still being retried, and those that gave up. */
export type FailedEmail = {
  id: string;
  to: string;
  subject: string;
  attempts: number;
  lastError: string;
  state: "retrying" | "failed";
  nextTryAt: string | null;
  createdAt: string;
};

export type FailedEmailsView = { items: FailedEmail[] };
