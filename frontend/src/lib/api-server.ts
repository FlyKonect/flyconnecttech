import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { env } from "@/env";
import { readResponse } from "@/lib/api";
import { routes } from "@/lib/routes";

/**
 * Reads from our backend in a server component, with the visitor's own
 * cookies, so the backend decides what this person may see.
 *
 *   const summary = await serverApi<PortalSummary>("/portal/summary");
 *
 * "Not found" and "not allowed" show the not-found page; "signed out" goes
 * to sign in.
 * Reads cookies, so call it inside a <Suspense> boundary.
 */
export async function serverApi<T>(
  path: string,
  options: { signIn?: string } = {},
): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  // "Not allowed" looks the same as "not found", so pages a role can't use
  // (and records it can't see) give nothing away.
  if (response.status === 404 || response.status === 403) notFound();
  if (response.status === 401) redirect(options.signIn ?? routes.portalSignIn);
  return readResponse<T>(response);
}
