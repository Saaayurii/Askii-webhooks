import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * DTO для payload webhook'а от СпросиИИ
 */
export class WebhookPayloadDto {
  @ApiProperty({
    description: 'Уникальный идентификатор события',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({
    description: 'Тип события (например: message, conversation_start)',
    example: 'message',
  })
  @IsString()
  @IsNotEmpty()
  eventType: string;

  @ApiProperty({
    description: 'Временная метка события (ISO 8601)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ApiProperty({
    description: 'Данные события (содержимое зависит от типа события)',
    example: { message: 'Привет, как опубликовать статью?' },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @ApiProperty({
    description: 'Подпись webhook для проверки подлинности (опционально)',
    example: 'sha256=abc123def456...',
    required: false,
  })
  @IsString()
  @IsOptional()
  signature?: string;
}
