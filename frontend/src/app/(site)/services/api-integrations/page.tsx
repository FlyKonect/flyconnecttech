import type { Metadata } from "next";

import { ApiIntegrationsPage } from "@/components/site/pages/api-integrations";

export const metadata: Metadata = {
  title: "API Integrations",
  description:
    "GDS providers, payment gateways, CRMs and custom APIs, connected securely, with webhooks and error handling that keep bookings and payments in sync.",
};

export default function Page() {
  return <ApiIntegrationsPage />;
}
