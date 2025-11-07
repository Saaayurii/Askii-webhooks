import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO для отправки сообщения в API СпросиИИ
 */
export class SendMessageDto {
  @ApiProperty({
    description: 'ID разговора (conversation)',
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  conversationId: number;

  @ApiProperty({
    description: 'ID контакта (пользователя)',
    example: 456,
  })
  @IsNumber()
  @IsNotEmpty()
  contactId: number;

  @ApiProperty({
    description: 'Текст сообщения для отправки',
    example: 'Для публикации статьи необходимо...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Тип сообщения (incoming | outgoing)',
    example: 'outgoing',
    enum: ['incoming', 'outgoing'],
    default: 'outgoing',
  })
  @IsString()
  @IsOptional()
  messageType?: string;

  @ApiProperty({
    description: 'Приватное сообщение или нет',
    example: false,
    default: false,
  })
  @IsOptional()
  private?: boolean;
}
