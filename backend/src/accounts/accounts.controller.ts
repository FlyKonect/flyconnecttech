import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { Public } from '../auth/decorators.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';
import { InvitationsService } from './invitations.service.js';
import { sideFromHeader } from './login-key.js';
import { newPasswordSchema } from './password-rules.js';
import { PasswordResetService } from './password-reset.service.js';

const acceptSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(120),
  phone: z.string().trim().max(40).optional(),
  password: newPasswordSchema,
});

const forgotSchema = z.object({
  email: z.email('Enter a valid email address').max(191),
  // Which sign-in page asks: customer and team accounts are separate.
  side: z.enum(['customer', 'team']).optional(),
});

const resetSchema = z.object({ password: newPasswordSchema });

/** Only a few tries a minute from one address, against guessing. */
const FEW = { limit: 5, perSeconds: 60 };
const LOOKUPS = { limit: 20, perSeconds: 60 };

/**
 * The account links that work without being signed in: accept an invitation
 * and reset a password. All rate-limited.
 */
@Public()
@UseGuards(RateLimitGuard)
@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly invitations: InvitationsService,
    private readonly passwords: PasswordResetService,
  ) {}

  @RateLimit(LOOKUPS)
  @Get('invitations/:token')
  invitation(@Param('token') token: string) {
    return this.invitations.details(token);
  }

  @RateLimit(FEW)
  @Post('invitations/:token/accept')
  @HttpCode(200)
  accept(
    @Param('token') token: string,
    @Body({ schema: acceptSchema }) body: z.infer<typeof acceptSchema>,
  ) {
    return this.invitations.accept(token, body);
  }

  @RateLimit(FEW)
  @Post('password/forgot')
  @HttpCode(202)
  async forgot(
    @Body({ schema: forgotSchema }) body: z.infer<typeof forgotSchema>,
  ) {
    await this.passwords.requestByEmail(
      body.email,
      body.side ? sideFromHeader(body.side) : null,
    );
    // The same answer whether or not the email has an account.
    return { ok: true };
  }

  @RateLimit(LOOKUPS)
  @Get('password/reset/:token')
  resetDetails(@Param('token') token: string) {
    return this.passwords.details(token);
  }

  @RateLimit(FEW)
  @Post('password/reset/:token')
  @HttpCode(200)
  reset(
    @Param('token') token: string,
    @Body({ schema: resetSchema }) body: z.infer<typeof resetSchema>,
  ) {
    return this.passwords.reset(token, body.password);
  }
}
