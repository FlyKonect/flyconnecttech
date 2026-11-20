import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Area, Can } from '../auth/decorators.js';
import { EmailService } from './email.service.js';

/** The Failed emails screen: super admins and admins. */
@Area('team')
@Can('emails.manage')
@Controller('team/emails')
export class TeamEmailsController {
  constructor(private readonly email: EmailService) {}

  /** Emails still being retried, and those that gave up. */
  @Get()
  async list() {
    return { items: await this.email.waiting() };
  }

  /** One more try now. */
  @Post(':id/resend')
  @HttpCode(200)
  async resend(@Param('id') id: string) {
    return { sent: await this.email.resend(id) };
  }

  /** Remove it from the list without sending. */
  @Post(':id/dismiss')
  @HttpCode(200)
  async dismiss(@Param('id') id: string) {
    await this.email.dismiss(id);
    return { ok: true };
  }
}
