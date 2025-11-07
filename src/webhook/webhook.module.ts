import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AiModule } from '../ai/ai.module';
import { AskiiApiModule } from '../askii-api/askii-api.module';

/**
 * Модуль для обработки webhook'ов от СпросиИИ
 */
@Module({
  imports: [AiModule, AskiiApiModule],
  controllers: [WebhookController],
  providers: [WebhookService],
  exports: [WebhookService],
})
export class WebhookModule {}
