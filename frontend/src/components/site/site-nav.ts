import { Globe, Layers, PenTool, Plug, type LucideIcon } from "lucide-react";

import { routes } from "@/lib/routes";

/**
 * The website's menus, in one place (docs/01, section 2 "Shared parts").
 * The header, the phone menu and the footer all read from here.
 */

export type ServiceLink = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

/** The Services dropdown. The first entry is the Services page itself. */
export const serviceLinks: ServiceLink[] = [
  {
    label: "All services",
    description: "Everything we design, build and connect",
    href: routes.services,
    icon: Layers,
  },
  {
    label: "Website development",
    description: "Websites, web apps and custom software",
    href: routes.websiteDevelopment,
    icon: Globe,
  },
  {
    label: "UI/UX design",
    description: "Flows, Figma prototypes and design systems",
    href: routes.uiUxDesign,
    icon: PenTool,
  },
  {
    label: "API integrations",
    description: "Payments, GDS, CRMs and custom APIs",
    href: routes.apiIntegrations,
    icon: Plug,
  },
];

export type MainLink = { label: string; href: string; services?: true };

/** The main menu, left to right. */
export const mainLinks: MainLink[] = [
  { label: "Solutions", href: routes.solutions },
  { label: "Travel Technology", href: routes.travel },
  { label: "Services", href: routes.services, services: true },
  { label: "Case Studies", href: routes.caseStudies },
  { label: "About", href: routes.about },
];

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export const footerColumns: FooterColumn[] = [
  {
    title: "Solutions",
    links: [
      { label: "Ready-made products", href: routes.solutions },
      { label: "Custom software", href: routes.websiteDevelopment },
      { label: "API integrations", href: routes.apiIntegrations },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Travel technology", href: routes.travel },
      { label: "Website development", href: routes.websiteDevelopment },
      { label: "UI/UX design", href: routes.uiUxDesign },
      { label: "All services", href: routes.services },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: routes.about },
      { label: "Case studies", href: routes.caseStudies },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Clients",
    links: [
      { label: "Support", href: routes.support },
      { label: "Client login", href: routes.portalSignIn },
      { label: "Open my invitation", href: routes.portalInvitation },
    ],
  },
];

/** Is `href` the page being looked at, or the section it belongs to? */
export function isCurrent(href: string, pathname: string): boolean {
  if (href === routes.home) return pathname === routes.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
