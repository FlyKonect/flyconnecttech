import type { Metadata } from "next";

import { SolutionsPage } from "@/components/site/pages/solutions";

export const metadata: Metadata = {
  title: "Products & Solutions",
  description:
    "Start from a ready-made product, build something custom, or connect the systems you already use. One team takes it from idea to launch.",
};

export default function Page() {
  return <SolutionsPage />;
}
