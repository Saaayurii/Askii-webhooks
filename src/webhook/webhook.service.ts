import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { WebhookResponseDto } from './dto/webhook-response.dto';
import { AiService } from '../ai/ai.service';
import { AiRequestDto } from '../ai/dto/ai-request.dto';
import { AskiiApiService } from '../askii-api/askii-api.service';

/**
 * Сервис для обработки webhook'ов от СпросиИИ
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    private readonly askiiApiService: AskiiApiService,
  ) {}

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

    try {
      // Извлекаем сообщение пользователя из payload
      const userMessage =
        payload.data.message || payload.data.content || payload.data.text;
      const userId = payload.data.userId || payload.data.user_id || 'unknown';

      if (!userMessage) {
        this.logger.warn('Сообщение пользователя не найдено в payload');
        return;
      }

      // Формируем запрос к AI
      const aiRequest: AiRequestDto = {
        userMessage: userMessage,
        userId: userId,
        conversationHistory: payload.data.conversationHistory || [],
      };

      // Генерируем ответ через AI
      const aiResponse = await this.aiService.generateResponse(aiRequest);

      this.logger.log(
        `AI ответ сгенерирован: ${aiResponse.response.substring(0, 100)}...`,
      );

      // Извлекаем conversationId и contactId из payload
      const conversationId =
        payload.data.conversationId || payload.data.conversation_id;
      const contactId = payload.data.contactId || payload.data.contact_id;

      if (!conversationId || !contactId) {
        this.logger.warn(
          'conversationId или contactId не найдены в payload, пропускаем отправку',
        );
        return;
      }

      // Отправляем ответ обратно через API СпросиИИ
      try {
        const sendResult = await this.askiiApiService.sendSimpleMessage(
          conversationId,
          contactId,
          aiResponse.response,
        );

        this.logger.log(
          `Ответ успешно отправлен в conversation ${conversationId}, messageId: ${sendResult.messageId}`,
        );
      } catch (sendError) {
        this.logger.error(
          `Ошибка при отправке ответа через API: ${sendError.message}`,
          sendError.stack,
        );
        // Не пробрасываем ошибку дальше, чтобы webhook считался обработанным
      }
    } catch (error) {
      this.logger.error(
        `Ошибка при обработке сообщения: ${error.message}`,
        error.stack,
      );
    }
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
