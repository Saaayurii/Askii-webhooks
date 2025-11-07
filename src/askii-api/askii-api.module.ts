import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AskiiApiService } from './askii-api.service';
import { AskiiApiController } from './askii-api.controller';

/**
 * Модуль для работы с API СпросиИИ
 * Предоставляет сервисы для отправки сообщений
 */
@Module({
  imports: [HttpModule],
  controllers: [AskiiApiController],
  providers: [AskiiApiService],
  exports: [AskiiApiService],
})
export class AskiiApiModule {}
