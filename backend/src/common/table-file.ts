import { BadRequestException, StreamableFile } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { csvFile, toCsv, type Cell } from './csv.js';

/**
 * A list's download (the Export menu on the team's lists), as CSV or
 * Excel, from the same header and rows. Excel cells are written as plain
 * values, so a cell like "=HYPERLINK(...)" stays text, never a formula.
 */

export type TableFormat = 'csv' | 'xlsx';
export type Table = { header: string[]; rows: Cell[][] };

const NAVY = 'FF021A54';

/** The format in "export.csv" / "export.xlsx"; anything else: 400. */
export function tableFormat(value: string): TableFormat {
  if (value === 'csv' || value === 'xlsx') return value;
  throw new BadRequestException({
    code: 'BAD_FORMAT',
    message: 'Choose Excel (xlsx) or CSV.',
  });
}

/** "support-requests-2026-11-20.xlsx" with a sheet of the rows. */
export async function tableFile(
  name: string,
  format: TableFormat,
  table: Table,
  sheetName: string,
): Promise<StreamableFile> {
  if (format === 'csv') return csvFile(name, toCsv(table.header, table.rows));

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FlyConnect Tech';
  const sheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.addRow(table.header);
  for (const row of table.rows) {
    sheet.addRow(
      row.map((cell) => (cell instanceof Date ? cell : (cell ?? ''))),
    );
  }
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  header.alignment = { vertical: 'middle' };
  header.height = 22;
  sheet.columns.forEach((column, index) => {
    const longest = Math.max(
      table.header[index]?.length ?? 0,
      ...table.rows.slice(0, 500).map((row) => String(row[index] ?? '').length),
    );
    column.width = Math.min(60, Math.max(10, longest + 2));
  });
  if (table.rows.length) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: table.header.length },
    };
  }
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const day = new Date().toISOString().slice(0, 10);
  return new StreamableFile(buffer, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    disposition: `attachment; filename="${name}-${day}.xlsx"`,
  });
}
