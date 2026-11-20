import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import type { Priority } from '../generated/prisma/client.js';
import type { UploadedFile } from '../uploads/file-storage.service.js';
import { MAX_FILES } from '../uploads/upload-rules.js';
import { CleanUploadsInterceptor } from '../uploads/uploads.module.js';
import { attachmentDisposition } from './portal-requests.controller.js';
import { TeamDashboardService } from './team-dashboard.service.js';
import { STATUS_SLUGS, TeamRequestsService } from './team-requests.service.js';
import { parsePaging } from '../common/paging.js';

const STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const text = (empty: string) =>
  z
    .string()
    .trim()
    .min(1, empty)
    .max(10_000, 'Keep it under 10,000 characters');

/** The text may be empty when files are attached (checked in the service). */
const messageSchema = z.object({
  kind: z.enum(['reply', 'note']),
  body: z
    .string()
    .trim()
    .max(10_000, 'Keep it under 10,000 characters')
    .default(''),
});
const statusSchema = z.object({ status: z.enum(STATUSES) });
const prioritySchema = z.object({ priority: z.enum(PRIORITIES) });
const assignSchema = z.object({
  developerId: z.uuid('Choose a developer'),
  transfer: z.boolean().default(false),
});
const requestInfoSchema = z.object({ body: text('Write your question') });
const resolveSchema = z.object({
  summary: z.string().trim().max(10_000).default(''),
  email: z.boolean().default(true),
});

/**
 * The team panel's support requests (screens 17 to 25). Team members only;
 * each change also checks the permission table (@Can, policies.ts).
 */
@Area('team')
@Controller('team')
export class TeamRequestsController {
  constructor(
    private readonly requests: TeamRequestsService,
    private readonly dashboards: TeamDashboardService,
  ) {}

  @Get('summary')
  summary(@CurrentUser() user: SignedIn) {
    return this.dashboards.summary(user);
  }

  @Get('dashboard')
  dashboard(@CurrentUser() user: SignedIn) {
    return this.dashboards.dashboard(user);
  }

  /** The assign dialog and Team workload. */
  @Can('requests.assign')
  @Get('developers')
  developers() {
    return this.dashboards.developers();
  }

  @Can('requests.view')
  @Get('requests')
  list(
    @CurrentUser() user: SignedIn,
    @Query('status') status?: string,
    @Query('q') search?: string,
    @Query('project') projectId?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assignee?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    const uuid = (value?: string) =>
      value && z.uuid().safeParse(value).success ? value : undefined;
    return this.requests.list(
      user,
      {
        status: status ? STATUS_SLUGS[status] : undefined,
        search: search?.slice(0, 100),
        projectId: uuid(projectId),
        priority: PRIORITIES.find((p) => p === priority) as
          Priority | undefined,
        assignee: assignee === 'unassigned' ? assignee : uuid(assignee),
      },
      parsePaging(page, size),
    );
  }

  @Can('requests.view')
  @Get('requests/:code')
  detail(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.requests.detail(user, code);
  }

  /** A reply or an internal note, with up to 5 files (multipart "files"). */
  @Can('requests.reply')
  @Post('requests/:code/messages')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES),
    CleanUploadsInterceptor,
  )
  message(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: messageSchema }) body: z.infer<typeof messageSchema>,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.requests.message(user, code, body, files);
  }

  @Can('requests.changeStatus')
  @Post('requests/:code/status')
  @HttpCode(200)
  status(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: statusSchema }) body: z.infer<typeof statusSchema>,
  ) {
    return this.requests.setStatus(user, code, body.status);
  }

  @Can('requests.changePriority')
  @Post('requests/:code/priority')
  @HttpCode(200)
  priority(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: prioritySchema }) body: z.infer<typeof prioritySchema>,
  ) {
    return this.requests.setPriority(user, code, body.priority);
  }

  @Can('requests.assign')
  @Post('requests/:code/assign')
  @HttpCode(200)
  assign(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: assignSchema }) body: z.infer<typeof assignSchema>,
  ) {
    return this.requests.assign(user, code, body);
  }

  @Can('requests.changeStatus')
  @Post('requests/:code/request-info')
  @HttpCode(200)
  requestInfo(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: requestInfoSchema })
    body: z.infer<typeof requestInfoSchema>,
  ) {
    return this.requests.requestInfo(user, code, body.body);
  }

  @Can('requests.changeStatus')
  @Post('requests/:code/resolve')
  @HttpCode(200)
  resolve(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: resolveSchema }) body: z.infer<typeof resolveSchema>,
  ) {
    return this.requests.resolve(user, code, body);
  }

  @Can('requests.close')
  @Post('requests/:code/close')
  @HttpCode(200)
  close(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.requests.close(user, code);
  }

  /** Always a download, never shown as a page (the file came from a user). */
  @Can('requests.view')
  @Get('requests/:code/files/:id')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Security-Policy', "default-src 'none'; sandbox")
  async file(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const file = await this.requests.file(user, code, id);
    return new StreamableFile(file.stream, {
      type: file.contentType,
      length: file.size,
      disposition: attachmentDisposition(file.fileName),
    });
  }
}
