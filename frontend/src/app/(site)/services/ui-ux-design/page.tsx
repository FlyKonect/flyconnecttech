import type { Metadata } from "next";

import { UiUxDesignPage } from "@/components/site/pages/ui-ux-design";

export const metadata: Metadata = {
  title: "UI/UX Design",
  description:
    "Every project starts with user flows and a clickable Figma prototype, so decisions are made early, when they are cheap to change.",
};

export default function Page() {
  return <UiUxDesignPage />;
}
