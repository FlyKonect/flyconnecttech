import type { Metadata } from "next";

import { PrivacyPage } from "@/components/site/pages/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How FlyConnect Tech collects and uses your personal information when you visit this website, contact us or use the client portal.",
};

export default function Page() {
  return <PrivacyPage />;
}
