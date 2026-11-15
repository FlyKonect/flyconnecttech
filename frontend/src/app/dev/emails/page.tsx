import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EmailGallery } from "@/components/dev/email-gallery";

export const metadata: Metadata = {
  title: "Emails",
  robots: { index: false, follow: false },
};

/**
 * Every email the app sends, with sample content, as designed and as plain
 * text. Development only: on the live site this address answers "not found".
 */
export default function EmailsPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <EmailGallery />;
}
