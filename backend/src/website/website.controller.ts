import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from '../auth/decorators.js';
import { RateLimit, RateLimitGuard } from '../rate-limit/rate-limit.js';
import { WebsiteService } from './website.service.js';

/** The website's server reads this about once a minute, and after a change. */
const LOOKS = { limit: 120, perSeconds: 60 };

/** What the public website shows: testimonials and the live-project link. */
@Public()
@UseGuards(RateLimitGuard)
@Controller('website')
export class WebsiteController {
  constructor(private readonly website: WebsiteService) {}

  @RateLimit(LOOKS)
  @Get()
  content() {
    return this.website.publicContent();
  }
}
