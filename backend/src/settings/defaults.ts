/**
 * The app's settings and their starting values (docs/02, "Setting").
 * A super admin changes them on the Settings screen (Phase 10).
 */

/** How quickly the team must respond, per priority. Used for SLA due times. */
export type ResponseTargets = Record<
  'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW',
  string
>;

/** The four team notification switches. */
export type TeamNotifications = {
  urgentAlert: boolean;
  notifyAssigneeOnReply: boolean;
  dailyDigest: boolean;
  autoCloseResolvedAfter7Days: boolean;
};

export type Settings = {
  responseTargets: ResponseTargets;
  teamNotifications: TeamNotifications;
};

/** What the website shows that the team can change (Website content screen). */
export type WebsiteSettings = {
  /** Where the website's "View live project" buttons go. */
  liveProjectUrl: string;
};

/** Saved under the setting key "website"; these apply while it is missing. */
export const defaultWebsite: WebsiteSettings = {
  liveProjectUrl: 'https://dev.flyconnect.co.uk',
};

export const defaultSettings: Settings = {
  // h = hours, bd = business days.
  responseTargets: { URGENT: '1h', HIGH: '4h', MEDIUM: '1bd', LOW: '2bd' },
  teamNotifications: {
    urgentAlert: true,
    notifyAssigneeOnReply: true,
    dailyDigest: true,
    autoCloseResolvedAfter7Days: false,
  },
};
