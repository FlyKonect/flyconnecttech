import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
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
import type { TopicKind, TopicStatus } from '../generated/prisma/client.js';
import { attachmentDisposition } from '../requests/portal-requests.controller.js';
import type { UploadedFile } from '../uploads/file-storage.service.js';
import { MAX_FILES } from '../uploads/upload-rules.js';
import { CleanUploadsInterceptor } from '../uploads/uploads.module.js';
import {
  answerSchema,
  closeSchema,
  decisionSchema,
  editPostSchema,
  newTopicSchema,
  postSchema,
  type DecisionInput,
  type NewTopicInput,
  type PostInput,
} from './topic-rules.js';
import { TopicsService } from './topics.service.js';

const statusFrom = (value?: string): TopicStatus =>
  value === 'closed' ? 'CLOSED' : 'OPEN';

const WithFiles = () =>
  UseInterceptors(
    FilesInterceptor('files', MAX_FILES),
    CleanUploadsInterceptor,
  );

/**
 * A discussion board's routes: the list, a topic, posting, editing,
 * the answer, close and reopen, files. The team's two boards (customer
 * topics and team topics) and the portal's share them; each fixes its kind.
 */
abstract class TopicRoutes {
  protected abstract readonly kind: TopicKind;

  constructor(protected readonly topics: TopicsService) {}

  /** ?status=open|closed, ?page=, ?size=. */
  @Get()
  list(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.topics.list(
      actor,
      code,
      this.kind,
      statusFrom(status),
      parsePaging(page, size),
    );
  }

  /** A new topic (multipart: title, body, files, moduleId, ask). */
  @Post()
  @WithFiles()
  create(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: newTopicSchema }) body: NewTopicInput,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.topics.create(actor, code, this.kind, body, files);
  }

  @Get(':number')
  detail(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.topics.detail(actor, code, this.kind, number);
  }

  /** A reply (multipart: body, files, proposal, ask). */
  @Post(':number/posts')
  @HttpCode(200)
  @WithFiles()
  post(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Body({ schema: postSchema }) body: PostInput,
    @UploadedFiles() files: UploadedFile[] = [],
  ) {
    return this.topics.post(actor, code, this.kind, number, body, files);
  }

  @Post(':number/posts/:id')
  @HttpCode(200)
  editPost(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: editPostSchema }) body: z.output<typeof editPostSchema>,
  ) {
    return this.topics.editPost(actor, code, this.kind, number, id, body.body);
  }

  @Post(':number/answer')
  @HttpCode(200)
  answer(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Body({ schema: answerSchema }) body: z.output<typeof answerSchema>,
  ) {
    return this.topics.setAnswer(actor, code, this.kind, number, body.postId);
  }

  @Post(':number/close')
  @HttpCode(200)
  close(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Body({ schema: closeSchema }) body: z.output<typeof closeSchema>,
  ) {
    return this.topics.close(actor, code, this.kind, number, body.note);
  }

  @Post(':number/reopen')
  @HttpCode(200)
  reopen(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.topics.reopen(actor, code, this.kind, number);
  }

  /** Always a download, never shown as a page. */
  @Get(':number/files/:id')
  @Header('X-Content-Type-Options', 'nosniff')
  @Header('Cache-Control', 'private, no-store')
  @Header('Content-Security-Policy', "default-src 'none'; sandbox")
  async file(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const file = await this.topics.file(actor, code, this.kind, number, id);
    return new StreamableFile(file.stream, {
      type: file.contentType,
      length: file.size,
      disposition: attachmentDisposition(file.fileName),
    });
  }
}

/** The team's routes on top: removing posts and deleting topics (admins). */
abstract class TeamTopicRoutes extends TopicRoutes {
  @Post(':number/posts/:id/remove')
  @HttpCode(200)
  removePost(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.topics.removePost(actor, code, this.kind, number, id);
  }

  @Post(':number/delete')
  @HttpCode(200)
  remove(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
  ) {
    return this.topics.remove(actor, code, this.kind, number);
  }
}

/** Customer topics, in the team panel. */
@Area('team')
@Can('discussions.join')
@Controller('team/projects/:code/discussions')
export class TeamDiscussionsController extends TeamTopicRoutes {
  protected readonly kind = 'CUSTOMER' as const;
  constructor(topics: TopicsService) {
    super(topics);
  }
}

/** Team topics (internal): never the customer. */
@Area('team')
@Can('discussions.join')
@Controller('team/projects/:code/team-discussions')
export class TeamInternalDiscussionsController extends TeamTopicRoutes {
  protected readonly kind = 'INTERNAL' as const;
  constructor(topics: TopicsService) {
    super(topics);
  }
}

/** Customer topics, in the client portal (their own projects only). */
@Area('portal')
@Controller('portal/projects/:code/discussions')
export class PortalDiscussionsController extends TopicRoutes {
  protected readonly kind = 'CUSTOMER' as const;
  constructor(topics: TopicsService) {
    super(topics);
  }

  /** Approve a proposal, or ask for changes (with a note). */
  @Post(':number/posts/:id/decision')
  @HttpCode(200)
  decide(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Param('number', ParseIntPipe) number: number,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: decisionSchema }) body: DecisionInput,
  ) {
    return this.topics.decide(actor, code, number, id, body);
  }
}
