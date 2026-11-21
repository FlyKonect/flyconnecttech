import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
} from '@nestjs/common';
import { Area, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { attachmentDisposition } from '../requests/portal-requests.controller.js';
import { reviewSchema, type ReviewInput } from './module-rules.js';
import { ModulesService } from './modules.service.js';
import { PortalProjectsService } from './portal-projects.service.js';

/** My Projects (client portal): the customer's own projects, view only. */
@Area('portal')
@Controller('portal/projects')
export class PortalProjectsController {
  constructor(
    private readonly projects: PortalProjectsService,
    private readonly modules: ModulesService,
  ) {}

  /** Client review: approve the module, or ask for changes (with a note). */
  @Post(':code/modules/:id/review')
  @HttpCode(200)
  review(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: reviewSchema }) body: ReviewInput,
  ) {
    return this.modules.review(user, code, id, body);
  }

  /** Also the project choices of New request. */
  @Get()
  list(@CurrentUser() user: SignedIn) {
    return this.projects.list(user);
  }

  @Get(':code')
  detail(@CurrentUser() user: SignedIn, @Param('code') code: string) {
    return this.projects.detail(user, code);
  }

  /** Always a download, never shown as a page. */
  @Get(':code/files/:id')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Security-Policy', "default-src 'none'; sandbox")
  async file(
    @CurrentUser() user: SignedIn,
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const file = await this.projects.file(user, code, id);
    return new StreamableFile(file.stream, {
      type: file.contentType,
      length: file.size,
      disposition: attachmentDisposition(file.fileName),
    });
  }
}
