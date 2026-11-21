/**
 * Every display label and pill colour in one place.
 *
 * The keys (IN_PROGRESS, SUPER_ADMIN, ...) are the values stored in the
 * database (docs/02-data-model.md). The labels and colours are what people
 * see (docs/03-design-system.md, "Pills"). Never write a label or a pill
 * colour anywhere else: import it from here.
 */

/** Background and text colour of a pill. */
export type Tone = { bg: string; text: string };

type Labelled = { label: string };
type WithTone = Labelled & { tone: Tone };

const tone = (bg: string, text: string): Tone => ({ bg, text });

// Tones that several groups share.
const GREEN = tone("#DCFCE7", "#15803D");
const AMBER = tone("#FEF3C7", "#92400E");
const BLUE = tone("#E3E9F5", "#0C3584");
const SKY = tone("#E0F2FE", "#0369A1");
const ORANGE = tone("#FFEDD5", "#C2410C");
const RED = tone("#FEE2E2", "#B91C1C");
const VIOLET = tone("#EDE9FE", "#6D28D9");
const SLATE = tone("#F1F5F9", "#475569");
const MINT = tone("#ECFDF5", "#047857");
const GREY = tone("#E5E7EB", "#374151");

// ---------------------------------------------------------------- People

export type Role =
  "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "DEVELOPER" | "CUSTOMER";
/** The four roles that work in the team panel. */
export type TeamRole = Exclude<Role, "CUSTOMER">;

export const roles: Record<Role, WithTone> = {
  SUPER_ADMIN: { label: "Super admin", tone: tone("#021A54", "#FFFFFF") },
  ADMIN: { label: "Admin", tone: BLUE },
  MANAGER: { label: "Manager", tone: VIOLET },
  DEVELOPER: { label: "Developer", tone: GREEN },
  CUSTOMER: { label: "Customer", tone: tone("#EEF2FA", "#0C3584") },
};

/** One line per team role: the Users tiles and the Add user cards. */
export const roleDescriptions: Record<TeamRole, string> = {
  SUPER_ADMIN: "Full access, including settings",
  ADMIN: "Customers, users and all requests",
  MANAGER: "All requests, assignment and reports",
  DEVELOPER: "Only requests assigned to them",
};

export type UserStatus = "INVITED" | "ACTIVE" | "DISABLED";

export const userStatuses: Record<UserStatus, WithTone> = {
  INVITED: { label: "Invited", tone: AMBER },
  ACTIVE: { label: "Active", tone: GREEN },
  DISABLED: { label: "Disabled", tone: SLATE },
};

// -------------------------------------------------------------- Projects

export type ProjectType =
  | "WEBSITE"
  | "WEB_APPLICATION"
  | "TRAVEL_BOOKING_PLATFORM"
  | "AGENT_PORTAL"
  | "API_INTEGRATION"
  | "CUSTOM_SOFTWARE"
  | "UI_UX_DESIGN"
  | "MAINTENANCE_PLAN";

export const projectTypes: Record<ProjectType, Labelled> = {
  WEBSITE: { label: "Website" },
  WEB_APPLICATION: { label: "Web application" },
  TRAVEL_BOOKING_PLATFORM: { label: "Travel booking platform" },
  AGENT_PORTAL: { label: "Agent portal" },
  API_INTEGRATION: { label: "API integration" },
  CUSTOM_SOFTWARE: { label: "Custom software" },
  UI_UX_DESIGN: { label: "UI/UX design" },
  MAINTENANCE_PLAN: { label: "Maintenance plan" },
};

export type ProjectStatus =
  "PLANNING" | "IN_DESIGN" | "IN_DEVELOPMENT" | "LIVE" | "COMPLETED";

export const projectStatuses: Record<ProjectStatus, WithTone> = {
  PLANNING: { label: "Planning", tone: SLATE },
  IN_DESIGN: { label: "In design", tone: VIOLET },
  IN_DEVELOPMENT: { label: "In development", tone: BLUE },
  LIVE: { label: "Live", tone: GREEN },
  COMPLETED: { label: "Completed", tone: MINT },
};

// ------------------------------------------------------ Support requests

export type RequestType =
  | "TECHNICAL_ISSUE"
  | "BUG_REPORT"
  | "FEATURE_REQUEST"
  | "INTEGRATION_PROBLEM"
  | "DESIGN_MODIFICATION"
  | "GENERAL_INQUIRY"
  | "MAINTENANCE_REQUEST";

export const requestTypes: Record<
  RequestType,
  Labelled & { description: string }
> = {
  TECHNICAL_ISSUE: {
    label: "Technical Issue",
    description: "Something is not working as expected",
  },
  BUG_REPORT: {
    label: "Bug Report",
    description: "An error you can reproduce",
  },
  FEATURE_REQUEST: {
    label: "Feature Request",
    description: "Something new you would like added",
  },
  INTEGRATION_PROBLEM: {
    label: "Integration Problem",
    description: "API, GDS or payment issues",
  },
  DESIGN_MODIFICATION: {
    label: "Design Modification",
    description: "Changes to layout, content or styles",
  },
  GENERAL_INQUIRY: {
    label: "General Inquiry",
    description: "Questions about your project",
  },
  MAINTENANCE_REQUEST: {
    label: "Maintenance Request",
    description: "Updates, renewals and routine work",
  },
};

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const priorities: Record<Priority, WithTone> = {
  LOW: { label: "Low", tone: SLATE },
  MEDIUM: { label: "Medium", tone: SKY },
  HIGH: { label: "High", tone: ORANGE },
  URGENT: { label: "Urgent", tone: RED },
};

export type RequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export const requestStatuses: Record<RequestStatus, WithTone> = {
  SUBMITTED: { label: "Submitted", tone: tone("#EEF2F7", "#3E4C66") },
  UNDER_REVIEW: { label: "Under Review", tone: AMBER },
  IN_PROGRESS: { label: "In Progress", tone: BLUE },
  WAITING_FOR_CUSTOMER: { label: "Waiting for Customer", tone: ORANGE },
  RESOLVED: { label: "Resolved", tone: GREEN },
  CLOSED: { label: "Closed", tone: GREY },
};

/** Not stored: worked out from the due time (docs/01, "SLA"). */
export type SlaState = "AT_RISK" | "PAUSED" | "ON_TRACK" | "MET";

export const slaStates: Record<SlaState, WithTone> = {
  AT_RISK: { label: "At risk", tone: RED },
  PAUSED: { label: "Paused", tone: SLATE },
  ON_TRACK: { label: "On track", tone: MINT },
  MET: { label: "Met", tone: MINT },
};

// ---------------------------------------------------------- Website leads

export type DemoTopic =
  | "TRAVEL_BOOKING_PLATFORM"
  | "AGENT_ADMIN_DASHBOARDS"
  | "CUSTOM_SOFTWARE_WEBSITES"
  | "API_INTEGRATIONS";

export const demoTopics: Record<DemoTopic, Labelled> = {
  TRAVEL_BOOKING_PLATFORM: { label: "Travel booking platform" },
  AGENT_ADMIN_DASHBOARDS: { label: "Agent and admin dashboards" },
  CUSTOM_SOFTWARE_WEBSITES: { label: "Custom software and websites" },
  API_INTEGRATIONS: { label: "API and integrations" },
};

export type DemoStatus = "NEW" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

const LEAD_NEW = tone("#EEF2FA", "#0C3584");

export const demoStatuses: Record<DemoStatus, WithTone> = {
  NEW: { label: "New", tone: LEAD_NEW },
  SCHEDULED: { label: "Scheduled", tone: VIOLET },
  COMPLETED: { label: "Completed", tone: MINT },
  CANCELLED: { label: "Cancelled", tone: SLATE },
};

export type QuoteProjectType =
  | "TRAVEL_BOOKING_PLATFORM"
  | "AMADEUS_SABRE_INTEGRATION"
  | "NEW_WEBSITE"
  | "WEBSITE_REDESIGN"
  | "CUSTOM_SOFTWARE"
  | "UI_UX_DESIGN"
  | "API_INTEGRATION"
  | "OTHER";

export const quoteProjectTypes: Record<QuoteProjectType, Labelled> = {
  TRAVEL_BOOKING_PLATFORM: { label: "Travel booking platform" },
  AMADEUS_SABRE_INTEGRATION: { label: "Amadeus / Sabre integration" },
  NEW_WEBSITE: { label: "New website" },
  WEBSITE_REDESIGN: { label: "Website redesign" },
  CUSTOM_SOFTWARE: { label: "Custom software" },
  UI_UX_DESIGN: { label: "UI/UX design" },
  API_INTEGRATION: { label: "API integration" },
  OTHER: { label: "Other" },
};

export type Budget =
  "UNDER_5K" | "FROM_5K_TO_15K" | "FROM_15K_TO_50K" | "OVER_50K" | "NOT_SURE";

export const budgets: Record<Budget, Labelled> = {
  UNDER_5K: { label: "Under £5k" },
  FROM_5K_TO_15K: { label: "£5k – £15k" },
  FROM_15K_TO_50K: { label: "£15k – £50k" },
  OVER_50K: { label: "£50k+" },
  NOT_SURE: { label: "Not sure yet" },
};

export type Timeline =
  "ASAP" | "WITHIN_1_3_MONTHS" | "WITHIN_3_6_MONTHS" | "NOT_SURE";

export const timelines: Record<Timeline, Labelled> = {
  ASAP: { label: "As soon as possible" },
  WITHIN_1_3_MONTHS: { label: "Within 1–3 months" },
  WITHIN_3_6_MONTHS: { label: "Within 3–6 months" },
  NOT_SURE: { label: "Not sure yet" },
};

export type QuoteStatus =
  "NEW" | "REVIEWING" | "ESTIMATE_SENT" | "WON" | "LOST";

export const quoteStatuses: Record<QuoteStatus, WithTone> = {
  NEW: { label: "New", tone: LEAD_NEW },
  REVIEWING: { label: "Reviewing", tone: AMBER },
  ESTIMATE_SENT: { label: "Estimate sent", tone: SKY },
  WON: { label: "Won", tone: GREEN },
  LOST: { label: "Lost", tone: RED },
};

export type MessageTopic =
  "GENERAL_QUESTION" | "PARTNERSHIP" | "EXISTING_PROJECT" | "SOMETHING_ELSE";

export const messageTopics: Record<MessageTopic, Labelled> = {
  GENERAL_QUESTION: { label: "General question" },
  PARTNERSHIP: { label: "Partnership" },
  EXISTING_PROJECT: { label: "An existing project" },
  SOMETHING_ELSE: { label: "Something else" },
};

export type ContactStatus = "NEW" | "REPLIED" | "CLOSED";

export const contactStatuses: Record<ContactStatus, WithTone> = {
  NEW: { label: "New", tone: LEAD_NEW },
  REPLIED: { label: "Replied", tone: SKY },
  CLOSED: { label: "Closed", tone: GREY },
};

// ---------------------------------------------------------- Notifications

export type NotificationKind =
  | "reply"
  | "info"
  | "status"
  | "ok"
  | "closed"
  | "urgent"
  | "new"
  | "high"
  | "review"
  | "invite"
  | "lead";

/** Dot colour of a notification row, by kind. */
export const notificationDots: Record<NotificationKind, string> = {
  reply: "#021A54",
  new: "#021A54",
  info: "#EA580C",
  high: "#EA580C",
  status: "#7C3AED",
  invite: "#7C3AED",
  ok: "#16A34A",
  closed: "#64748B",
  urgent: "#DC2626",
  review: "#CA8A04",
  lead: "#D3AF34",
};

/** The small heading above a notification's text (screens 14 and 32). */
export const notificationHeadings: Record<NotificationKind, string> = {
  reply: "New reply",
  info: "Action required",
  status: "Status change",
  ok: "Update",
  closed: "Closed",
  urgent: "Urgent request",
  new: "New request",
  high: "High priority",
  review: "Assignment",
  invite: "Invitation",
  lead: "Website",
};

// ---------------------------------------------------------- Website content

/** Where a testimonial shows on the website (the Website content screen). */
export type TestimonialPlace = "HOME" | "CASE_STUDY";

export const testimonialPlaces: Record<TestimonialPlace, WithTone> = {
  HOME: { label: "Home", tone: BLUE },
  CASE_STUDY: { label: "Case Studies", tone: VIOLET },
};

// ------------------------------------------------------------ Failed emails

/** An email waiting on the Failed emails screen. */
export type EmailState = "retrying" | "failed";

export const emailStates: Record<EmailState, WithTone> = {
  retrying: { label: "Retrying", tone: AMBER },
  failed: { label: "Failed", tone: RED },
};

// ----------------------------------------------------------- Scheduled jobs

/** A scheduled job on the Settings screen (cron health). */
export type JobState = "onTime" | "late" | "never" | "failed";

export const jobStates: Record<JobState, WithTone> = {
  onTime: { label: "On time", tone: GREEN },
  late: { label: "Late", tone: AMBER },
  never: { label: "Never ran", tone: AMBER },
  failed: { label: "Failed", tone: RED },
};

// ------------------------------------------------------------- Pill lookup

/** Every group that is shown as a coloured pill. */
export const pillGroups = {
  role: roles,
  userStatus: userStatuses,
  projectStatus: projectStatuses,
  priority: priorities,
  requestStatus: requestStatuses,
  sla: slaStates,
  demoStatus: demoStatuses,
  quoteStatus: quoteStatuses,
  contactStatus: contactStatuses,
  testimonialPlace: testimonialPlaces,
  emailState: emailStates,
  jobState: jobStates,
} as const;

export type PillGroup = keyof typeof pillGroups;
export type PillValue<G extends PillGroup> = keyof (typeof pillGroups)[G];
