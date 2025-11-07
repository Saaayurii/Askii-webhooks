import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Модуль для проверки состояния сервиса
 * Предоставляет health check endpoint
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
