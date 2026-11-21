import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { parseTarget } from '../requests/sla.js';
import { jobHealth } from '../jobs/job-runs.js';
import { PrismaService } from '../prisma/prisma.service.js';
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

const targets = z.object({
  URGENT: target,
  HIGH: target,
  MEDIUM: target,
  LOW: target,
});

/** A bank holiday: a real date, written YYYY-MM-DD. */
const day = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Write dates like 2026-12-25')
  .refine(
    (text) => new Date(`${text}T00:00:00Z`).toISOString().startsWith(text),
    'That date does not exist',
  );

const settingsSchema = z.object({
  responseTargets: targets,
  /** Optional so an older screen that sends only the first two still saves. */
  resolutionTargets: targets.optional(),
  slaCalendar: z
    .object({ bankHolidays: z.array(day).max(200) })
    .transform(({ bankHolidays }) => ({
      bankHolidays: [...new Set(bankHolidays)].sort(),
    }))
    .optional(),
  requestRules: z
    .object({
      reopenWithinDays: z
        .number()
        .int()
        .min(1, 'At least 1 day')
        .max(365, 'At most 365 days'),
    })
    .optional(),
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
  constructor(
    private readonly settings: SettingsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  read() {
    return this.settings.all();
  }

  /** Cron health: when each scheduled job last ran, and which are late. */
  @Get('jobs')
  async jobs() {
    return { jobs: await jobHealth(this.prisma) };
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
