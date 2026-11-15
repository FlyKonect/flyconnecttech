import { Module } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module.js';
import { AuditService } from '../audit/audit.service.js';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';

@Module({
  imports: [AccountsModule],
  controllers: [CustomersController],
  providers: [CustomersService, AuditService],
})
export class CustomersModule {}
