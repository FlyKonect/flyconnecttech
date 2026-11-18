import { Controller, Get, Inject, Req, UseGuards } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AUTH } from '../auth/auth.constants.js';
import type { Auth } from '../auth/auth.js';
import { Public } from '../auth/decorators.js';
import { isTeamRole } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';

/**
 * "Am I signed in, and where?" for the public website, which is pre-built:
 * after a page loads it asks this, then shows "Client portal" or "Team
 * panel" instead of "Client login". Always answers 200 (no error for
 * visitors who aren't signed in), and says nothing but the area.
 */
@Public()
@UseGuards(RateLimitGuard)
@Controller('me/status')
export class SessionStatusController {
  constructor(
    @Inject(AUTH) private readonly auth: Auth,
    private readonly prisma: PrismaService,
  ) {}

  @RateLimit({ limit: 120, perSeconds: 60 })
  @Get()
  async status(
    @Req() request: Request,
  ): Promise<{ area: 'portal' | 'team' | null }> {
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session) return { area: null };
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true },
    });
    if (!user || user.status !== 'ACTIVE') return { area: null };
    return { area: isTeamRole(user.role) ? 'team' : 'portal' };
  }
}
