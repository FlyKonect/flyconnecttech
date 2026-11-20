/**
 * Every address in the app, in one place (docs/05-screens-and-routes.md).
 * Link to these instead of typing an address by hand.
 */
export const routes = {
  // Website
  home: "/",
  solutions: "/solutions",
  travel: "/travel-technology",
  services: "/services",
  websiteDevelopment: "/services/website-development",
  uiUxDesign: "/services/ui-ux-design",
  apiIntegrations: "/services/api-integrations",
  caseStudies: "/case-studies",
  about: "/about",
  contact: "/contact",
  support: "/support",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  legalEntity: "/legal-entity-and-ownership",

  // Accounts
  portalSignIn: "/portal/sign-in",
  portalInvitation: "/portal/invitation",
  teamSignIn: "/team/sign-in",
  teamTwoFactor: "/team/two-factor",
  portalForgotPassword: "/portal/forgot-password",
  teamForgotPassword: "/team/forgot-password",

  // Client portal
  portal: "/portal",
  portalRequests: "/portal/requests",
  portalNewRequest: "/portal/requests/new",
  portalNotifications: "/portal/notifications",
  portalProfile: "/portal/profile",
  portalRequest: (code: string) => `/portal/requests/${code}`,
  portalRequestSubmitted: (code: string) =>
    `/portal/requests/${code}/submitted`,

  // Team panel
  team: "/team",
  teamRequests: "/team/requests",
  teamRequest: (code: string) => `/team/requests/${code}`,
  /** A filter of the requests list, as the sidebar links to it. */
  teamRequestsWithStatus: (status: string) => `/team/requests?status=${status}`,
  teamNewCustomer: "/team/customers/new",
  teamNewUser: "/team/users/new",
  teamDemos: "/team/leads/demos",
  teamQuotes: "/team/leads/quotes",
  teamMessages: "/team/leads/messages",
  teamWebsiteContent: "/team/website-content",
  teamCustomers: "/team/customers",
  teamCustomer: (id: string) => `/team/customers/${id}`,
  teamUsers: "/team/users",
  teamReports: "/team/reports",
  teamNotifications: "/team/notifications",
  teamSettings: "/team/settings",
  teamFailedEmails: "/team/failed-emails",
  /** The link in the "Confirm your new email" email. */
  confirmEmail: (token: string) => `/confirm-email/${token}`,
  teamProfile: "/team/profile",
} as const;
