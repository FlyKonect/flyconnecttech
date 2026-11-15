import { BadRequestException, Injectable } from '@nestjs/common';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { z } from 'zod';
import type { SignedIn } from '../auth/signed-in.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { emailPrefsSchema, readEmailPrefs } from './email-prefs.js';
import { newPasswordSchema } from './password-rules.js';

/** True for a time zone name the server knows, like "Europe/London". */
export function isTimeZone(name: string): boolean {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: name });
    return true;
  } catch {
    return false;
  }
}

/** What a customer may change on their profile (screen 15). Not company or email. */
export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(120),
  phone: z.string().trim().max(40).default(''),
  country: z.string().trim().max(80).default(''),
  timezone: z
    .string()
    .trim()
    .refine(isTimeZone, 'Choose a time zone from the list'),
  emailPrefs: emailPrefsSchema,
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(200),
  newPassword: newPasswordSchema,
});

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(user: SignedIn) {
    const row = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        country: true,
        timezone: true,
        jobTitle: true,
        emailPrefs: true,
        customer: { select: { company: true } },
      },
    });
    const { customer, emailPrefs, ...rest } = row;
    return {
      ...rest,
      company: customer?.company ?? null,
      emailPrefs: readEmailPrefs(emailPrefs),
    };
  }

  async update(user: SignedIn, input: ProfileInput) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        phone: input.phone || null,
        country: input.country || null,
        timezone: input.timezone,
        emailPrefs: input.emailPrefs,
      },
    });
    return this.get(user);
  }

  /**
   * Checks the current password, saves the new one, and signs the person
   * out on their other devices. This device stays signed in.
   */
  async changePassword(
    user: SignedIn,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const account = await this.prisma.account.findFirst({
      where: { userId: user.id, providerId: 'credential' },
      select: { id: true, password: true },
    });
    const right =
      !!account?.password &&
      (await verifyPassword({
        hash: account.password,
        password: currentPassword,
      }));
    if (!account || !right) {
      throw new BadRequestException({
        code: 'WRONG_PASSWORD',
        message: 'Your current password is not right.',
      });
    }

    const hash = await hashPassword(newPassword);
    await this.prisma.$transaction([
      this.prisma.account.update({
        where: { id: account.id },
        data: { password: hash },
      }),
      this.prisma.session.deleteMany({
        where: { userId: user.id, id: { not: user.sessionId } },
      }),
    ]);
  }
}
