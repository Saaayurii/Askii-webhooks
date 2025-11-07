import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для информации об использовании памяти
 */
export class MemoryInfoDto {
  @ApiProperty({
    description: 'Используемая память (в MB)',
    example: '25.50 MB',
  })
  used: string;

  @ApiProperty({
    description: 'Общая доступная память (в MB)',
    example: '50.25 MB',
  })
  total: string;
}

/**
 * DTO для ответа health check endpoint'а
 */
export class HealthResponseDto {
  @ApiProperty({
    description: 'Статус сервиса',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Временная метка проверки (ISO 8601)',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Название сервиса',
    example: 'journal-assistant',
  })
  service: string;

  @ApiProperty({
    description: 'Версия приложения',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Время работы сервиса в секундах',
    example: 3600,
  })
  uptime: number;

  @ApiProperty({
    description: 'Информация об использовании памяти',
    type: MemoryInfoDto,
  })
  memory: MemoryInfoDto;
}
