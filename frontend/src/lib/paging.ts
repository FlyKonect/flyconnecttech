/**
 * Page numbers in a list's address (?page=2&size=50), kept in step with the
 * backend's `common/paging.ts`.
 */
export const PAGE_SIZES = [10, 25, 50, 100] as const;

/** The page and size from a page's search params, as text for the backend. */
export function pagingQuery(
  params: Record<string, string | string[] | undefined>,
) {
  const page = typeof params.page === "string" ? params.page : "";
  const size = typeof params.size === "string" ? params.size : "";
  return {
    ...(/^\d{1,5}$/.test(page) && page !== "1" ? { page } : {}),
    ...((PAGE_SIZES as readonly number[]).includes(Number(size)) &&
    size !== "25"
      ? { size }
      : {}),
  };
}

/** `href` with this page and size added (page 1 and 25 rows are left out). */
export function withPage(href: string, page: number, pageSize: number): string {
  const [path, search = ""] = href.split("?");
  const query = new URLSearchParams(search);
  query.delete("page");
  query.delete("size");
  if (page > 1) query.set("page", String(page));
  if (pageSize !== 25) query.set("size", String(pageSize));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
