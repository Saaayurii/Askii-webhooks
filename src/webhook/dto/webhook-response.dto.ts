import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для ответа webhook endpoint'а
 */
export class WebhookResponseDto {
  @ApiProperty({
    description: 'Статус обработки webhook',
    example: 'success',
    enum: ['success', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Сообщение о результате обработки',
    example: 'Webhook успешно обработан',
  })
  message: string;

  @ApiProperty({
    description: 'ID обработанного события',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  eventId: string;

  @ApiProperty({
    description: 'Временная метка обработки (ISO 8601)',
    example: '2024-01-15T10:30:05.123Z',
  })
  processedAt: string;
}
