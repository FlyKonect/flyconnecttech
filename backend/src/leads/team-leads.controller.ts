import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { LeadActionsService } from './lead-actions.service.js';
import { CANCEL_REASONS, LOST_REASONS } from './lead-rules.js';
import type { LeadKind } from './lead-store.js';
import { TeamLeadsService } from './team-leads.service.js';
import { parsePaging } from '../common/paging.js';

/** The address part of each list: /team/leads/demos and so on. */
const KINDS: Record<string, LeadKind> = {
  demos: 'demo',
  quotes: 'quote',
  messages: 'message',
};

function kindOf(path: string): LeadKind {
  const kind = KINDS[path];
  if (!kind) throw new NotFoundException();
  return kind;
}

const ownerSchema = z.object({ ownerId: z.uuid().nullable() });
const entrySchema = z.object({
  kind: z.enum(['email', 'note']),
  body: z
    .string()
    .trim()
    .min(1, 'Write a message')
    .max(10_000, 'Keep it under 10,000 characters'),
});
const confirmSchema = z.object({
  start: z.iso.datetime('Choose a date and time'),
  hostId: z.uuid('Choose a host'),
  videoLink: z
    .union([
      z.url('Paste a full link, starting with https://').max(500),
      z.literal(''),
    ])
    .optional(),
});
const cancelSchema = z.object({
  reason: z.enum(CANCEL_REASONS),
  email: z.boolean().default(true),
});
const estimateSchema = z.object({
  amount: z
    .number('Enter the estimate amount')
    .positive('Enter the estimate amount')
    .max(100_000_000, 'Enter the estimate amount'),
  deliveryTime: z.string().trim().max(120).default(''),
  validUntil: z.iso.date('Choose a date'),
  summary: z.string().trim().max(10_000).default(''),
});
const lostSchema = z.object({
  reason: z.enum(LOST_REASONS),
  note: z.string().trim().max(2000).optional(),
});

/**
 * Website leads in the team panel (screens 34 to 42): super admins,
 * admins and managers (leads.manage). Converting needs leads.convert.
 */
@Area('team')
@Can('leads.manage')
@Controller('team/leads')
export class TeamLeadsController {
  constructor(
    private readonly leads: TeamLeadsService,
    private readonly actions: LeadActionsService,
  ) {}

  /** Who can own a lead or host a demo. */
  @Get('owners')
  owners() {
    return this.leads.owners();
  }

  /** What Add customer starts with when converting (screen 42). */
  @Can('leads.convert')
  @Get('convert/:code')
  convert(@Param('code') code: string) {
    return this.leads.convertPrefill(code);
  }

  @Get(':kind')
  list(
    @Param('kind') kind: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('size') size?: string,
  ) {
    return this.leads.list(
      kindOf(kind),
      { status, q },
      parsePaging(page, size),
    );
  }

  @Get(':kind/:code')
  detail(
    @CurrentUser() actor: SignedIn,
    @Param('kind') kind: string,
    @Param('code') code: string,
  ) {
    return this.leads.detail(actor, kindOf(kind), code);
  }

  @Post(':kind/:code/owner')
  @HttpCode(200)
  owner(
    @CurrentUser() actor: SignedIn,
    @Param('kind') kind: string,
    @Param('code') code: string,
    @Body({ schema: ownerSchema }) body: z.infer<typeof ownerSchema>,
  ) {
    return this.leads.setOwner(actor, kindOf(kind), code, body.ownerId);
  }

  /** The composer: Email {first}, or an internal note. */
  @Post(':kind/:code/activity')
  @HttpCode(200)
  entry(
    @CurrentUser() actor: SignedIn,
    @Param('kind') kind: string,
    @Param('code') code: string,
    @Body({ schema: entrySchema }) body: z.infer<typeof entrySchema>,
  ) {
    return this.leads.addEntry(actor, kindOf(kind), code, body);
  }

  // ------------------------------------------------------------- demos

  @Post('demos/:code/confirm')
  @HttpCode(200)
  confirm(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: confirmSchema }) body: z.infer<typeof confirmSchema>,
  ) {
    return this.actions.confirmDemo(actor, code, body);
  }

  @Post('demos/:code/complete')
  @HttpCode(200)
  complete(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.completeDemo(actor, code);
  }

  @Post('demos/:code/cancel')
  @HttpCode(200)
  cancel(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: cancelSchema }) body: z.infer<typeof cancelSchema>,
  ) {
    return this.actions.cancelDemo(actor, code, body);
  }

  @Post('demos/:code/reopen')
  @HttpCode(200)
  reopenDemo(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.reopenDemo(actor, code);
  }

  // ------------------------------------------------------------ quotes

  @Post('quotes/:code/review')
  @HttpCode(200)
  review(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.startReview(actor, code);
  }

  @Post('quotes/:code/estimate')
  @HttpCode(200)
  estimate(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: estimateSchema }) body: z.infer<typeof estimateSchema>,
  ) {
    return this.actions.sendEstimate(actor, code, body);
  }

  @Post('quotes/:code/won')
  @HttpCode(200)
  won(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.markWon(actor, code);
  }

  @Post('quotes/:code/lost')
  @HttpCode(200)
  lost(
    @CurrentUser() actor: SignedIn,
    @Param('code') code: string,
    @Body({ schema: lostSchema }) body: z.infer<typeof lostSchema>,
  ) {
    return this.actions.markLost(actor, code, body);
  }

  @Post('quotes/:code/reopen')
  @HttpCode(200)
  reopenQuote(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.reopenQuote(actor, code);
  }

  // ---------------------------------------------------------- messages

  @Post('messages/:code/close')
  @HttpCode(200)
  close(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.closeMessage(actor, code);
  }

  @Post('messages/:code/reopen')
  @HttpCode(200)
  reopenMessage(@CurrentUser() actor: SignedIn, @Param('code') code: string) {
    return this.actions.reopenMessage(actor, code);
  }
}
