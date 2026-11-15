import { Controller, Get } from '@nestjs/common';
import { Area, Can } from '../auth/decorators.js';
import { ReportsService } from './reports.service.js';

/** Reports & Analytics (screen 31): super admins, admins and managers. */
@Area('team')
@Controller('team/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Can('reports.view')
  @Get()
  report() {
    return this.reports.report();
  }
}
