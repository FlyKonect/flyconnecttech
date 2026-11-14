import type { Metadata } from "next";

import { AboutPage } from "@/components/site/pages/about";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "We design, develop and integrate digital solutions that grow your business, from ready-made products to custom software and API integrations.",
};

export default function Page() {
  return <AboutPage />;
}
