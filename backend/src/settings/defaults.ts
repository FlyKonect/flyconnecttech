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

/** What customers may do with their requests. */
export type RequestRules = {
  /** A closed request can be reopened for this many days after closing. */
  reopenWithinDays: number;
};

/** Days that are not business days, for the SLA. */
export type SlaCalendar = {
  /** Bank holidays, "YYYY-MM-DD" (England and Wales). */
  bankHolidays: string[];
};

export type Settings = {
  responseTargets: ResponseTargets;
  /** How quickly a request must be fixed, per priority (SLA fix clock). */
  resolutionTargets: ResponseTargets;
  slaCalendar: SlaCalendar;
  requestRules: RequestRules;
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
  // The owner chose these (audit, Phase 2).
  resolutionTargets: { URGENT: '1bd', HIGH: '3bd', MEDIUM: '5bd', LOW: '10bd' },
  // England and Wales bank holidays (gov.uk). Super admins add later years.
  slaCalendar: {
    bankHolidays: [
      '2026-01-01',
      '2026-04-03',
      '2026-04-06',
      '2026-05-04',
      '2026-05-25',
      '2026-08-31',
      '2026-12-25',
      '2026-12-28',
      '2027-01-01',
      '2027-03-26',
      '2027-03-29',
      '2027-05-03',
      '2027-05-31',
      '2027-08-30',
      '2027-12-27',
      '2027-12-28',
    ],
  },
  // The owner chose 14 days (audit, Phase 2).
  requestRules: { reopenWithinDays: 14 },
  teamNotifications: {
    urgentAlert: true,
    notifyAssigneeOnReply: true,
    dailyDigest: true,
    autoCloseResolvedAfter7Days: false,
  },
};
