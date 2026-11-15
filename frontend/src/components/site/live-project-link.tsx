import type { CSSProperties, ReactNode } from "react";

import { getSiteContent } from "@/lib/site-content-cache";
import { hostOf } from "@/lib/site-content";

/**
 * A "View live project" link. It opens the address saved on the team
 * panel's Website content screen, in a new tab.
 */
export async function LiveProjectLink({
  style,
  className,
  children,
}: {
  style?: CSSProperties;
  className?: string;
  children: ReactNode;
}) {
  const { liveProjectUrl } = await getSiteContent();
  return (
    <a
      href={liveProjectUrl}
      target="_blank"
      rel="noopener"
      style={style}
      className={className}
    >
      {children}
    </a>
  );
}

/** The live project's address without https://, for example "dev.flyconnect.co.uk". */
export async function LiveProjectHost() {
  const { liveProjectUrl } = await getSiteContent();
  return <>{hostOf(liveProjectUrl)}</>;
}
