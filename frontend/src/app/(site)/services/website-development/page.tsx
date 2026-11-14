import type { Metadata } from "next";

import { WebsiteDevelopmentPage } from "@/components/site/pages/website-development";

export const metadata: Metadata = {
  title: "Website Development",
  description:
    "Whether you need a brand-new site, a redesign, or software that replaces spreadsheets, we build it to fit your process.",
};

export default function Page() {
  return <WebsiteDevelopmentPage />;
}
