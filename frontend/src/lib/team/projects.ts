import { routes } from "@/lib/routes";

/**
 * The Projects list's tabs and their ?status= values (the backend's
 * team-projects.controller.ts reads the same values). A plain module, so
 * the server page and the client list can both use it.
 */
export const PROJECT_TABS = [
  { key: "all", status: "", label: "All" },
  { key: "PLANNING", status: "planning", label: "Planning" },
  { key: "IN_DESIGN", status: "in-design", label: "In design" },
  { key: "IN_DEVELOPMENT", status: "in-development", label: "In development" },
  { key: "LIVE", status: "live", label: "Live" },
  { key: "COMPLETED", status: "completed", label: "Completed" },
  { key: "deleted", status: "deleted", label: "Deleted" },
] as const;

/** The list's address with its search and tab. */
export function projectsHref(filters: { q: string; status: string }) {
  const query = new URLSearchParams({
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  }).toString();
  return query ? `${routes.teamProjects}?${query}` : routes.teamProjects;
}
