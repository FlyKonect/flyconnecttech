/**
 * Page numbers for the lists (requests, customers, leads). The website asks
 * with ?page=2&size=25; anything odd falls back to page 1 and 25 rows.
 */
export const PAGE_SIZES = [10, 25, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 25;

export type Paging = { page: number; pageSize: number };

export function parsePaging(page?: string, size?: string): Paging {
  const wanted = Number(size);
  const pageSize = (PAGE_SIZES as readonly number[]).includes(wanted)
    ? wanted
    : DEFAULT_PAGE_SIZE;
  const number = Math.floor(Number(page));
  return {
    page: Number.isFinite(number) && number >= 1 ? Math.min(number, 10_000) : 1,
    pageSize,
  };
}

/** For Prisma's findMany, after the page has been fitted to the total. */
export function pageWindow(paging: Paging, total: number) {
  const pages = Math.max(1, Math.ceil(total / paging.pageSize));
  const page = Math.min(paging.page, pages);
  return {
    page,
    pageSize: paging.pageSize,
    skip: (page - 1) * paging.pageSize,
    take: paging.pageSize,
  };
}
