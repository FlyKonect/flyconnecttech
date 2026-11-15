import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module.js';
import { AuthModule } from './auth/auth.module.js';
import { envSchema } from './config/env.js';
import { EmailModule } from './email/email.module.js';
import { HealthModule } from './health/health.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RequestsModule } from './requests/requests.module.js';
import { SettingsModule } from './settings/settings.service.js';
import { UploadsModule } from './uploads/uploads.module.js';

@Module({
  imports: [
    // Reads backend/.env and checks every setting against src/config/env.ts.
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    PrismaModule,
    AuthModule,
    EmailModule,
    SettingsModule,
    UploadsModule,
    NotificationsModule,
    AccountsModule,
    RequestsModule,
    HealthModule,
  ],
})
export class AppModule {}
