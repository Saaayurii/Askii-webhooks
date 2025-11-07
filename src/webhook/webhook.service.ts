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
    // Проверка eventId
    if (!payload.eventId || payload.eventId.trim() === '') {
      this.logger.error('Получен webhook с пустым eventId');
      throw new BadRequestException('eventId не может быть пустым');
    }

    // Проверка eventType
    if (!payload.eventType || payload.eventType.trim() === '') {
      this.logger.error(`Получен webhook без eventType, eventId: ${payload.eventId}`);
      throw new BadRequestException('eventType не может быть пустым');
    }

    // Проверка timestamp
    if (!payload.timestamp) {
      this.logger.warn(`Webhook без timestamp, eventId: ${payload.eventId}`);
    } else {
      // Проверяем, что timestamp валидная дата
      const timestamp = new Date(payload.timestamp);
      if (isNaN(timestamp.getTime())) {
        this.logger.error(`Некорректный timestamp в webhook: ${payload.timestamp}`);
        throw new BadRequestException('timestamp должен быть валидной датой ISO 8601');
      }
    }

    // Проверка data
    if (!payload.data || typeof payload.data !== 'object') {
      this.logger.error(`Получен webhook без корректного data, eventId: ${payload.eventId}`);
      throw new BadRequestException('data должен быть объектом и не может быть пустым');
    }

    // Для события message проверяем наличие текста
    if (payload.eventType === 'message' || payload.eventType === 'message_created') {
      const hasMessage = payload.data.message || payload.data.content || payload.data.text;
      if (!hasMessage) {
        this.logger.warn(`Webhook типа message без текста сообщения, eventId: ${payload.eventId}`);
      }
    }
  }

  /**
   * Обрабатывает событие нового сообщения
   * @param payload Данные события
   */
  private async handleMessageEvent(
    payload: WebhookPayloadDto,
  ): Promise<void> {
    this.logger.log(`Обработка сообщения: eventId=${payload.eventId}`);

    try {
      // Извлекаем сообщение пользователя из payload (проверяем разные поля)
      const userMessage =
        payload.data.message || payload.data.content || payload.data.text;
      const userId = payload.data.userId || payload.data.user_id || 'unknown';

      // Валидация сообщения
      if (!userMessage || typeof userMessage !== 'string') {
        this.logger.warn(
          `Сообщение пользователя не найдено или некорректного типа в payload, eventId: ${payload.eventId}`,
        );
        return;
      }

      if (userMessage.trim().length === 0) {
        this.logger.warn(
          `Получено пустое сообщение, eventId: ${payload.eventId}`,
        );
        return;
      }

      if (userMessage.length > 10000) {
        this.logger.warn(
          `Сообщение слишком длинное (${userMessage.length} символов), обрезаем до 10000`,
        );
      }

      this.logger.log(
        `Обработка сообщения от пользователя ${userId}: "${userMessage.substring(0, 50)}..."`,
      );

      // Формируем запрос к AI с валидацией
      const aiRequest: AiRequestDto = {
        userMessage: userMessage.substring(0, 10000), // Ограничиваем длину
        userId: String(userId), // Приводим к строке
        conversationHistory: Array.isArray(payload.data.conversationHistory)
          ? payload.data.conversationHistory
          : [],
      };

      // Генерируем ответ через AI с обработкой ошибок
      let aiResponse;
      try {
        aiResponse = await this.aiService.generateResponse(aiRequest);
        this.logger.log(
          `AI ответ сгенерирован (${aiResponse.response.length} символов): "${aiResponse.response.substring(0, 100)}..."`,
        );
      } catch (aiError) {
        this.logger.error(
          `Ошибка при генерации AI ответа: ${aiError.message}`,
          aiError.stack,
        );
        throw new Error(
          `Не удалось сгенерировать ответ AI: ${aiError.message}`,
        );
      }

      // Проверяем корректность ответа AI
      if (!aiResponse || !aiResponse.response) {
        this.logger.error('AI вернул пустой ответ');
        throw new Error('AI сервис вернул пустой ответ');
      }

      // Извлекаем conversationId и contactId из payload
      const conversationId =
        payload.data.conversationId || payload.data.conversation_id;
      const contactId = payload.data.contactId || payload.data.contact_id;

      // Валидация ID для отправки
      if (!conversationId || !contactId) {
        this.logger.warn(
          `conversationId (${conversationId}) или contactId (${contactId}) не найдены в payload, пропускаем отправку. EventId: ${payload.eventId}`,
        );
        return;
      }

      // Проверяем, что ID корректные числа
      if (
        isNaN(Number(conversationId)) ||
        isNaN(Number(contactId)) ||
        Number(conversationId) <= 0 ||
        Number(contactId) <= 0
      ) {
        this.logger.error(
          `Некорректные ID: conversationId=${conversationId}, contactId=${contactId}`,
        );
        return;
      }

      // Отправляем ответ обратно через API СпросиИИ
      try {
        const sendResult = await this.askiiApiService.sendSimpleMessage(
          Number(conversationId),
          Number(contactId),
          aiResponse.response,
        );

        this.logger.log(
          `✓ Ответ успешно отправлен в conversation ${conversationId}, messageId: ${sendResult.messageId}`,
        );
      } catch (sendError) {
        this.logger.error(
          `✗ Ошибка при отправке ответа через API СпросиИИ: ${sendError.message}`,
          sendError.stack,
        );
        // Не пробрасываем ошибку дальше, чтобы webhook считался обработанным
        // Это предотвращает повторную отправку webhook от СпросиИИ
      }
    } catch (error) {
      this.logger.error(
        `✗ Критическая ошибка при обработке сообщения (eventId: ${payload.eventId}): ${error.message}`,
        error.stack,
      );
      // Не пробрасываем ошибку, чтобы не вызвать повторную отправку webhook
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
