import { Controller, Get } from '@nestjs/common';
import { AllowWithoutTwoFactor, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { actionsFor, isTeamRole } from '../policies/policies.js';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * "Who am I": the signed-in person, which area they belong to, and what they
 * may do. The frontend uses it to protect pages and build the menus.
 * Open before two-factor is set up, so the frontend can send team members
 * to the setup page.
 */
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @AllowWithoutTwoFactor()
  @Get()
  async me(@CurrentUser() user: SignedIn) {
    const customer = user.customerId
      ? await this.prisma.customer.findUnique({
          where: { id: user.customerId },
          select: { id: true, company: true },
        })
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle,
      timezone: user.timezone,
      area: isTeamRole(user.role) ? 'team' : 'portal',
      twoFactorEnabled: user.twoFactorEnabled,
      customer,
      actions: actionsFor(user),
    };
  }
}
