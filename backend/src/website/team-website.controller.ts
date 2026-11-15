import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { z } from 'zod';
import { Area, Can, CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { linkSchema, testimonialSchema } from './website-rules.js';
import { WebsiteService } from './website.service.js';

/** The Website content screen: super admins and admins. */
@Area('team')
@Can('website.manage')
@Controller('team/website')
export class TeamWebsiteController {
  constructor(private readonly website: WebsiteService) {}

  @Get()
  read() {
    return this.website.teamView();
  }

  @Post('link')
  @HttpCode(200)
  saveLink(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: linkSchema }) body: z.infer<typeof linkSchema>,
  ) {
    return this.website.saveLink(actor.id, body.liveProjectUrl);
  }

  @Post('testimonials')
  add(
    @CurrentUser() actor: SignedIn,
    @Body({ schema: testimonialSchema })
    body: z.output<typeof testimonialSchema>,
  ) {
    return this.website.add(actor.id, body);
  }

  @Post('testimonials/:id')
  @HttpCode(200)
  update(
    @CurrentUser() actor: SignedIn,
    @Param('id') id: string,
    @Body({ schema: testimonialSchema })
    body: z.output<typeof testimonialSchema>,
  ) {
    return this.website.update(actor.id, id, body);
  }

  @Post('testimonials/:id/remove')
  @HttpCode(200)
  remove(@CurrentUser() actor: SignedIn, @Param('id') id: string) {
    return this.website.remove(actor.id, id);
  }
}
