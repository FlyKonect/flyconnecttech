import { Global, Module } from '@nestjs/common';
import { AuditService } from '../audit/audit.service.js';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';

/** The app's settings: read anywhere, changed on the Settings screen. */
@Global()
@Module({
  controllers: [SettingsController],
  providers: [SettingsService, AuditService],
  exports: [SettingsService],
})
export class SettingsModule {}
