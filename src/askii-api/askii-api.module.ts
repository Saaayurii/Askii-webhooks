import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AskiiApiService } from './askii-api.service';

/**
 * Модуль для работы с API СпросиИИ
 * Предоставляет сервисы для отправки сообщений
 */
@Module({
  imports: [HttpModule],
  providers: [AskiiApiService],
  exports: [AskiiApiService],
})
export class AskiiApiModule {}
