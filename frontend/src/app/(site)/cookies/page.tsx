import type { Metadata } from "next";

import { CookiesPage } from "@/components/site/pages/legal";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Which cookies the FlyConnect Tech website uses, and why. Only the cookies needed to sign in.",
};

export default function Page() {
  return <CookiesPage />;
}
