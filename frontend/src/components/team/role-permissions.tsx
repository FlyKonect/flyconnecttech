import {
  Check,
  Code2,
  Crown,
  ShieldCheck,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";

import { roleDescriptions, roles, type TeamRole } from "@/lib/labels";

/**
 * The rows of "What each role can do", each tied to the backend actions it
 * stands for. The ticks come from the backend's permission table.
 */
export const PERMISSION_ROWS: {
  label: string;
  actions: string[];
  /** Developers have it only for their own requests: "Own". */
  developerOwn?: boolean;
}[] = [
  {
    label: "See all support requests",
    actions: ["requests.view"],
    developerOwn: true,
  },
  { label: "Reply and add internal notes", actions: ["requests.reply"] },
  { label: "Assign requests to developers", actions: ["requests.assign"] },
  {
    label: "Change priority, close requests",
    actions: ["requests.changePriority", "requests.close"],
  },
  { label: "View customers and projects", actions: ["customers.view"] },
  { label: "Add customers and projects", actions: ["customers.manage"] },
  { label: "Add team users", actions: ["users.invite"] },
  {
    label: "Delete team users and customers (their history is kept)",
    actions: ["users.delete", "customers.delete"],
  },
  {
    label: "Website leads: demos, quotes, messages",
    actions: ["leads.manage"],
  },
  { label: "Convert a lead to a customer", actions: ["leads.convert"] },
  {
    label: "Website content: testimonials and live project link",
    actions: ["website.manage"],
  },
  { label: "Reports and analytics", actions: ["reports.view"] },
  { label: "Settings", actions: ["settings.manage"] },
];

export type PermissionCell = "yes" | "own" | "no";

export function permissionCell(
  row: (typeof PERMISSION_ROWS)[number],
  role: TeamRole,
  permissions: Record<string, TeamRole[]>,
): PermissionCell {
  const allowed = row.actions.every((action) =>
    (permissions[action] ?? []).includes(role),
  );
  if (!allowed) return "no";
  return row.developerOwn && role === "DEVELOPER" ? "own" : "yes";
}

/** One icon per team role, used on the role cards and the access panel. */
export const ROLE_ICONS: Record<TeamRole, LucideIcon> = {
  SUPER_ADMIN: Crown,
  ADMIN: ShieldCheck,
  MANAGER: UsersRound,
  DEVELOPER: Code2,
};

/**
 * What the chosen role can do (Add user, right). Only that role: what it can
 * do with a tick, then what it can't, greyed. Changes as soon as another
 * role is picked.
 */
export function RoleAccess({
  role,
  permissions,
}: {
  role: TeamRole;
  permissions: Record<string, TeamRole[]>;
}) {
  const Icon = ROLE_ICONS[role];
  const cells = PERMISSION_ROWS.map((row) => ({
    row,
    cell: permissionCell(row, role, permissions),
  }));
  const can = cells.filter(({ cell }) => cell !== "no");
  const cannot = cells.filter(({ cell }) => cell === "no");
  const label = roles[role].label;

  return (
    <section
      aria-labelledby="role-access"
      aria-live="polite"
      className="min-w-0 flex-[1_1_320px] rounded-[22px] border border-line-2 bg-white app:sticky app:top-[96px]"
    >
      <div className="flex items-center gap-3 rounded-t-[22px] bg-navy p-5 text-white">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-gold">
          <Icon aria-hidden="true" className="size-[22px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 id="role-access" className="text-[17px] font-bold">
            What {/^[AEIOU]/.test(label) ? "an" : "a"} {label} can do
          </h2>
          <p className="text-[13px] text-on-navy">{roleDescriptions[role]}</p>
        </div>
      </div>

      <div className="p-5">
        <ul className="flex flex-col gap-2.5 text-sm">
          {can.map(({ row, cell }) => (
            <li key={row.label} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                <Check
                  aria-hidden="true"
                  className="size-3.5"
                  strokeWidth={3}
                />
              </span>
              <span className="font-semibold text-[#23324F]">
                {row.label}
                {cell === "own" ? (
                  <span className="ml-1.5 rounded-full bg-tint px-2 py-0.5 text-[11px] font-bold text-navy-700">
                    Only their own
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>

        {cannot.length ? (
          <>
            <p className="mt-5 mb-2.5 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Not included
            </p>
            <ul className="flex flex-col gap-2.5 text-sm">
              {cannot.map(({ row }) => (
                <li key={row.label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-soft text-muted-foreground">
                    <X
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={2.5}
                    />
                  </span>
                  <span className="text-muted-foreground">
                    <span className="sr-only">Not included: </span>
                    {row.label}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="mt-5 border-t border-line-3 pt-4 text-xs leading-normal text-muted-foreground">
          Admins can add every role except super admin. The backend checks every
          action against these permissions.
        </p>
      </div>
    </section>
  );
}
