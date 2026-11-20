/**
 * How a deleted account or customer looks in the history: its name with
 * "(deleted)" after it, and a private address in place of the email (so the
 * real one can be used again). See account-deletion.service.ts.
 */

/** The words added to a deleted person's or company's name. */
export const DELETED_MARK = '(deleted)';

/** "Emma Clarke" -> "Emma Clarke (deleted)", within the column's length. */
export function markDeleted(text: string, max: number): string {
  const suffix = ` ${DELETED_MARK}`;
  return `${withoutDeletedMark(text)
    .slice(0, max - suffix.length)
    .trimEnd()}${suffix}`;
}

/** "Emma Clarke (deleted)" -> "Emma Clarke". */
export function withoutDeletedMark(text: string): string {
  return text.replace(/\s*\(deleted\)$/, '');
}

/** A private address for a deleted account: frees the real one for reuse. */
export function deletedAddress(userId: string): string {
  return `deleted.${userId}@accounts.invalid`;
}
