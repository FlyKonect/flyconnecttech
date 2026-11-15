import { Global, Module } from '@nestjs/common';
import { DevEmailsController } from './dev-emails.controller.js';
import { EmailService } from './email.service.js';

@Global()
@Module({
  controllers: [DevEmailsController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
