import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { AccountDeletionService } from '../accounts/account-deletion.service.js';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { CustomerExportService } from './customer-export.service.js';
import { CustomersService } from './customers.service.js';
import { parsePaging } from '../common/paging.js';
import { AuditService } from '../audit/audit.service.js';
import { allPages, csvFile, toCsv } from '../common/csv.js';
import { customerProjectSchema } from '../projects/project-rules.js';

export const PROJECT_TYPES = [
  'WEBSITE',
  'WEB_APPLICATION',
  'TRAVEL_BOOKING_PLATFORM',
  'AGENT_PORTAL',
  'API_INTEGRATION',
  'CUSTOM_SOFTWARE',
  'UI_UX_DESIGN',
  'MAINTENANCE_PLAN',
] as const;

export const PROJECT_STATUSES = [
  'PLANNING',
  'IN_DESIGN',
  'IN_DEVELOPMENT',
  'LIVE',
  'COMPLETED',
] as const;

/** The most projects one Add customer can create. More can be added later. */
const MAX_NEW_PROJECTS = 10;

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a project name')
    .max(160, 'Keep the name under 160 characters'),
  type: z.enum(PROJECT_TYPES, 'Choose a project type'),
});

const newCustomerSchema = z.object({
  name: z.string().trim().min(1, "Enter the customer's name").max(120),
  email: z.email('Enter a valid email address').max(191),
  company: z.string().trim().min(1, 'Enter the company name').max(160),
  phone: z.string().trim().max(40).optional(),
  // Each with an optional description and "What's included" (one per line).
  projects: z
    .array(customerProjectSchema)
    .min(1, 'Add at least one project')
    .max(MAX_NEW_PROJECTS, `Add up to ${MAX_NEW_PROJECTS} projects at a time`),
  /** Converting a website lead: its code, for example QUO-2026-040. */
  from: z.string().trim().max(20).optional(),
  // The answer to "This email belonged to an account that was deleted".
  previous: z.enum(['restore', 'fresh']).optional(),
});

const customerDetailsSchema = z.object({
  company: z.string().trim().min(1, 'Enter the company name').max(160),
});

const projectStatusSchema = z.object({
  status: z.enum(PROJECT_STATUSES, 'Choose a status'),
});

/**
 * Customers and projects in the team panel (screens 26 to 28). Managers may
 * look (customers.view); only super admins and admins change anything
 * (customers.manage). Resend invitation and the reset link are on
 * /team/users/:id (team-users.controller.ts).
 */
@Area('team')
@Controller('team/customers')
export class CustomersController {
  constructor(
    private readonly customers: CustomersService,
    private readonly deletion: AccountDeletionService,
    private readonly audit: AuditService,
    private readonly exporter: CustomerExportService,
  ) {}

  @Can('customers.view')
  @Get()
  list(
    @CurrentUser() actor: SignedIn,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.customers.list(actor, q, parsePaging(page, size));
  }

  @Can('customers.manage')
  @Post()
  create(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: newCustomerSchema })
    body: z.infer<typeof newCustomerSchema>,
  ) {
    return this.customers.create(actor, body);
  }

  /** Download CSV: every customer the list shows for this search. */
  @Can('exports.download')
  @Get('export.csv')
  async exportCsv(@CurrentUser() actor: SignedIn, @Query('q') q?: string) {
    const rows = await allPages((paging) =>
      this.customers.list(actor, q?.slice(0, 100), paging),
    );
    await this.audit.record({
      actorId: actor.id,
      action: 'export.downloaded',
      entityType: 'export',
      entityId: 'customers',
      data: { rows: rows.length, q },
    });
    return csvFile(
      'customers',
      toCsv(
        ['Company', 'Contact', 'Email', 'Account', 'Projects', 'Open requests'],
        rows.map((row) => [
          row.company,
          row.name,
          row.email,
          row.status,
          row.projects.join('; '),
          row.openRequests,
        ]),
      ),
    );
  }

  /**
   * The customer's data as one ZIP (UK GDPR): profile, projects, requests,
   * the conversation they can see and their files. Never internal notes.
   */
  @Can('customers.manage')
  @Get(':id/export.zip')
  exportZip(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.exporter.zip(actor, id);
  }

  @Can('customers.view')
  @Get(':id')
  detail(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.customers.detail(actor, id);
  }

  /**
   * Delete customer: its contact's account goes for good, it leaves the
   * lists, its open requests are closed; projects and requests stay.
   */
  @Can('customers.delete')
  @Post(':id/delete')
  @HttpCode(200)
  delete(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.deletion.deleteCustomer(actor, id);
  }

  @Can('customers.manage')
  @Post(':id/projects')
  addProject(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: projectSchema }) body: z.infer<typeof projectSchema>,
  ) {
    return this.customers.addProject(actor, id, body);
  }

  /** Edit a project: its name and type. */
  @Can('customers.manage')
  @Post(':id/projects/:projectId')
  @HttpCode(200)
  updateProject(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body({ schema: projectSchema }) body: z.infer<typeof projectSchema>,
  ) {
    return this.customers.updateProject(actor, id, projectId, body);
  }

  /** Edit the customer: the company name. */
  @Can('customers.manage')
  @Post(':id/details')
  @HttpCode(200)
  updateDetails(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: customerDetailsSchema })
    body: z.infer<typeof customerDetailsSchema>,
  ) {
    return this.customers.updateDetails(actor, id, body);
  }

  @Can('customers.manage')
  @Post(':id/projects/:projectId/status')
  @HttpCode(200)
  setProjectStatus(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Body({ schema: projectStatusSchema })
    body: z.infer<typeof projectStatusSchema>,
  ) {
    return this.customers.setProjectStatus(actor, id, projectId, body.status);
  }
}
