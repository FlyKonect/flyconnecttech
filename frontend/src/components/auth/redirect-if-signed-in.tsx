import { redirect } from "next/navigation";

import { getMe, homeFor } from "@/lib/auth/server";

/**
 * On the sign-in pages: someone already signed in goes straight to their own
 * area. Reads cookies, so place it inside <Suspense>.
 */
export async function RedirectIfSignedIn() {
  let destination: string | null = null;
  try {
    const me = await getMe();
    if (me) destination = homeFor(me);
  } catch {
    // The backend is not answering: just show the sign-in form.
  }
  if (destination) redirect(destination);
  return null;
}
