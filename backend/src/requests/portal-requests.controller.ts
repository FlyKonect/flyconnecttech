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
import { Area, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import type { UploadedFile } from '../uploads/file-storage.service.js';
import { MAX_FILES } from '../uploads/upload-rules.js';
import { CleanUploadsInterceptor } from '../uploads/uploads.module.js';
import { RequestsService } from './requests.service.js';
import { PORTAL_TABS, type PortalTab } from './status-rules.js';

const createSchema = z.object({
  projectId: z.uuid('Choose a project'),
  type: z.enum(
    [
      'TECHNICAL_ISSUE',
      'BUG_REPORT',
      'FEATURE_REQUEST',
      'INTEGRATION_PROBLEM',
      'DESIGN_MODIFICATION',
      'GENERAL_INQUIRY',
      'MAINTENANCE_REQUEST',
    ],
    'Choose a request type',
  ),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 'Choose a priority'),
  title: z.string().trim().min(1, 'Enter a request title').max(200),
  description: z
    .string()
    .trim()
    .min(1, 'Describe the request')
    .max(10_000, 'Keep the description under 10,000 characters'),
  url: z.string().trim().max(500).optional(),
});

const replySchema = z.object({
  body: z
    .string()
    .max(10_000, 'Keep the reply under 10,000 characters')
    .default(''),
});

/** Confirm it's fixed: the rating is optional (skipping it is fine). */
const ratingSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(500).optional(),
  })
  .optional();

/** Takes up to 5 files in the "files" field and always tidies them up. */
const WithFiles = () =>
  UseInterceptors(
    FilesInterceptor('files', MAX_FILES),
    CleanUploadsInterceptor,
  );

/**
 * The client portal's requests (screens 06 to 13). Customers only, and only
 * their own records (see RequestsService).
 */
@Area('portal')
@Controller('portal')
export class PortalRequestsController {
  constructor(private readonly requests: RequestsService) {}

  @Get('summary')
  summary(@CurrentUser() user: SignedIn) {
    return this.requests.summary(user);
  }

  // GET /portal/projects (also New request's choices): projects module.

  @Get('requests')
  list(
    @CurrentUser() user: SignedIn,
    @Query('tab') tab?: string,
    @Query('q') search?: string,
    @Query('limit') limit?: string,
  ) {
    return this.requests.list(user, {
      tab: tab && tab in PORTAL_TABS ? (tab as PortalTab) : 'all',
      search: search?.slice(0, 100),
      limit: limit ? Math.min(Math.max(Number(limit) || 1, 1), 500) : undefined,
    });
  }

  @Post('requests')
  @WithFiles()
  create(
    @CurrentUser() user: SignedIn,
    @Body({ schema: createSchema }) body: z.infer<typeof createSchema>,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.requests.create(user, body, files);
  }

  @Get('requests/:code')
  detail(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.requests.detail(user, code);
  }

  @Post('requests/:code/replies')
  @WithFiles()
  reply(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: replySchema }) body: z.infer<typeof replySchema>,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.requests.reply(user, code, body.body, files);
  }

  @Post('requests/:code/close')
  @HttpCode(200)
  close(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.requests.act(user, code, 'close');
  }

  /** Confirm it's fixed, with an optional 1-5 star rating and comment. */
  @Post('requests/:code/confirm')
  @HttpCode(200)
  confirm(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Body({ schema: ratingSchema }) body: z.infer<typeof ratingSchema>,
  ) {
    return this.requests.act(user, code, 'confirm', body);
  }

  @Post('requests/:code/reopen')
  @HttpCode(200)
  reopen(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.requests.act(user, code, 'reopen');
  }

  /** Always a download, never shown as a page (the file came from a user). */
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

/** "attachment" with the name, readable by every browser. */
export function attachmentDisposition(fileName: string): string {
  const plain = fileName.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  return `attachment; filename="${plain}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
