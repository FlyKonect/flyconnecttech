import {
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Env } from '../config/env.js';

/**
 * Request limits for our own public routes (accept invitation, forgot and
 * reset password). Better Auth limits its own sign-in routes itself.
 *
 *   @RateLimit({ limit: 5, perSeconds: 60 })
 *
 * Counts are kept in memory, per visitor address and route. That suits one
 * server process, which is what the hosting runs. They reset when the app
 * restarts.
 */

export type RateLimitRule = { limit: number; perSeconds: number };

const RULE = 'rate-limit:rule';

export const RateLimit = (rule: RateLimitRule) => SetMetadata(RULE, rule);

type Window = { count: number; resetsAt: number };

/** The counting, kept apart from Nest so it can be tested on its own. */
export class RateLimiter {
  private readonly windows = new Map<string, Window>();
  private lastSweep = 0;

  /** True if this attempt is allowed, and counts it. */
  hit(key: string, rule: RateLimitRule, now = Date.now()): boolean {
    this.sweep(now);
    const current = this.windows.get(key);
    if (!current || current.resetsAt <= now) {
      this.windows.set(key, {
        count: 1,
        resetsAt: now + rule.perSeconds * 1000,
      });
      return true;
    }
    current.count += 1;
    return current.count <= rule.limit;
  }

  /** Forgets finished windows now and then, so memory does not grow. */
  private sweep(now: number) {
    if (now - this.lastSweep < 60_000) return;
    this.lastSweep = now;
    for (const [key, window] of this.windows) {
      if (window.resetsAt <= now) this.windows.delete(key);
    }
  }
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly limiter = new RateLimiter();
  private readonly enabled: boolean;

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService<Env, true>,
  ) {
    this.enabled = config.get('RATE_LIMITS');
  }

  canActivate(context: ExecutionContext): boolean {
    const rule = this.reflector.getAllAndOverride<RateLimitRule | undefined>(
      RULE,
      [context.getHandler(), context.getClass()],
    );
    if (!rule || !this.enabled) return true;

    const request = context.switchToHttp().getRequest<Request>();
    // request.ip is the visitor's address; behind the hosting's web server it
    // is only right when TRUST_PROXY is on (see app.setup.ts).
    const key = `${request.ip ?? 'unknown'} ${request.method} ${request.route?.path ?? request.path}`;

    if (!this.limiter.hit(key, rule)) {
      throw new HttpException(
        {
          code: 'TOO_MANY_ATTEMPTS',
          message: 'Too many attempts. Please wait a minute and try again.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
