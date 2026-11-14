import type { TeamRole } from "@/lib/labels";
import type { TeamNavCounts } from "@/lib/team-nav";

/**
 * TEMPORARY sample people and numbers, taken from the design, so the layouts
 * have something to show before sign-in exists.
 *
 * Phase 4 (accounts) replaces the people with the signed-in user, and
 * Phases 5 and 6 replace the numbers with real ones from the backend.
 * Delete this file then.
 */

export const previewCustomer = {
  name: "Sarah Mitchell",
  company: "Bluewave Holidays",
  requestCount: 6,
  unreadNotifications: 2,
};

export type PreviewTeamUser = {
  name: string;
  jobTitle: string;
  counts: TeamNavCounts;
};

const everyRequest: TeamNavCounts = {
  all: 10,
  new: 1,
  underReview: 2,
  inProgress: 2,
  waiting: 2,
  resolved: 2,
  closed: 1,
  demos: 2,
  quotes: 2,
  messages: 2,
};

export const previewTeam: Record<TeamRole, PreviewTeamUser> = {
  SUPER_ADMIN: {
    name: "Hamza Siddiqui",
    jobTitle: "Founder",
    counts: { ...everyRequest, notifications: 5 },
  },
  ADMIN: {
    name: "Emma Clarke",
    jobTitle: "Support lead",
    counts: { ...everyRequest, notifications: 5 },
  },
  MANAGER: {
    name: "Sofia Martins",
    jobTitle: "Delivery manager",
    counts: { ...everyRequest, notifications: 5 },
  },
  DEVELOPER: {
    name: "Daniyal Ahmed",
    jobTitle: "Integration engineer",
    counts: {
      all: 4,
      underReview: 2,
      inProgress: 1,
      waiting: 0,
      resolved: 1,
      closed: 0,
      notifications: 1,
    },
  },
};

/** The role shown when nobody is signed in yet. */
export const previewDefaultRole: TeamRole = "SUPER_ADMIN";
