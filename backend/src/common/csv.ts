import { StreamableFile } from '@nestjs/common';

/**
 * CSV downloads (the "Download CSV" buttons on the team's lists).
 *
 * - Every cell is quoted, with quotes doubled, so commas and line breaks
 *   inside a field stay in that field.
 * - A cell that starts with = + - @ (or a tab or a carriage return) gets
 *   a leading apostrophe, so a spreadsheet never runs it as a formula
 *   (CSV injection): a customer could type "=HYPERLINK(...)" in a title.
 * - A byte order mark first, so Excel reads £ and accents correctly.
 */

export type Cell = string | number | boolean | Date | null | undefined;

/** The most rows one download gives. */
export const MAX_EXPORT_ROWS = 10_000;

export function csvCell(value: Cell): string {
  let text =
    value === null || value === undefined
      ? ''
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(header: string[], rows: Cell[][]): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(','));
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** The file to send: "requests-2026-11-20.csv". */
export function csvFile(name: string, csv: string): StreamableFile {
  const day = new Date().toISOString().slice(0, 10);
  return new StreamableFile(Buffer.from(csv, 'utf8'), {
    type: 'text/csv; charset=utf-8',
    disposition: `attachment; filename="${name}-${day}.csv"`,
  });
}

/**
 * Every row of a paged list, by reading its pages one after another, so a
 * download uses exactly the list's own filters and permissions.
 */
export async function allPages<T>(
  page: (paging: { page: number; pageSize: number }) => Promise<{
    rows: T[];
  }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let number = 1; rows.length < MAX_EXPORT_ROWS; number += 1) {
    const { rows: found } = await page({ page: number, pageSize: 100 });
    rows.push(...found);
    if (found.length < 100) break;
  }
  return rows.slice(0, MAX_EXPORT_ROWS);
}

/** "2026-11-20 14:05" in UK time, for dates in a download. */
export function ukStamp(date: Date | null | undefined): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .format(date)
    .replace(',', '');
}
