"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/routes";

/**
 * Signs out (docs/01: customers go back to sign in, team members to team
 * sign in). Returns the function and whether it is running.
 */
export function useSignOut(area: "portal" | "team") {
  const router = useRouter();
  const [signingOut, setSigningOut] = React.useState(false);

  const signOut = React.useCallback(async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
    } finally {
      router.replace(area === "team" ? routes.teamSignIn : routes.portalSignIn);
      router.refresh();
    }
  }, [area, router]);

  return { signOut, signingOut };
}
