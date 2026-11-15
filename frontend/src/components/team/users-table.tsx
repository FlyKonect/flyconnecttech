"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { FormError } from "@/components/auth/form-message";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { LabelPill } from "@/components/ui/pill";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { formatDayMonth, formatWhen } from "@/lib/format-time";
import type { TeamUserRow } from "@/lib/team/types";

import { plural } from "@/lib/plural";

/** "Today, 09:40", "Invited 7 Nov", or "—" for someone who never signed in. */
export function lastActive(user: TeamUserRow, timeZone: string, now: Date) {
  if (user.status === "INVITED") {
    return user.invitedAt
      ? `Invited ${formatDayMonth(user.invitedAt, timeZone)}`
      : "Invited";
  }
  return user.lastActiveAt ? formatWhen(user.lastActiveAt, timeZone, now) : "—";
}

/**
 * The team table on the Users screen (screen 29). The "⋯" menu at the end
 * of a row resends an invitation or disables the person; the backend
 * decides who may do that (canManage).
 */
export function UsersTable({
  rows,
  timeZone,
}: {
  rows: TeamUserRow[];
  timeZone: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [disabling, setDisabling] = React.useState<TeamUserRow | null>(null);
  const now = new Date();

  async function resend(user: TeamUserRow) {
    try {
      await apiFetch(`/team/users/${user.id}/invitation`, { method: "POST" });
      toast(`Invitation sent again to ${user.email}`);
    } catch (failed) {
      toast(apiErrorMessage(failed));
    }
  }

  const menu = (user: TeamUserRow) =>
    user.canManage && user.status !== "DISABLED" ? (
      <RowMenu label={`Actions for ${user.name}`}>
        {user.status === "INVITED" ? (
          <RowMenuItem onSelect={() => resend(user)}>
            Resend invitation
          </RowMenuItem>
        ) : null}
        <RowMenuItem danger onSelect={() => setDisabling(user)}>
          Disable user
        </RowMenuItem>
      </RowMenu>
    ) : null;

  return (
    <>
      <DataTable<TeamUserRow>
        caption="Team members"
        rows={rows}
        rowKey={(u) => u.id}
        empty="No team members yet."
        columns={[
          {
            header: "Name",
            primary: true,
            className: "min-w-[220px]",
            cell: (u) => <Person user={u} />,
          },
          {
            header: "Role",
            cell: (u) => <LabelPill group="role" value={u.role} />,
          },
          {
            header: "Job title",
            className: "min-w-[140px] text-body",
            cell: (u) => u.jobTitle ?? "—",
          },
          {
            header: "Open assigned",
            className: "font-bold",
            cell: (u) => u.openAssigned ?? "—",
          },
          {
            header: "Status",
            cell: (u) => <LabelPill group="userStatus" value={u.status} />,
          },
          {
            header: "Last active",
            className: "whitespace-nowrap text-body",
            cell: (u) => lastActive(u, timeZone, now),
          },
          { header: "", className: "w-12 py-2 text-right", cell: menu },
        ]}
        card={(u) => (
          <span className="flex items-start gap-2 text-navy">
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <Person user={u} />
              <span className="flex flex-wrap gap-1.5">
                <LabelPill group="role" value={u.role} />
                <LabelPill group="userStatus" value={u.status} />
              </span>
              <span className="text-[13px] text-muted-foreground">
                {[
                  u.jobTitle,
                  u.openAssigned === null
                    ? null
                    : plural(u.openAssigned, "open request"),
                  lastActive(u, timeZone, now),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            {menu(u)}
          </span>
        )}
      />
      {disabling ? (
        <DisableDialog
          user={disabling}
          onClose={() => setDisabling(null)}
          onDone={() => {
            toast(`${disabling.name} is disabled`);
            setDisabling(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

function Person({ user }: { user: TeamUserRow }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={user.name} className="size-9" />
      <span className="min-w-0">
        <span className="block font-bold">{user.name}</span>
        <span className="block truncate text-xs font-normal text-muted-foreground">
          {user.email}
        </span>
      </span>
    </span>
  );
}

/** "Disable {name}?" with what happens, then Disable user. */
function DisableDialog({
  user,
  onClose,
  onDone,
}: {
  user: TeamUserRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const first = user.name.split(/\s+/)[0] || user.name;

  async function disable() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/users/${user.id}/disable`, { method: "POST" });
      onDone();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Disable {user.name}?</DialogTitle>
        <DialogDescription>
          {user.status === "INVITED"
            ? `Their invitation link stops working and ${first} can't activate the account.`
            : `${first} is signed out at once and can't sign in again.`}
        </DialogDescription>
        {user.openAssigned ? (
          <p className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm leading-[1.55] text-[#92400E]">
            {plural(user.openAssigned, "open request")} stay assigned to {first}
            . Transfer them to another developer from each request&apos;s page.
          </p>
        ) : null}
        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={disable} disabled={busy}>
            {busy ? "Disabling…" : "Disable user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
