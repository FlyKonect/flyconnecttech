import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import {
  ReportExportService,
  type ReportFormat,
} from './report-export.service.js';
import { ReportsService } from './reports.service.js';

const FORMATS: ReportFormat[] = ['pdf', 'xlsx', 'csv'];

const id = (value?: string) =>
  value && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined;

/** Reports & Analytics (screen 31): super admins, admins and managers. */
@Area('team')
@Controller('team/reports')
export class ReportsController {
  constructor(
    private readonly reports: ReportsService,
    private readonly exports: ReportExportService,
  ) {}

  /**
   * ?from=YYYY-MM-DD&to=YYYY-MM-DD (UK dates, both included), ?customer=
   * and ?developer= (ids). All optional: this month, everyone.
   */
  @Can('reports.view')
  @Get()
  report(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('customer') customer?: string,
    @Query('developer') developer?: string,
  ) {
    return this.reports.report({
      from: from?.slice(0, 10),
      to: to?.slice(0, 10),
      customerId: id(customer),
      developerId: id(developer),
    });
  }

  /** The same report as a file: export.pdf, export.xlsx or export.csv. */
  @Can('reports.view')
  @Get('export.:format')
  download(
    @CurrentUser() actor: SignedIn,
    @Param('format') format: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('customer') customer?: string,
    @Query('developer') developer?: string,
  ) {
    const chosen = FORMATS.find((f) => f === format);
    if (!chosen) {
      throw new BadRequestException({
        code: 'BAD_FORMAT',
        message: 'Choose PDF, Excel (xlsx) or CSV.',
      });
    }
    return this.exports.file(actor, chosen, {
      from: from?.slice(0, 10),
      to: to?.slice(0, 10),
      customerId: id(customer),
      developerId: id(developer),
    });
  }
}
