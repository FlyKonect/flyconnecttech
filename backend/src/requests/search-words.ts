/**
 * The team's request search, for MariaDB's full-text index on title and
 * description (`@@fulltext` in schema.prisma): every word must be there,
 * each may be the start of a longer word ("hotel pric" finds "hotel
 * prices"). MariaDB skips words under 3 letters, so those are left out;
 * with none left, the search falls back to the title as before.
 */
export function fullTextQuery(search: string): string | null {
  const words = search
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3)
    .slice(0, 8);
  if (!words.length) return null;
  return words.map((word) => `+${word}*`).join(' ');
}
