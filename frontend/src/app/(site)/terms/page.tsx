import type { Metadata } from "next";

import { TermsPage } from "@/components/site/pages/legal";

export const metadata: Metadata = {
  title: "Terms of use",
  description:
    "The rules for using the FlyConnect Tech website and client portal.",
};

export default function Page() {
  return <TermsPage />;
}
