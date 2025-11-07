import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO для ответа от AI модели
 */
export class AiResponseDto {
  @ApiProperty({
    description: 'Сгенерированный ответ от AI',
    example:
      'Для публикации статьи в научном журнале необходимо: 1) Подготовить рукопись согласно требованиям журнала...',
  })
  response: string;

  @ApiProperty({
    description: 'Использованная модель',
    example: 'qwen2.5:3b',
  })
  model: string;

  @ApiProperty({
    description: 'Количество токенов в запросе',
    example: 150,
  })
  promptTokens: number;

  @ApiProperty({
    description: 'Количество токенов в ответе',
    example: 350,
  })
  completionTokens: number;

  @ApiProperty({
    description: 'Общее количество токенов',
    example: 500,
  })
  totalTokens: number;

  @ApiProperty({
    description: 'Временная метка генерации ответа',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}
