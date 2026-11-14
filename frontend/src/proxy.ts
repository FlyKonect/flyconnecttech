import { NextResponse, type NextRequest } from "next/server";

import { routes } from "@/lib/routes";

/**
 * A quick first check before the portal and team pages: with no sign-in
 * cookie at all, go straight to sign in. The real check (is the session
 * valid, is this the right area, is two-factor set up) happens in the
 * layouts, against the backend.
 */

// Better Auth's session cookie. "__Secure-" is added on the live site (https).
const SESSION_COOKIES = ["fct.session_token", "__Secure-fct.session_token"];

/** Pages under /portal and /team that are open without signing in. */
const OPEN = new Set<string>([
  routes.portalSignIn,
  routes.portalForgotPassword,
  routes.portalInvitation,
  routes.teamSignIn,
  routes.teamForgotPassword,
]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OPEN.has(pathname)) return NextResponse.next();

  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (signedIn) return NextResponse.next();

  const team =
    pathname === routes.team || pathname.startsWith(`${routes.team}/`);
  const target = new URL(
    team ? routes.teamSignIn : routes.portalSignIn,
    request.url,
  );
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/portal/:path*", "/portal", "/team/:path*", "/team"],
};
