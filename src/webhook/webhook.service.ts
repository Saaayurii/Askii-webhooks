import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';

/**
 * Сервис для обработки webhook'ов от СпросиИИ
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Обрабатывает входящий webhook от СпросиИИ
   * @param payload Данные webhook
   * @returns Результат обработки
   */
  async handleWebhook(
    payload: WebhookPayloadDto,
  ): Promise<WebhookResponseDto> {
    // Валидация payload
    this.validatePayload(payload);

    this.logger.log(
      `Получен webhook: eventId=${payload.eventId}, type=${payload.eventType}`,
    );

    try {
      // Здесь будет логика обработки webhook
      // В зависимости от типа события, будем вызывать соответствующие обработчики

      switch (payload.eventType) {
        case 'message':
          await this.handleMessageEvent(payload);
          break;
        case 'conversation_start':
          await this.handleConversationStart(payload);
          break;
        case 'conversation_end':
          await this.handleConversationEnd(payload);
          break;
        default:
          this.logger.warn(`Неизвестный тип события: ${payload.eventType}`);
      }

      return {
        status: 'success',
        message: 'Webhook успешно обработан',
        eventId: payload.eventId,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при обработке webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Валидирует payload webhook
   * @param payload Данные для валидации
   * @throws BadRequestException если данные невалидны
   */
  private validatePayload(payload: WebhookPayloadDto): void {
    if (!payload.eventId || payload.eventId.trim() === '') {
      throw new BadRequestException('eventId не может быть пустым');
    }

    if (!payload.data) {
      throw new BadRequestException('data не может быть пустым');
    }
  }

  /**
   * Обрабатывает событие нового сообщения
   * @param payload Данные события
   */
  private async handleMessageEvent(
    payload: WebhookPayloadDto,
  ): Promise<void> {
    this.logger.log(`Обработка сообщения: ${JSON.stringify(payload.data)}`);
    // TODO: Интеграция с AI модулем для генерации ответа
  }

  /**
   * Обрабатывает событие начала разговора
   * @param payload Данные события
   */
  private async handleConversationStart(
    payload: WebhookPayloadDto,
  ): Promise<void> {
    this.logger.log(`Начало разговора: ${JSON.stringify(payload.data)}`);
    // TODO: Инициализация контекста разговора
  }

  /**
   * Обрабатывает событие завершения разговора
   * @param payload Данные события
   */
  private async handleConversationEnd(
    payload: WebhookPayloadDto,
  ): Promise<void> {
    this.logger.log(`Завершение разговора: ${JSON.stringify(payload.data)}`);
    // TODO: Сохранение истории разговора
  }
}
