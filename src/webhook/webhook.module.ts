import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';

/**
 * Модуль для обработки webhook'ов от СпросиИИ
 */
@Module({
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
