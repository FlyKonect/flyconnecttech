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
