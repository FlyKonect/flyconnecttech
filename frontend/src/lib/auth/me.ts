import type { Role } from "@/lib/labels";

/** The signed-in person, as the backend's GET /me returns them. */
export type Me = {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobTitle: string | null;
  timezone: string;
  area: "portal" | "team";
  twoFactorEnabled: boolean;
  customer: { id: string; company: string } | null;
  /** What this person may do (backend policies). Only for showing menus. */
  actions: string[];
};
