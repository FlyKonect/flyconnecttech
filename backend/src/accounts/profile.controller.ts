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
import { PrismaService } from '../prisma/prisma.service.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';
import {
  passwordChangeSchema,
  profileSchema,
  ProfileService,
  teamProfileSchema,
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

/** A team member's own Profile settings (any team role). */
@Area('team')
@Controller('team/profile')
export class TeamProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: SignedIn) {
    return this.profile.getTeam(user);
  }

  @Patch()
  update(
    @CurrentUser() user: SignedIn,
    @Body({ schema: teamProfileSchema })
    body: z.infer<typeof teamProfileSchema>,
  ) {
    return this.profile.updateTeam(user, body);
  }
}

/**
 * Signed-in devices, for anyone signed in: the list, and "Sign out
 * everywhere else" (every session but this one).
 */
@Controller('me/sessions')
export class SessionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() user: SignedIn) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: user.id, expiresAt: { gt: new Date() } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, userAgent: true, createdAt: true, updatedAt: true },
    });
    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        device: session.userAgent ?? '',
        signedInAt: session.createdAt,
        lastUsedAt: session.updatedAt,
        current: session.id === user.sessionId,
      })),
    };
  }

  @Post('sign-out-others')
  @HttpCode(200)
  async signOutOthers(@CurrentUser() user: SignedIn) {
    const { count } = await this.prisma.session.deleteMany({
      where: { userId: user.id, NOT: { id: user.sessionId } },
    });
    return { signedOut: count };
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
