import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiRequestDto } from './dto/ai-request.dto';
import { AiResponseDto } from './dto/ai-response.dto';

/**
 * Контроллер для работы с AI (LLM)
 * Предоставляет endpoints для генерации ответов
 */
@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Генерирует ответ AI на основе сообщения пользователя
   * @param request Запрос с сообщением пользователя
   * @returns Ответ от AI с метаданными
   */
  @Post('generate')
  @ApiOperation({
    summary: 'Генерация ответа AI',
    description:
      'Генерирует ответ AI (LLM) на основе сообщения пользователя с учетом контекста научного журнала',
  })
  @ApiResponse({
    status: 201,
    description: 'Ответ успешно сгенерирован',
    type: AiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при генерации ответа',
  })
  async generateResponse(
    @Body() request: AiRequestDto,
  ): Promise<AiResponseDto> {
    return await this.aiService.generateResponse(request);
  }
}
