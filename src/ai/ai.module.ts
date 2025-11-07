import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';

/**
 * Модуль для работы с AI (LLM)
 * Предоставляет сервисы для генерации ответов через языковые модели
 */
@Module({
  imports: [HttpModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
