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

  // Accounts
  portalSignIn: "/portal/sign-in",
  portalInvitation: "/portal/invitation",
  teamSignIn: "/team/sign-in",

  // Client portal
  portal: "/portal",
  portalRequests: "/portal/requests",
  portalNewRequest: "/portal/requests/new",
  portalNotifications: "/portal/notifications",
  portalProfile: "/portal/profile",

  // Team panel
  team: "/team",
  teamRequests: "/team/requests",
  teamDemos: "/team/leads/demos",
  teamQuotes: "/team/leads/quotes",
  teamMessages: "/team/leads/messages",
  teamCustomers: "/team/customers",
  teamUsers: "/team/users",
  teamReports: "/team/reports",
  teamNotifications: "/team/notifications",
  teamSettings: "/team/settings",
} as const;
