import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsEnum,
  IsISO8601,
  IsUUID,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Допустимые типы событий webhook
 */
export enum WebhookEventType {
  MESSAGE = 'message',
  CONVERSATION_START = 'conversation_start',
  CONVERSATION_END = 'conversation_end',
  CONVERSATION_UPDATE = 'conversation_update',
  MESSAGE_CREATED = 'message_created',
  MESSAGE_UPDATED = 'message_updated',
}

/**
 * DTO для данных внутри webhook payload
 */
export class WebhookDataDto {
  @ApiProperty({
    description: 'Текст сообщения',
    example: 'Как опубликовать статью?',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Сообщение не может быть пустым' })
  @MaxLength(10000, { message: 'Сообщение слишком длинное (макс. 10000 символов)' })
  message?: string;

  @ApiProperty({
    description: 'Альтернативное поле для текста сообщения',
    example: 'Привет!',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Альтернативное поле для текста',
    example: 'Текст сообщения',
    required: false,
  })
  @IsString()
  @IsOptional()
  text?: string;

  @ApiProperty({
    description: 'ID пользователя',
    example: 'user123',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Альтернативное поле для ID пользователя',
    required: false,
  })
  @IsOptional()
  user_id?: string | number;

  @ApiProperty({
    description: 'ID разговора',
    example: 123,
    required: false,
  })
  @IsOptional()
  conversationId?: number;

  @ApiProperty({
    description: 'Альтернативное поле для ID разговора',
    required: false,
  })
  @IsOptional()
  conversation_id?: number;

  @ApiProperty({
    description: 'ID контакта',
    example: 456,
    required: false,
  })
  @IsOptional()
  contactId?: number;

  @ApiProperty({
    description: 'Альтернативное поле для ID контакта',
    required: false,
  })
  @IsOptional()
  contact_id?: number;

  @ApiProperty({
    description: 'История разговора',
    required: false,
  })
  @IsOptional()
  conversationHistory?: any[];

  // Позволяем дополнительные поля для гибкости
  [key: string]: any;
}

/**
 * DTO для payload webhook'а от СпросиИИ
 * С расширенной валидацией и обработкой ошибок
 */
export class WebhookPayloadDto {
  @ApiProperty({
    description: 'Уникальный идентификатор события (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'eventId должен быть строкой' })
  @IsNotEmpty({ message: 'eventId не может быть пустым' })
  @MinLength(1, { message: 'eventId не может быть пустым' })
  eventId: string;

  @ApiProperty({
    description: 'Тип события',
    example: 'message',
    enum: WebhookEventType,
  })
  @IsString({ message: 'eventType должен быть строкой' })
  @IsNotEmpty({ message: 'eventType не может быть пустым' })
  @IsEnum(WebhookEventType, {
    message: `eventType должен быть одним из: ${Object.values(WebhookEventType).join(', ')}`,
  })
  eventType: WebhookEventType | string;

  @ApiProperty({
    description: 'Временная метка события (ISO 8601)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString({ message: 'timestamp должен быть строкой' })
  @IsNotEmpty({ message: 'timestamp не может быть пустым' })
  @IsISO8601({}, { message: 'timestamp должен быть в формате ISO 8601' })
  timestamp: string;

  @ApiProperty({
    description: 'Данные события (содержимое зависит от типа события)',
    type: WebhookDataDto,
  })
  @IsObject({ message: 'data должен быть объектом' })
  @IsNotEmpty({ message: 'data не может быть пустым' })
  @ValidateNested()
  @Type(() => WebhookDataDto)
  data: WebhookDataDto;

  @ApiProperty({
    description: 'Подпись webhook для проверки подлинности (опционально)',
    example: 'sha256=abc123def456...',
    required: false,
  })
  @IsString({ message: 'signature должен быть строкой' })
  @IsOptional()
  @Matches(/^(sha256|sha1)=.+$/, {
    message: 'signature должен быть в формате "sha256=..." или "sha1=..."',
  })
  signature?: string;
}
