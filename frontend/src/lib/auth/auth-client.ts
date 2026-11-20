"use client";

import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { env } from "@/env";

/**
 * Better Auth in the browser: sign in, two-factor codes, sign out.
 * It talks to the backend, which sets the sign-in cookie.
 */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_API_URL,
  basePath: "/api/auth",
  fetchOptions: { credentials: "include" },
  plugins: [twoFactorClient()],
});

/**
 * Customer accounts and team accounts are separate: one email can have one
 * of each, with its own password. Each sign-in page says which side it is,
 * so the backend signs in the right account (backend accounts/login-key.ts).
 */
export function signInSide(side: "customer" | "team") {
  return { headers: { "x-fct-side": side } };
}
