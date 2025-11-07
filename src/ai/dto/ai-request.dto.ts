import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

/**
 * DTO для сообщения в истории разговора
 */
export class ChatMessageDto {
  @ApiProperty({
    description: 'Роль отправителя (system | user | assistant)',
    example: 'user',
    enum: ['system', 'user', 'assistant'],
  })
  @IsString()
  @IsNotEmpty()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    description: 'Содержимое сообщения',
    example: 'Как опубликовать статью в научном журнале?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

/**
 * DTO для запроса к AI модели
 */
export class AiRequestDto {
  @ApiProperty({
    description: 'Текст запроса пользователя',
    example: 'Как опубликовать статью в научном журнале?',
  })
  @IsString()
  @IsNotEmpty()
  userMessage: string;

  @ApiProperty({
    description: 'История предыдущих сообщений (контекст разговора)',
    type: [ChatMessageDto],
    required: false,
  })
  @IsArray()
  @IsOptional()
  conversationHistory?: ChatMessageDto[];

  @ApiProperty({
    description: 'ID пользователя для персонализации ответов',
    example: 'user123',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
