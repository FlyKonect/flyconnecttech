import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsModule } from './accounts/accounts.module.js';
import { AuthModule } from './auth/auth.module.js';
import { envSchema } from './config/env.js';
import { EmailModule } from './email/email.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // Reads backend/.env and checks every setting against src/config/env.ts.
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envSchema }),
    PrismaModule,
    AuthModule,
    EmailModule,
    AccountsModule,
    HealthModule,
  ],
})
export class AppModule {}
