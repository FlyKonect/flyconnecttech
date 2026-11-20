"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { env } from "@/env";
import { cn } from "@/lib/utils";

/**
 * "Download CSV" (super admins and admins): the backend's export of this
 * list, with the filters in the address (not the page number), so the file
 * holds every matching row.
 */
export function DownloadCsv({
  path,
  className,
}: {
  /** The backend's export, for example "/team/requests/export.csv". */
  path: string;
  className?: string;
}) {
  const params = useSearchParams();
  const query = new URLSearchParams(params.toString());
  query.delete("page");
  query.delete("size");
  const search = query.toString();
  return (
    <a
      href={`${env.NEXT_PUBLIC_API_URL}${path}${search ? `?${search}` : ""}`}
      download
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-[46px] shrink-0",
        className,
      )}
    >
      <Download aria-hidden="true" className="size-4" />
      Download CSV
    </a>
  );
}
