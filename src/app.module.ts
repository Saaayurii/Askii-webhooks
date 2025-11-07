import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { WebhookModule } from './webhook/webhook.module';
import { AiModule } from './ai/ai.module';
import { AskiiApiModule } from './askii-api/askii-api.module';

/**
 * Корневой модуль приложения
 * Импортирует все необходимые модули и настраивает приложение
 */
@Module({
  imports: [
    // Глобальная конфигурация переменных окружения
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Модуль для health check
    HealthModule,
    // Модуль для работы с AI (LLM)
    AiModule,
    // Модуль для работы с API СпросиИИ
    AskiiApiModule,
    // Модуль для обработки webhook'ов
    WebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
