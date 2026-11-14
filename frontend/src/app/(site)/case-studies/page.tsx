import type { Metadata } from "next";

import { CaseStudiesPage } from "@/components/site/pages/case-studies";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "A public booking website for customers and a B2B dashboard for staff, agents and sub-agents for a UK travel business, with live Amadeus flights, Stripe payments, finance tools and reporting.",
};

export default function Page() {
  return <CaseStudiesPage />;
}
