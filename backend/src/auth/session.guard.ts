import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { can, isTeamRole, type Action } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AUTH } from './auth.constants.js';
import type { Auth } from './auth.js';
import { ACTION, AREA, NO_TWO_FACTOR, PUBLIC } from './decorators.js';
import type { SignedIn } from './signed-in.js';

/**
 * Runs before every backend route.
 *
 * 1. @Public() routes are open.
 * 2. Otherwise a valid session for an ACTIVE account is required (401).
 * 3. Team members without two-factor may only use @AllowWithoutTwoFactor()
 *    routes (403 TWO_FACTOR_REQUIRED).
 * 4. @Area('portal') is for customers only, @Area('team') for team roles,
 *    and @Can(action) checks the permission table (403).
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH) private readonly auth: Auth,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const read = <T>(key: string) =>
      this.reflector.getAllAndOverride<T | undefined>(key, targets);

    if (read<boolean>(PUBLIC)) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: SignedIn }>();

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session) {
      throw new UnauthorizedException({ code: 'SIGNED_OUT' });
    }

    // Read the account fresh, so a disabled account or a role change takes
    // effect at once, not only when the session ends.
    const user = await this.prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        customerId: true,
        jobTitle: true,
        timezone: true,
        twoFactorEnabled: true,
      },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException({ code: 'SIGNED_OUT' });
    }

    const signedIn: SignedIn = { ...user, sessionId: session.session.id };
    request.user = signedIn;

    const team = isTeamRole(user.role);
    if (team && !user.twoFactorEnabled && !read<boolean>(NO_TWO_FACTOR)) {
      throw new ForbiddenException({ code: 'TWO_FACTOR_REQUIRED' });
    }

    const action = read<Action>(ACTION);
    const area = read<'portal' | 'team'>(AREA) ?? (action ? 'team' : undefined);
    if (area === 'portal' && user.role !== 'CUSTOMER') {
      throw new ForbiddenException({ code: 'WRONG_AREA', area: 'team' });
    }
    if (area === 'team' && !team) {
      throw new ForbiddenException({ code: 'WRONG_AREA', area: 'portal' });
    }
    if (action && !can(user, action)) {
      throw new ForbiddenException({ code: 'NOT_ALLOWED' });
    }

    return true;
  }
}
