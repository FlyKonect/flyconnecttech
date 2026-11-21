"use client";

import Link from "next/link";
import { ChevronDown, ChevronsUpDown, LogOut, UserRound } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { useSignOut } from "@/components/auth/use-sign-out";
import { useVisitKey } from "@/components/auth/use-visit-key";
import { Avatar } from "@/components/ui/avatar";
import { RowMenuItem, menuPanel } from "@/components/ui/row-menu";

type UserMenuProps = {
  area: "portal" | "team";
  name: string;
  /** "Super admin · Founder" for the team, the company for customers. */
  detail: string;
  profileHref: string;
  /** "header" (default) or "sidebar": the card at the foot of the navy sidebar. */
  placement?: "header" | "sidebar";
};

/**
 * The signed-in person at the right of the header. A click opens a short
 * menu: Profile settings and Logout. On phones only the avatar shows.
 * Arrow keys move through the menu; Escape closes it.
 *
 * Next.js keeps a page you leave (for example by Logout) and shows it again
 * as it was: a fresh key brings the menu back closed, with Logout ready.
 */
export function UserMenu(props: UserMenuProps) {
  return <UserMenuButton key={useVisitKey()} {...props} />;
}

function UserMenuButton({
  area,
  name,
  detail,
  profileHref,
  placement = "header",
}: UserMenuProps) {
  const { signOut, signingOut } = useSignOut(area);
  const inSidebar = placement === "sidebar";
  // The team's sidebar is navy; the client portal's is white.
  const onNavy = area === "team";

  return (
    <DropdownMenu.Root modal={false}>
      {inSidebar ? (
        <DropdownMenu.Trigger
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-2 text-left transition-colors ${
            onNavy
              ? "hover:bg-white/8 data-[state=open]:bg-white/10"
              : "hover:bg-soft data-[state=open]:bg-soft"
          }`}
        >
          <span className="sr-only">Your account: </span>
          <Avatar name={name} tone={onNavy ? "gold" : "navy"} size="sm" />
          <span className="min-w-0 flex-1 text-[13px] leading-[1.35]">
            <strong
              className={`block truncate ${onNavy ? "text-white" : "text-navy"}`}
            >
              {name}
            </strong>
            <span
              className={`block truncate ${onNavy ? "text-on-navy-muted" : "text-muted-foreground"}`}
            >
              {detail}
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden="true"
            className={`size-4 shrink-0 ${onNavy ? "text-on-navy-muted" : "text-muted-foreground"}`}
          />
        </DropdownMenu.Trigger>
      ) : (
        <DropdownMenu.Trigger className="flex cursor-pointer items-center gap-2.5 rounded-xl p-1 text-left hover:bg-soft data-[state=open]:bg-soft app:pr-2">
          <span className="sr-only">Account menu: </span>
          <Avatar name={name} />
          <span className="text-[13px] leading-[1.3] max-app:hidden">
            <strong className="block">{name}</strong>
            <span className="text-muted-foreground">{detail}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-muted-foreground max-app:hidden"
          />
        </DropdownMenu.Trigger>
      )}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side={inSidebar ? "top" : "bottom"}
          align={inSidebar ? "start" : "end"}
          sideOffset={inSidebar ? 8 : 6}
          collisionPadding={12}
          className={`${menuPanel} ${
            inSidebar
              ? "w-(--radix-dropdown-menu-trigger-width) min-w-[220px]"
              : "min-w-[220px]"
          }`}
        >
          {/* On phones the name isn't in the header: show it here. */}
          <div
            className={`px-3 pt-1.5 pb-2 ${inSidebar ? "hidden" : "app:hidden"}`}
          >
            <p className="text-sm font-bold text-navy">{name}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
          <RowMenuItem asChild className="gap-2.5">
            <Link href={profileHref}>
              <UserRound aria-hidden="true" className="size-4" />
              Profile settings
            </Link>
          </RowMenuItem>
          <RowMenuItem
            className="gap-2.5"
            disabled={signingOut}
            onSelect={(event) => {
              event.preventDefault();
              void signOut();
            }}
          >
            <LogOut aria-hidden="true" className="size-4" />
            {signingOut ? "Signing out…" : "Logout"}
          </RowMenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
