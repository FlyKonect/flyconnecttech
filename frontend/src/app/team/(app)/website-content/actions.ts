"use server";

import { updateTag } from "next/cache";

import { getMe } from "@/lib/auth/server";
import { SITE_CONTENT_TAG } from "@/lib/site-content";

/**
 * Called after a change on the Website content screen: the website drops
 * its copy, so the next visitor sees the change straight away. Only for
 * people who may manage website content (the backend made the change).
 */
export async function refreshWebsite(): Promise<void> {
  const me = await getMe();
  if (!me?.actions.includes("website.manage")) return;
  updateTag(SITE_CONTENT_TAG);
}
