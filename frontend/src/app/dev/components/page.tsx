import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ComponentGallery } from "@/components/dev/component-gallery";

export const metadata: Metadata = {
  title: "Components",
  robots: { index: false, follow: false },
};

/**
 * Built on each visit, not ahead: the calendar and the dates in the
 * examples need today's date.
 */
async function Gallery() {
  await connection();
  return <ComponentGallery />;
}

/**
 * Shows every shared component and its variants, to compare with the design.
 * Development only: on the live site this address answers "not found".
 */
export default function ComponentsPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <Suspense fallback={null}>
      <Gallery />
    </Suspense>
  );
}
