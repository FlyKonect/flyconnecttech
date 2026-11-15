import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/env";
import type { Me } from "@/lib/auth/me";
import { routes } from "@/lib/routes";

/**
 * Who is signed in, for server components and layouts. It asks the backend
 * with the visitor's own cookies, so the answer is always the backend's.
 * Asked once per page view, however many components call it.
 * Reads cookies, so call it inside a <Suspense> boundary.
 */
export const getMe = cache(async (): Promise<Me | null> => {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return null;

  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(`The backend answered ${response.status} to GET /me.`);
  }
  return (await response.json()) as Me;
});

/** Where a signed-in person belongs. */
export function homeFor(me: Me): string {
  if (me.area === "portal") return routes.portal;
  return me.twoFactorEnabled ? routes.team : routes.teamTwoFactor;
}

/** For the client portal: a signed-in customer, or a redirect. */
export async function requireCustomer(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect(routes.portalSignIn);
  if (me.area !== "portal") redirect(homeFor(me));
  return me;
}

/** For the team panel: a team member with two-factor set up, or a redirect. */
export async function requireTeamMember(): Promise<Me> {
  const me = await getMe();
  if (!me) redirect(routes.teamSignIn);
  if (me.area !== "team" || !me.twoFactorEnabled) redirect(homeFor(me));
  return me;
}
