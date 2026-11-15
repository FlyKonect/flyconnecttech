import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { parseTarget } from '../requests/sla.js';
import { SettingsService } from './settings.service.js';

/** The longest response target: 30 business days, or the same in hours. */
const MAX_BUSINESS_DAYS = 30;
const MAX_MINUTES = 30 * 24 * 60;

const target = z
  .string()
  .trim()
  .refine((text) => {
    const parsed = parseTarget(text);
    if (!parsed) return false;
    return 'businessDays' in parsed
      ? parsed.businessDays <= MAX_BUSINESS_DAYS
      : parsed.minutes <= MAX_MINUTES;
  }, 'Write it like 4 hours or 1 business day');

const settingsSchema = z.object({
  responseTargets: z.object({
    URGENT: target,
    HIGH: target,
    MEDIUM: target,
    LOW: target,
  }),
  teamNotifications: z.object({
    urgentAlert: z.boolean(),
    notifyAssigneeOnReply: z.boolean(),
    dailyDigest: z.boolean(),
    autoCloseResolvedAfter7Days: z.boolean(),
  }),
});

/** Settings (screen 33): super admins only. */
@Area('team')
@Can('settings.manage')
@Controller('team/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  read() {
    return this.settings.all();
  }

  @Post()
  @HttpCode(200)
  save(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: settingsSchema }) body: z.infer<typeof settingsSchema>,
  ) {
    return this.settings.save(actor.id, body);
  }
}
