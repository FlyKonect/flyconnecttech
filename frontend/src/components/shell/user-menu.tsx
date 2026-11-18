"use client";

import Link from "next/link";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { useSignOut } from "@/components/auth/use-sign-out";
import { Avatar } from "@/components/ui/avatar";
import { RowMenuItem } from "@/components/ui/row-menu";

/**
 * The signed-in person at the right of the header. A click opens a short
 * menu: Profile settings and Logout. On phones only the avatar shows.
 * Arrow keys move through the menu; Escape closes it.
 */
export function UserMenu({
  area,
  name,
  detail,
  profileHref,
}: {
  area: "portal" | "team";
  name: string;
  /** "Super admin · Founder" for the team, the company for customers. */
  detail: string;
  profileHref: string;
}) {
  const { signOut, signingOut } = useSignOut(area);

  return (
    <DropdownMenu.Root modal={false}>
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
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[220px] rounded-[14px] border border-line-2 bg-white p-1.5 shadow-[0_12px_32px_rgba(2,26,84,0.14)]"
        >
          {/* On phones the name isn't in the header: show it here. */}
          <div className="px-3 pt-1.5 pb-2 app:hidden">
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
