import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { z } from 'zod';
import { Area, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';
import {
  passwordChangeSchema,
  profileSchema,
  ProfileService,
} from './profile.service.js';

/** The customer's Profile Settings (screen 15). */
@Area('portal')
@Controller('portal/profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: SignedIn) {
    return this.profile.get(user);
  }

  @Patch()
  update(
    @CurrentUser() user: SignedIn,
    @Body({ schema: profileSchema }) body: z.infer<typeof profileSchema>,
  ) {
    return this.profile.update(user, body);
  }
}

/**
 * Change password, for anyone signed in. Better Auth's own route for this
 * is switched off (auth.ts), so our password rules always apply.
 */
@UseGuards(RateLimitGuard)
@Controller('me')
export class PasswordController {
  constructor(private readonly profile: ProfileService) {}

  @RateLimit({ limit: 5, perSeconds: 60 })
  @Post('password')
  @HttpCode(200)
  async change(
    @CurrentUser() user: SignedIn,
    @Body({ schema: passwordChangeSchema })
    body: z.infer<typeof passwordChangeSchema>,
  ) {
    await this.profile.changePassword(
      user,
      body.currentPassword,
      body.newPassword,
    );
    return { ok: true };
  }
}
