import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MailService } from './mail.service';
import { NotificationListener } from './notification.listener';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    MailService,
    NotificationListener,
  ],
  exports: [NotificationService, MailService],
})
export class NotificationModule {}
