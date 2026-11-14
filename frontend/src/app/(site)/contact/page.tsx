import type { Metadata } from "next";

import { ContactPage } from "@/components/site/pages/contact";

export const metadata: Metadata = {
  title: "Contact & Quote",
  description:
    "Get a quote, ask a question or book a demo. We reply with next steps, a rough scope and an estimate within [X business days].",
};

export default function Page() {
  return <ContactPage />;
}
