import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для ответа API СпросиИИ при отправке сообщения
 */
export class SendMessageResponseDto {
  @ApiProperty({
    description: 'Статус отправки',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'ID созданного сообщения',
    example: 789,
  })
  messageId?: number;

  @ApiProperty({
    description: 'Текст отправленного сообщения',
    example: 'Для публикации статьи необходимо...',
  })
  content?: string;

  @ApiProperty({
    description: 'Временная метка отправки',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Сообщение об ошибке (если есть)',
    example: null,
    required: false,
  })
  error?: string;
}
