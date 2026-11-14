import type { Metadata } from "next";

import { SupportPage } from "@/components/site/pages/support";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Already working with us? Sign in to the client portal to send a support request, follow its progress and reply to the team.",
};

export default function Page() {
  return <SupportPage />;
}
