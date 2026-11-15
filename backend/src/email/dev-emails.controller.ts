import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import type { Response } from 'express';
import { Public } from '../auth/decorators.js';
import type { Env } from '../config/env.js';
import { EMAIL_PREVIEWS } from './previews.js';

/**
 * Every email with sample content, for the website's development page
 * /dev/emails. Development only: "not found" on the live site.
 */
@Public()
@Controller('dev/emails')
export class DevEmailsController {
  private readonly live: boolean;
  private readonly siteUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.live = config.get('NODE_ENV') === 'production';
    this.siteUrl = config.get('FRONTEND_URL').replace(/\/$/, '');
  }

  @Get()
  list() {
    if (this.live) throw new NotFoundException();
    return EMAIL_PREVIEWS.map(({ key, row, to, subject, calendar }) => ({
      key,
      row,
      to,
      subject,
      calendar: calendar ?? false,
    }));
  }

  /** The email as sent: HTML, or its plain-text version with ?format=text. */
  @Get(':key')
  async show(
    @Param('key') key: string,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ) {
    const preview = EMAIL_PREVIEWS.find((item) => item.key === key);
    if (this.live || !preview) throw new NotFoundException();
    const element = preview.render(this.siteUrl);
    if (format === 'text') {
      res
        .type('text/plain; charset=utf-8')
        .send(await render(element, { plainText: true }));
      return;
    }
    res.type('text/html; charset=utf-8').send(await render(element));
  }
}
