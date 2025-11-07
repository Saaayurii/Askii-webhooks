import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

/**
 * Контроллер для обработки webhook'ов от СпросиИИ
 */
@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Endpoint для приема webhook'ов от СпросиИИ
   * @param payload Данные webhook
   * @returns Результат обработки
   */
  @Post('askii')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Прием webhook от СпросиИИ',
    description:
      'Endpoint для получения и обработки webhook событий от платформы СпросиИИ. Поддерживает различные типы событий: message, conversation_start, conversation_end',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook успешно обработан',
    type: WebhookResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные webhook',
  })
  async handleWebhook(
    @Body() payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    return await this.webhookService.handleWebhook(payload);
  }
}
