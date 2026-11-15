import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { Public } from '../auth/decorators.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';
import { PublicLeadsService } from './public-leads.service.js';

/**
 * The website's public forms. The same rules as the website's own
 * (frontend/src/lib/forms/schemas.ts), with the design's messages.
 */

const required = (message: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, `Keep this under ${max} characters`);
const optional = (max = 200) =>
  z.string().trim().max(max, `Keep this under ${max} characters`).optional();
const email = (message: string) =>
  z
    .string()
    .trim()
    .max(191, message)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message);

/**
 * Every form has a hidden "website" field that people never see. Bots
 * fill it in; then we answer "sent" and save nothing.
 */
const common = {
  website: z.string().optional(),
  sourcePage: z.string().max(200).optional(),
};

const demoSchema = z.object({
  ...common,
  topic: z.enum([
    'TRAVEL_BOOKING_PLATFORM',
    'AGENT_ADMIN_DASHBOARDS',
    'CUSTOM_SOFTWARE_WEBSITES',
    'API_INTEGRATIONS',
  ]),
  preferredStart: z.iso.datetime('Pick a time'),
  name: required('Enter your name', 120),
  email: email('Enter a valid work email'),
  company: required('Enter your company name', 160),
  phone: optional(40),
  notes: optional(2000),
});

const quoteSchema = z.object({
  ...common,
  projectType: z.enum([
    'TRAVEL_BOOKING_PLATFORM',
    'AMADEUS_SABRE_INTEGRATION',
    'NEW_WEBSITE',
    'WEBSITE_REDESIGN',
    'CUSTOM_SOFTWARE',
    'UI_UX_DESIGN',
    'API_INTEGRATION',
    'OTHER',
  ]),
  budget: z.enum([
    'UNDER_5K',
    'FROM_5K_TO_15K',
    'FROM_15K_TO_50K',
    'OVER_50K',
    'NOT_SURE',
  ]),
  timeline: z
    .enum(['ASAP', 'WITHIN_1_3_MONTHS', 'WITHIN_3_6_MONTHS', 'NOT_SURE'])
    .optional(),
  name: required('Enter your name', 120),
  email: email('Enter a valid work email'),
  company: optional(160),
  phone: optional(40),
  requirements: required('Tell us a little about your project', 5000),
});

const messageSchema = z.object({
  ...common,
  topic: z.enum([
    'GENERAL_QUESTION',
    'PARTNERSHIP',
    'EXISTING_PROJECT',
    'SOMETHING_ELSE',
  ]),
  name: required('Enter your name', 120),
  email: email('Enter a valid email'),
  message: required('Write a short message', 5000),
});

/** A few sends from one address in ten minutes; plenty for a person. */
const SENDS = { limit: 5, perSeconds: 600 };
const LOOKS = { limit: 60, perSeconds: 60 };

/** The same answer whatever happened, so nothing is given away. */
const SENT = { ok: true } as const;
const isBot = (body: { website?: string }) => !!body.website?.trim();

@Public()
@UseGuards(RateLimitGuard)
@Controller('leads')
export class PublicLeadsController {
  constructor(private readonly leads: PublicLeadsService) {}

  @RateLimit(LOOKS)
  @Get('demo-slots')
  async demoSlots() {
    return { taken: await this.leads.takenSlots() };
  }

  @RateLimit(SENDS)
  @Post('demo')
  @HttpCode(200)
  async demo(@Body({ schema: demoSchema }) body: z.infer<typeof demoSchema>) {
    if (!isBot(body)) await this.leads.createDemo(body);
    return SENT;
  }

  @RateLimit(SENDS)
  @Post('quote')
  @HttpCode(200)
  async quote(
    @Body({ schema: quoteSchema }) body: z.infer<typeof quoteSchema>,
  ) {
    if (!isBot(body)) await this.leads.createQuote(body);
    return SENT;
  }

  @RateLimit(SENDS)
  @Post('message')
  @HttpCode(200)
  async message(
    @Body({ schema: messageSchema }) body: z.infer<typeof messageSchema>,
  ) {
    if (!isBot(body)) await this.leads.createMessage(body);
    return SENT;
  }
}
