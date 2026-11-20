import { pageWindow, parsePaging } from './paging.js';

describe('paging', () => {
  it('reads the page and size, falling back to page 1 and 25 rows', () => {
    expect(parsePaging('3', '50')).toEqual({ page: 3, pageSize: 50 });
    expect(parsePaging(undefined, undefined)).toEqual({
      page: 1,
      pageSize: 25,
    });
    expect(parsePaging('-2', '7')).toEqual({ page: 1, pageSize: 25 });
    expect(parsePaging('abc', '1000')).toEqual({ page: 1, pageSize: 25 });
  });

  it('keeps the page inside the list', () => {
    expect(pageWindow({ page: 2, pageSize: 25 }, 60)).toEqual({
      page: 2,
      pageSize: 25,
      skip: 25,
      take: 25,
    });
    // Past the end: the last page.
    expect(pageWindow({ page: 9, pageSize: 25 }, 60).page).toBe(3);
    // An empty list is still page 1.
    expect(pageWindow({ page: 4, pageSize: 10 }, 0)).toMatchObject({
      page: 1,
      skip: 0,
    });
  });
});
