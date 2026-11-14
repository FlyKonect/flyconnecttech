import type { Metadata } from "next";

import { TravelTechnologyPage } from "@/components/site/pages/travel-technology";

export const metadata: Metadata = {
  title: "Travel Technology",
  description:
    "We built a complete Amadeus-powered booking and agency platform, so we know where the hard parts are: live fares, price changes, ticketing and agent commissions.",
};

export default function Page() {
  return <TravelTechnologyPage />;
}
