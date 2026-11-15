import {
  Controller,
  Get,
  Global,
  HttpCode,
  Module,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators.js';
import type { SignedIn } from '../auth/signed-in.js';
import { NotificationsService } from './notifications.service.js';

/**
 * The signed-in person's own notifications, in the portal and the team panel.
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: SignedIn, @Query('limit') limit?: string) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const [items, unread] = await Promise.all([
      this.notifications.list(user.id, take),
      this.notifications.unreadCount(user.id),
    ]);
    return { items, unread };
  }

  @Post('read-all')
  @HttpCode(200)
  async readAll(@CurrentUser() user: SignedIn) {
    await this.notifications.markAllRead(user.id);
    return { ok: true };
  }

  @Post(':id/read')
  @HttpCode(200)
  async read(
    @CurrentUser() user: SignedIn,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    await this.notifications.markRead(user.id, id);
    return { ok: true };
  }
}

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
