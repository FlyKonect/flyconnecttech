import { Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { ReportExportService } from './report-export.service.js';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportExportService, AuditService],
})
export class ReportsModule {}
