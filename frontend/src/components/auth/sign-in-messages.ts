import { apiFetch } from "@/lib/api";
import type { Me } from "@/lib/auth/me";
import { routes } from "@/lib/routes";

/** A sentence for a failed Better Auth call (sign in, codes). */
export function authErrorMessage(error: {
  status?: number;
  message?: string;
}): string {
  if (error.status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (error.status === 403) {
    return "This account is not active. Ask our team to send you a new invitation.";
  }
  if (error.status === 401) {
    return "The email or password is not right.";
  }
  return "We could not sign you in. Please try again.";
}

/** Where to go once signed in: the person's own area, or the two-factor setup. */
export async function destinationAfterSignIn(): Promise<string> {
  const me = await apiFetch<Me>("/me");
  if (me.area === "portal") return routes.portal;
  return me.twoFactorEnabled ? routes.team : routes.teamTwoFactor;
}
