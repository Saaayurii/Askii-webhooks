import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AiModule } from '../ai/ai.module';

/**
 * Модуль для обработки webhook'ов от СпросиИИ
 */
@Module({
  imports: [AiModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
