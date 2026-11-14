import type { Metadata } from "next";

import { HomePage } from "@/components/site/pages/home";

export const metadata: Metadata = {
  title: { absolute: "FlyConnect Tech" },
  description:
    "We design, develop and integrate custom digital products, travel booking platforms, and business management systems that help companies scale.",
};

export default function Page() {
  return <HomePage />;
}
