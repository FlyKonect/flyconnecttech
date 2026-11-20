import { pageWindow, parsePaging } from '../common/paging.js';
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

  /**
   * ?limit= for the dashboards (the newest few), or ?page= for the
   * Notifications screen: 25 a page, newest first, with the total.
   */
  @Get()
  async list(
    @CurrentUser() user: SignedIn,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const [total, unread] = await Promise.all([
      this.notifications.count(user.id),
      this.notifications.unreadCount(user.id),
    ]);
    if (limit && !page) {
      const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
      const items = await this.notifications.list(user.id, take);
      return { items, unread, total, page: 1, pageSize: take };
    }
    const window = pageWindow(parsePaging(page, '25'), total);
    const items = await this.notifications.list(
      user.id,
      window.take,
      window.skip,
    );
    return {
      items,
      unread,
      total,
      page: window.page,
      pageSize: window.pageSize,
    };
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
