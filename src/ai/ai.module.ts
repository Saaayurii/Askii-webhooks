import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

/**
 * Модуль для работы с AI (LLM)
 * Предоставляет сервисы для генерации ответов через языковые модели
 */
@Module({
  imports: [HttpModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
