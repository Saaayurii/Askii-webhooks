import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';

/**
 * Контроллер для проверки состояния сервиса
 * Предоставляет endpoint для health check
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * Проверка состояния сервиса
   * @returns Информация о состоянии приложения
   */
  @Get()
  @ApiOperation({
    summary: 'Проверка состояния сервиса',
    description:
      'Возвращает информацию о текущем состоянии приложения, включая статус, версию, время работы и использование памяти',
  })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает нормально',
    type: HealthResponseDto,
  })
  check(): HealthResponseDto {
    const memoryUsage = process.memoryUsage();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'journal-assistant',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: this.formatBytes(memoryUsage.heapUsed),
        total: this.formatBytes(memoryUsage.heapTotal),
      },
    };
  }

  /**
   * Форматирует байты в читаемый формат
   * @param bytes Количество байтов
   * @returns Отформатированная строка (например, "25.5 MB")
   */
  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  }
}
