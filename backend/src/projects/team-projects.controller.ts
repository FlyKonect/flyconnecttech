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
import type { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { parsePaging } from '../common/paging.js';
import { attachmentDisposition } from '../requests/portal-requests.controller.js';
import type { UploadedFile } from '../uploads/file-storage.service.js';
import { MAX_FILES } from '../uploads/upload-rules.js';
import { CleanUploadsInterceptor } from '../uploads/uploads.module.js';
import {
  addItemsSchema,
  itemSchema,
  moveSchema,
  newProjectSchema,
  projectDetailsSchema,
  PROJECT_STATUSES,
  statusSchema,
  updateTextSchema,
} from './project-rules.js';
import { ProjectsService, type ProjectTab } from './projects.service.js';

const uuid = (value?: string) =>
  value && /^[0-9a-f-]{36}$/i.test(value) ? value : undefined;

/** ?status=planning (a project status), deleted, or anything else: all. */
function tabFrom(value?: string): ProjectTab {
  if (value === 'deleted') return 'deleted';
  const status = PROJECT_STATUSES.find(
    (s) => s.toLowerCase().replace(/_/g, '-') === value,
  );
  return status ?? 'all';
}

/**
 * The Projects menu and each project's page (team panel). Managers look;
 * super admins and admins change; delete and restore is projects.delete.
 */
@Area('team')
@Controller('team/projects')
export class TeamProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  /** ?q=, ?status=planning|in-design|…|deleted, ?customer=, ?page=, ?size=. */
  @Can('customers.view')
  @Get()
  list(
    @CurrentUser() actor: SignedIn,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('customer') customer?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.projects.list(
      actor,
      { q, tab: tabFrom(status), customerId: uuid(customer) },
      parsePaging(page, size),
    );
  }

  /** Add project: the customers and the possible leads. */
  @Can('customers.manage')
  @Get('choices')
  choices() {
    return this.projects.choices();
  }

  @Can('customers.manage')
  @Post()
  create(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: newProjectSchema }) body: z.output<typeof newProjectSchema>,
  ) {
    return this.projects.create(actor, body);
  }

  @Can('customers.view')
  @Get(':code')
  detail(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.projects.detail(actor, code);
  }

  @Can('customers.manage')
  @Post(':code/details')
  @HttpCode(200)
  details(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: projectDetailsSchema })
    body: z.output<typeof projectDetailsSchema>,
  ) {
    return this.projects.updateDetails(actor, code, body);
  }

  @Can('customers.manage')
  @Post(':code/status')
  @HttpCode(200)
  status(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: statusSchema }) body: z.output<typeof statusSchema>,
  ) {
    return this.projects.setStatus(actor, code, body.status);
  }

  // ------------------------------------------------------------ items

  @Can('customers.manage')
  @Post(':code/items')
  @HttpCode(200)
  addItems(
    @Param('code') code: string,
    @Body({ schema: addItemsSchema }) body: z.output<typeof addItemsSchema>,
  ) {
    return this.projects.addItems(code, body.lines);
  }

  @Can('customers.manage')
  @Post(':code/items/:id')
  @HttpCode(200)
  updateItem(
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: itemSchema }) body: z.output<typeof itemSchema>,
  ) {
    return this.projects.updateItem(code, id, body);
  }

  @Can('customers.manage')
  @Post(':code/items/:id/move')
  @HttpCode(200)
  moveItem(
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: moveSchema }) body: z.output<typeof moveSchema>,
  ) {
    return this.projects.moveItem(code, id, body.direction);
  }

  @Can('customers.manage')
  @Post(':code/items/:id/remove')
  @HttpCode(200)
  removeItem(
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projects.removeItem(code, id);
  }

  // ------------------------------------------------------------ updates

  /** An update with up to 5 files (multipart "body" and "files"). */
  @Can('customers.manage')
  @Post(':code/updates')
  @HttpCode(200)
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES),
    CleanUploadsInterceptor,
  )
  postUpdate(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: updateTextSchema }) body: z.output<typeof updateTextSchema>,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.projects.postUpdate(actor, code, body.body, files);
  }

  @Can('customers.manage')
  @Post(':code/updates/:id')
  @HttpCode(200)
  editUpdate(
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: updateTextSchema }) body: z.output<typeof updateTextSchema>,
  ) {
    return this.projects.editUpdate(code, id, body.body);
  }

  @Can('customers.manage')
  @Post(':code/updates/:id/remove')
  @HttpCode(200)
  removeUpdate(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.projects.removeUpdate(actor, code, id);
  }

  /** Always a download, never shown as a page (the file came from a user). */
  @Can('customers.view')
  @Get(':code/files/:id')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Security-Policy', "default-src 'none'; sandbox")
  async file(
    @Param('code') code: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const file = await this.projects.file(code, id);
    return new StreamableFile(file.stream, {
      type: file.contentType,
      length: file.size,
      disposition: attachmentDisposition(file.fileName),
    });
  }

  // ------------------------------------------------------------ delete

  @Can('projects.delete')
  @Post(':code/delete')
  @HttpCode(200)
  remove(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.projects.remove(actor, code);
  }

  @Can('projects.delete')
  @Post(':code/restore')
  @HttpCode(200)
  restore(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.projects.restore(actor, code);
  }
}
