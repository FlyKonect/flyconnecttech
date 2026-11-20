"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { ChangeEmailDialog } from "@/components/team/change-email-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, Select } from "@/components/ui/field";
import { LabelPill } from "@/components/ui/pill";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { formatDayMonth, formatWhen } from "@/lib/format-time";
import { routes } from "@/lib/routes";
import { roles, type TeamRole } from "@/lib/labels";
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
 * of a row resends an invitation, disables or deletes the person; the
 * backend decides who may do that (canManage, canDelete).
 */
export function UsersTable({
  rows,
  timeZone,
  canAdd = false,
  roleChoices = [],
  canResetTwoFactor = false,
}: {
  rows: TeamUserRow[];
  timeZone: string;
  /** Shows "+ Add user" at the right of the search row. */
  canAdd?: boolean;
  /** The roles this person may give (Change role). */
  roleChoices?: TeamRole[];
  /** Super admins: "Reset two-step sign-in". */
  canResetTwoFactor?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [disabling, setDisabling] = React.useState<TeamUserRow | null>(null);
  const [deleting, setDeleting] = React.useState<TeamUserRow | null>(null);
  const [changing, setChanging] = React.useState<TeamUserRow | null>(null);
  const [emailFor, setEmailFor] = React.useState<TeamUserRow | null>(null);
  const [resetting, setResetting] = React.useState<TeamUserRow | null>(null);
  const now = new Date();

  async function enable(user: TeamUserRow) {
    try {
      const { status } = await apiFetch<{ status: string }>(
        `/team/users/${user.id}/enable`,
        { method: "POST" },
      );
      toast(
        status === "INVITED"
          ? `${user.name} is enabled. Resend the invitation so they can activate it.`
          : `${user.name} is enabled and can sign in again`,
      );
      router.refresh();
    } catch (failed) {
      toast(apiErrorMessage(failed));
    }
  }

  async function resend(user: TeamUserRow) {
    try {
      await apiFetch(`/team/users/${user.id}/invitation`, { method: "POST" });
      toast(`Invitation sent again to ${user.email}`);
    } catch (failed) {
      toast(apiErrorMessage(failed));
    }
  }

  const menu = (user: TeamUserRow) =>
    user.canManage ? (
      <RowMenu label={`Actions for ${user.name}`}>
        {user.status === "INVITED" ? (
          <RowMenuItem onSelect={() => resend(user)}>
            Resend invitation
          </RowMenuItem>
        ) : null}
        {user.status !== "DISABLED" ? (
          <RowMenuItem onSelect={() => setEmailFor(user)}>
            Change email
          </RowMenuItem>
        ) : null}
        {roleChoices.length > 0 ? (
          <RowMenuItem onSelect={() => setChanging(user)}>
            Change role
          </RowMenuItem>
        ) : null}
        {canResetTwoFactor && user.status === "ACTIVE" ? (
          <RowMenuItem onSelect={() => setResetting(user)}>
            Reset two-step sign-in
          </RowMenuItem>
        ) : null}
        {user.status === "DISABLED" ? (
          <RowMenuItem onSelect={() => enable(user)}>Enable user</RowMenuItem>
        ) : (
          <RowMenuItem danger onSelect={() => setDisabling(user)}>
            Disable user
          </RowMenuItem>
        )}
        {user.canDelete ? (
          <RowMenuItem danger onSelect={() => setDeleting(user)}>
            Delete user
          </RowMenuItem>
        ) : null}
      </RowMenu>
    ) : null;

  // Search by name, email or job title; the list is long once the team grows.
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? rows.filter((u) =>
        [u.name, u.email, u.jobTitle ?? ""].some((text) =>
          text.toLowerCase().includes(needle),
        ),
      )
    : rows;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex h-11 w-full max-w-[380px] items-center gap-2 rounded-xl border border-input bg-white px-3.5 text-muted-foreground focus-within:border-navy">
          <Search aria-hidden="true" className="size-4 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search team members"
            placeholder="Search by name, email or job title"
            className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
          />
        </label>
        {canAdd ? (
          <Link href={routes.teamNewUser} className={buttonVariants()}>
            + Add user
          </Link>
        ) : null}
      </div>
      <DataTable<TeamUserRow>
        caption="Team members"
        rows={shown}
        rowKey={(u) => u.id}
        empty={
          needle ? "No team members match your search." : "No team members yet."
        }
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
          developers={rows.filter(
            (row) =>
              row.role === "DEVELOPER" &&
              row.status === "ACTIVE" &&
              row.id !== disabling.id,
          )}
          onClose={() => setDisabling(null)}
          onDone={() => {
            toast(`${disabling.name} is disabled`);
            setDisabling(null);
            router.refresh();
          }}
        />
      ) : null}
      {resetting ? (
        <ResetTwoFactorDialog
          user={resetting}
          onClose={() => setResetting(null)}
          onDone={() => {
            toast(
              `Two-step sign-in reset. ${resetting.name} sets it up again at the next sign-in.`,
            );
            setResetting(null);
            router.refresh();
          }}
        />
      ) : null}
      {emailFor ? (
        <ChangeEmailDialog user={emailFor} onClose={() => setEmailFor(null)} />
      ) : null}
      {changing ? (
        <ChangeRoleDialog
          user={changing}
          choices={roleChoices}
          onClose={() => setChanging(null)}
          onDone={(role) => {
            toast(`${changing.name} is now ${roles[role].label}`);
            setChanging(null);
            router.refresh();
          }}
        />
      ) : null}
      {deleting ? (
        <DeleteUserDialog
          user={deleting}
          onClose={() => setDeleting(null)}
          onDone={() => {
            toast(`${deleting.name} is deleted`);
            setDeleting(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

/** "Change {name}'s role": the roles this person may give. */
function ChangeRoleDialog({
  user,
  choices,
  onClose,
  onDone,
}: {
  user: TeamUserRow;
  choices: TeamRole[];
  onClose: () => void;
  onDone: (role: TeamRole) => void;
}) {
  const [role, setRole] = React.useState<TeamRole>(user.role as TeamRole);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const first = user.name.split(/\s+/)[0] || user.name;
  const handsBack =
    user.role === "DEVELOPER" &&
    role !== "DEVELOPER" &&
    (user.openAssigned ?? 0) > 0;

  async function save() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/users/${user.id}/role`, {
        method: "POST",
        body: { role },
      });
      onDone(role);
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Change {user.name}&apos;s role</DialogTitle>
        <DialogDescription>
          The new role applies straight away, the next time {first} opens a
          page.
        </DialogDescription>
        <div className="mt-4">
          <Field label="Role">
            <Select
              value={role}
              onChange={(event) => setRole(event.target.value as TeamRole)}
            >
              {choices.map((choice) => (
                <option key={choice} value={choice}>
                  {roles[choice].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {handsBack ? (
          <p className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3 text-sm leading-[1.55] text-[#92400E]">
            Only developers work on requests: {first}&apos;s{" "}
            {plural(user.openAssigned ?? 0, "open request")} go back to Under
            Review, unassigned.
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
          <Button onClick={save} disabled={busy || role === user.role}>
            {busy ? "Saving…" : "Change role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** "Reset two-step sign-in?" for someone who lost their phone and codes. */
function ResetTwoFactorDialog({
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
  const first = user.name.split(/s+/)[0] || user.name;

  async function reset() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/users/${user.id}/two-factor-reset`, {
        method: "POST",
      });
      onDone();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Reset {user.name}&apos;s two-step sign-in?</DialogTitle>
        <DialogDescription>
          Only when {first} has lost both the authenticator app and the backup
          codes. {first} is signed out everywhere and sets up a new
          authenticator at the next sign-in. Check it really is {first} asking
          first.
        </DialogDescription>
        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={reset} disabled={busy}>
            {busy ? "Resetting…" : "Reset two-step sign-in"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

/**
 * "Disable {name}?" with what happens, then Disable user. A developer's
 * open requests go to the developer chosen here, or back to Under Review
 * unassigned, so no work waits on someone who has left.
 */
function DisableDialog({
  user,
  developers,
  onClose,
  onDone,
}: {
  user: TeamUserRow;
  /** Active developers who could take over (not this person). */
  developers: TeamUserRow[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [transferTo, setTransferTo] = React.useState("");
  const first = user.name.split(/\s+/)[0] || user.name;
  const open = user.openAssigned ?? 0;

  async function disable() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/users/${user.id}/disable`, {
        method: "POST",
        body: { transferTo: transferTo || null },
      });
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
        {open > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3">
            <p className="text-sm leading-[1.55] text-[#92400E]">
              {first} has {plural(open, "open request")}.{" "}
              {transferTo
                ? "They move to the developer chosen below, who is notified."
                : "They go back to Under Review, unassigned, for the team to pick up."}
            </p>
            {developers.length > 0 ? (
              <Field label="Who takes over">
                <Select
                  value={transferTo}
                  onChange={(event) => setTransferTo(event.target.value)}
                >
                  <option value="">Nobody: leave them unassigned</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
          </div>
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

/**
 * "Delete {name}?": the account goes for good, the history stays. What
 * happens is spelled out, because it can't be undone (a restore brings back
 * the history, with a new invitation).
 */
function DeleteUserDialog({
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

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/users/${user.id}/delete`, { method: "POST" });
      onDone();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Delete {user.name}?</DialogTitle>
        <DialogDescription>
          The account is deleted for good. This can&apos;t be undone.
        </DialogDescription>
        <ul className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-[1.55] text-body">
          <li>
            {first} can&apos;t sign in any more, and their personal details are
            erased.
          </li>
          <li>
            They leave the Users list, and {user.email} can be used again.
          </li>
          {user.openAssigned ? (
            <li>
              {plural(user.openAssigned, "open request")} go back to Under
              Review, unassigned.
            </li>
          ) : null}
          <li>
            Their replies and notes stay, shown as &ldquo;{user.name}{" "}
            (deleted)&rdquo;. Adding the same email later offers to restore
            them.
          </li>
        </ul>
        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            {busy ? "Deleting…" : "Delete user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
