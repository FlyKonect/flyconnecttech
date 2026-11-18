import type { Metadata } from "next";

import { LegalEntityPage } from "@/components/site/pages/legal";

export const metadata: Metadata = {
  title: "Legal Entity and Ownership",
  description:
    "FlyConnect Tech is a trading brand and technology division operated by FlyConnect Limited, registered in England and Wales, company number 16152024.",
};

export default function Page() {
  return <LegalEntityPage />;
}
