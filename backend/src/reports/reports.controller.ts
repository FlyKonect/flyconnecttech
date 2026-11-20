import { Controller, Get, Query } from '@nestjs/common';
import { Area, Can } from '../auth/decorators.js';
import { ReportsService } from './reports.service.js';

const id = (value?: string) =>
  value && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined;

/** Reports & Analytics (screen 31): super admins, admins and managers. */
@Area('team')
@Controller('team/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

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
}
