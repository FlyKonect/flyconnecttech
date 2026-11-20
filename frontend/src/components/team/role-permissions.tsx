import { roles, type TeamRole } from "@/lib/labels";
import { cn } from "@/lib/utils";

const ROLE_ORDER: TeamRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "DEVELOPER"];

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

/** "What each role can do" (screen 30, right). */
export function RolePermissions({
  permissions,
}: {
  permissions: Record<string, TeamRole[]>;
}) {
  return (
    <section
      aria-labelledby="role-permissions"
      className="min-w-0 flex-[1_1_340px] overflow-x-auto rounded-[22px] border border-line-2 bg-white p-6"
    >
      <h2 id="role-permissions" className="text-[17px] font-bold">
        What each role can do
      </h2>
      <table className="mt-3 w-full min-w-[340px] border-collapse text-[13px]">
        <thead>
          <tr className="text-[11px] font-bold text-muted-foreground">
            <th scope="col" className="py-2 pr-1.5 text-left font-bold">
              PERMISSION
            </th>
            {ROLE_ORDER.map((role) => (
              <th
                key={role}
                scope="col"
                className="px-1 py-2 text-center font-bold uppercase"
              >
                {roles[role].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_ROWS.map((row) => (
            <tr key={row.label} className="border-t border-line-3">
              <th
                scope="row"
                className="py-2.5 pr-1.5 text-left font-semibold text-[#23324F]"
              >
                {row.label}
              </th>
              {ROLE_ORDER.map((role) => {
                const cell = permissionCell(row, role, permissions);
                return (
                  <td
                    key={role}
                    className={cn(
                      "px-1 py-2.5 text-center",
                      cell === "yes" && "font-bold text-success",
                      cell === "own" && "text-xs font-bold text-navy-700",
                      cell === "no" && "text-[#A3AEC2]",
                    )}
                  >
                    {cell === "yes" ? (
                      <>
                        <span aria-hidden="true">✓</span>
                        <span className="sr-only">Yes</span>
                      </>
                    ) : cell === "own" ? (
                      "Own"
                    ) : (
                      <>
                        <span aria-hidden="true">—</span>
                        <span className="sr-only">No</span>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs leading-normal text-muted-foreground">
        Own: developers only see requests assigned to them. Admins can add every
        role except super admin.
      </p>
    </section>
  );
}
