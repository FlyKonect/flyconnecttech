"use client";

import type * as React from "react";
import Link from "next/link";

import { useSignedInArea } from "@/lib/auth/signed-in-area";
import { routes } from "@/lib/routes";

type Labels = { portal: string; team: string };

/** Where a signed-in visitor's own area is, and what it is called. */
export const ACCOUNT_LABELS: Labels = {
  portal: "Client portal",
  team: "Team panel",
};

/**
 * "Client login" for visitors. Once the visitor turns out to be signed in,
 * it becomes a link to their own area ("Client portal" or "Team panel").
 */
export function AccountLink({
  label = "Client login",
  signedIn = ACCOUNT_LABELS,
  icon,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href" | "children"> & {
  /** The words for visitors who aren't signed in. */
  label?: string;
  /** The words once signed in. */
  signedIn?: Labels;
  /** Shown after the words in both cases, for example an arrow. */
  icon?: React.ReactNode;
}) {
  const area = useSignedInArea();
  return (
    <Link
      {...props}
      href={
        area === "team"
          ? routes.team
          : area === "portal"
            ? routes.portal
            : routes.portalSignIn
      }
    >
      {area ? signedIn[area] : label}
      {icon}
    </Link>
  );
}

/** Shown only to visitors who aren't signed in (for example "Open my invitation"). */
export function HideWhenSignedIn({ children }: { children: React.ReactNode }) {
  const area = useSignedInArea();
  return area ? null : <>{children}</>;
}
