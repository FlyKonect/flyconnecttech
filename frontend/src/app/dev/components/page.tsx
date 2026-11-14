import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComponentGallery } from "@/components/dev/component-gallery";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

/**
 * Shows every shared component and its variants, to compare with the design.
 * Development only: on the live site this address answers "not found".
 */
export default function ComponentsPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <ComponentGallery />;
}
