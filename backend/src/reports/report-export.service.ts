import { Injectable, StreamableFile } from '@nestjs/common';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { AuditService } from '../audit/audit.service.js';
import type { SignedIn } from '../auth/signed-in.js';
import { csvCell, ukStamp, type Cell } from '../common/csv.js';
import { REPORT_LOGO_PNG } from './report-logo.js';
import {
  ReportsService,
  type ReportCard,
  type ReportQuery,
} from './reports.service.js';

export type ReportFormat = 'pdf' | 'xlsx' | 'csv';

type Report = Awaited<ReturnType<ReportsService['report']>>;

/** One table of the report, the same in every format. */
type Table = { title: string; header: string[]; rows: Cell[][] };

const NAVY = '#021A54';
const MUTED = '#5A6882';
const LINE = '#E1E8F2';

const TYPES: Record<ReportFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv; charset=utf-8',
};

/** The line under a number: its change, or the note when there is no data. */
const hint = (card: ReportCard) => card.change?.text ?? card.note ?? '';

/**
 * The Reports page as a file (PDF, Excel or CSV), with the same dates,
 * customer and developer as on screen. Everyone who sees Reports may
 * download it (reports.view); each download goes in the Activity log.
 */
@Injectable()
export class ReportExportService {
  constructor(
    private readonly reports: ReportsService,
    private readonly audit: AuditService,
  ) {}

  async file(
    actor: SignedIn,
    format: ReportFormat,
    query: ReportQuery,
  ): Promise<StreamableFile> {
    const report = await this.reports.report(query);
    const about = this.about(report, query);
    const tables = this.tables(report);
    const made = ukStamp(new Date());

    const buffer =
      format === 'pdf'
        ? await this.pdf(report, about, tables, made)
        : format === 'xlsx'
          ? await this.xlsx(report, about, tables, made)
          : this.csv(report, about, tables, made);

    await this.audit.record({
      actorId: actor.id,
      action: 'export.downloaded',
      entityType: 'export',
      entityId: `report-${format}`,
      data: { period: report.period.words, about, format },
    });

    const slug = report.period.words
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return new StreamableFile(buffer, {
      type: TYPES[format],
      disposition: `attachment; filename="flyconnect-tech-report-${slug}.${format}"`,
    });
  }

  /** "Bluewave Holidays · Priya Nair", or "All customers and developers". */
  private about(report: Report, query: ReportQuery): string {
    const customer = report.filters.customers.find(
      (c) => c.id === query.customerId,
    );
    const developer = report.filters.developers.find(
      (d) => d.id === query.developerId,
    );
    return (
      [customer?.company, developer?.name].filter(Boolean).join(' · ') ||
      'All customers and developers'
    );
  }

  private tables(report: Report): Table[] {
    return [
      {
        title: 'Summary',
        header: ['Measure', 'Value', 'Compared / note'],
        rows: [...report.cards, ...report.sla].map((card) => [
          card.label,
          card.value,
          hint(card),
        ]),
      },
      {
        title: 'Requests this week',
        header: ['Day', 'Requests'],
        rows: report.week.map((day) => [day.day, day.count]),
      },
      {
        title: report.projectsAllTime
          ? 'Requests by project (all time)'
          : 'Requests by project (in this period)',
        header: ['Project', 'Requests'],
        rows: report.projects.map((project) => [project.name, project.count]),
      },
      {
        title: 'Developer performance',
        header: [
          'Developer',
          'Job title',
          'Assigned',
          'Resolved',
          'Avg. first response',
        ],
        rows: report.developers.map((d) => [
          d.name,
          d.jobTitle ?? '',
          d.assigned,
          d.resolved,
          d.firstResponse ?? '—',
        ]),
      },
    ];
  }

  // ---------------------------------------------------------------- CSV

  private csv(
    report: Report,
    about: string,
    tables: Table[],
    made: string,
  ): Buffer {
    const line = (cells: Cell[]) => cells.map(csvCell).join(',');
    const lines = [
      line(['FlyConnect Tech report']),
      line(['Period', report.period.words]),
      line(['For', about]),
      line(['Made', `${made} (UK time)`]),
    ];
    for (const table of tables) {
      lines.push('', line([table.title]), line(table.header));
      lines.push(...table.rows.map(line));
    }
    return Buffer.from(`﻿${lines.join('\r\n')}\r\n`, 'utf8');
  }

  // -------------------------------------------------------------- Excel

  private async xlsx(
    report: Report,
    about: string,
    tables: Table[],
    made: string,
  ): Promise<Buffer> {
    const book = new ExcelJS.Workbook();
    book.creator = 'FlyConnect Tech';
    book.created = new Date();

    for (const [index, table] of tables.entries()) {
      const sheet = book.addWorksheet(
        table.title.replace(/[^A-Za-z0-9 ]/g, '').slice(0, 31),
      );
      let row = 1;
      if (index === 0) {
        // The first sheet starts with what the report is.
        sheet.getCell('A1').value = 'FlyConnect Tech report';
        sheet.getCell('A1').font = {
          bold: true,
          size: 14,
          color: { argb: 'FF021A54' },
        };
        sheet.getCell('A2').value = `Period: ${report.period.words}`;
        sheet.getCell('A3').value = `For: ${about}`;
        sheet.getCell('A4').value = `Made: ${made} (UK time)`;
        row = 6;
      }
      const head = sheet.getRow(row);
      head.values = table.header;
      head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      head.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF021A54' },
        };
      });
      for (const values of table.rows) {
        row += 1;
        sheet.getRow(row).values = values.map((value) =>
          value instanceof Date ? ukStamp(value) : (value ?? ''),
        );
      }
      sheet.views = [{ state: 'frozen', ySplit: index === 0 ? 6 : 1 }];
      sheet.columns.forEach((column, i) => {
        const widest = Math.max(
          String(table.header[i] ?? '').length,
          ...table.rows.map((r) => String(r[i] ?? '').length),
        );
        column.width = Math.min(60, Math.max(12, widest + 2));
      });
    }
    return Buffer.from(await book.xlsx.writeBuffer());
  }

  // ---------------------------------------------------------------- PDF

  private pdf(
    report: Report,
    about: string,
    tables: Table[],
    made: string,
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 50, left: 40, right: 40 },
      bufferPages: true,
      info: {
        Title: `FlyConnect Tech report: ${plain(report.period.words)}`,
        Author: 'FlyConnect Tech',
      },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) =>
      doc.on('end', () => resolve(Buffer.concat(chunks))),
    );

    const width = doc.page.width - 80;

    // The navy band with the logo.
    doc.rect(0, 0, doc.page.width, 70).fill(NAVY);
    doc.image(REPORT_LOGO_PNG, 40, 24, { height: 22 });
    doc
      .fillColor('#C5D0EA')
      .font('Helvetica')
      .fontSize(9)
      .text('Reports & Analytics', 40, 30, { width, align: 'right' });

    doc.y = 92;
    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(plain(`Report for ${report.period.words}`), 40);
    doc
      .moveDown(0.2)
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(10)
      .text(plain(`${about} · made ${made} (UK time)`));

    // The number tiles, four to a row.
    const cards = [...report.cards, ...report.sla];
    const gap = 10;
    const tileWidth = (width - gap * 3) / 4;
    const tileHeight = 70;
    let y = doc.y + 16;
    cards.forEach((card, index) => {
      const column = index % 4;
      if (index > 0 && column === 0) y += tileHeight + gap;
      const x = 40 + column * (tileWidth + gap);
      doc.roundedRect(x, y, tileWidth, tileHeight, 8).lineWidth(1).stroke(LINE);
      doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(8)
        .text(plain(card.label).toUpperCase(), x + 10, y + 9, {
          width: tileWidth - 20,
        });
      doc
        .fillColor(NAVY)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text(plain(card.value), x + 10, y + 22, { width: tileWidth - 20 });
      doc
        .fillColor(
          card.change?.tone === 'better'
            ? '#15803D'
            : card.change?.tone === 'worse'
              ? '#B91C1C'
              : MUTED,
        )
        .font('Helvetica')
        .fontSize(7.5)
        .text(plain(hint(card)), x + 10, y + 42, {
          width: tileWidth - 20,
          height: 20,
          ellipsis: true,
        });
    });
    doc.y = y + tileHeight + 20;

    // The tables (the summary is already shown as tiles).
    for (const table of tables.slice(1)) {
      this.pdfTable(doc, table, width);
    }

    // Page numbers in the footer of every page.
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      const bottom = doc.page.height - 32;
      // Writing below the bottom margin would start a new page.
      const margin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(8)
        .text(
          `FlyConnect Tech · info@flyconnecttech.co.uk · Page ${i + 1} of ${range.count}`,
          40,
          bottom,
          { width, align: 'center', lineBreak: false },
        );
      doc.page.margins.bottom = margin;
    }
    doc.end();
    return done;
  }

  private pdfTable(doc: PDFKit.PDFDocument, table: Table, width: number) {
    const rowHeight = 20;
    const room = () => doc.page.height - 60 - doc.y;
    if (room() < rowHeight * 3 + 24) doc.addPage();

    doc
      .fillColor(NAVY)
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(plain(table.title), 40);
    doc.moveDown(0.4);

    // Each later column is as wide as its widest text (60 to 140 points);
    // the first column gets the room left. Numbers line up on the right.
    const textOf = (cell: Cell) =>
      plain(cell instanceof Date ? ukStamp(cell) : String(cell ?? ''));
    const others = table.header.map((title, i) => {
      if (i === 0) return 0;
      doc.font('Helvetica-Bold').fontSize(9);
      let widest = doc.widthOfString(plain(title));
      doc.font('Helvetica');
      for (const row of table.rows) {
        widest = Math.max(widest, doc.widthOfString(textOf(row[i])));
      }
      return Math.min(140, Math.max(60, widest + 16));
    });
    const used = others.reduce((sum, w) => sum + w, 0);
    const widths = [width - used, ...others.slice(1)];
    const numeric = table.header.map(
      (_, i) =>
        i > 0 &&
        table.rows.length > 0 &&
        table.rows.every((row) => typeof row[i] === 'number'),
    );

    const drawRow = (cells: Cell[], head: boolean) => {
      if (room() < rowHeight) {
        doc.addPage();
        drawRow(table.header, true);
      }
      const top = doc.y;
      if (head) doc.rect(40, top, width, rowHeight).fill(NAVY);
      let x = 40;
      cells.forEach((cell, i) => {
        doc
          .fillColor(head ? '#FFFFFF' : NAVY)
          .font(head ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(9)
          .text(
            plain(cell instanceof Date ? ukStamp(cell) : String(cell ?? '')),
            x + 6,
            top + 6,
            {
              width: widths[i] - 12,
              height: rowHeight - 6,
              ellipsis: true,
              align: numeric[i] ? 'right' : 'left',
              lineBreak: false,
            },
          );
        x += widths[i];
      });
      if (!head) {
        doc
          .moveTo(40, top + rowHeight)
          .lineTo(40 + width, top + rowHeight)
          .lineWidth(0.5)
          .stroke(LINE);
      }
      doc.y = top + rowHeight;
    };

    drawRow(table.header, true);
    if (!table.rows.length) {
      doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(9)
        .text('Nothing in this period.', 46, doc.y + 6);
      doc.moveDown(0.5);
    }
    for (const row of table.rows) drawRow(row, false);
    doc.y += 18;
    doc.x = 40;
  }
}

/**
 * The PDF's built-in fonts know only Western European letters: other
 * characters become their nearest plain form (or "?"), and a few signs
 * the report uses get a plain stand-in.
 */
function plain(text: string): string {
  return text
    .replace(/−/g, '-')
    .replace(/→/g, '->')
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code <= 0xff || '–—‘’“”•…€™'.includes(char)) return char;
      const base = char.normalize('NFKD').replace(/[̀-ͯ]/g, '');
      return base && base.charCodeAt(0) <= 0xff ? base : '?';
    })
    .join('');
}
