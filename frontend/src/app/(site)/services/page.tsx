import type { Metadata } from "next";

import { ServicesPage } from "@/components/site/pages/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Pick one service or the whole journey, from the first Figma prototype to a live platform with payments and APIs.",
};

export default function Page() {
  return <ServicesPage />;
}
