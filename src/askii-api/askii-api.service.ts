import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SendMessageDto } from './dto/send-message.dto';
import { SendMessageResponseDto } from './dto/send-message-response.dto';

/**
 * Сервис для работы с API СпросиИИ
 * Отправляет сообщения обратно в чат
 */
@Injectable()
export class AskiiApiService {
  private readonly logger = new Logger(AskiiApiService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly accountId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>(
      'ASKII_API_URL',
      'http://localhost:3000',
    );
    this.apiToken = this.configService.get<string>(
      'ASKII_API_TOKEN',
      '',
    );
    this.accountId = this.configService.get<string>('ASKII_ACCOUNT_ID', '1');

    this.logger.log(
      `AskII API Service инициализирован: URL=${this.apiUrl}, Account=${this.accountId}`,
    );
  }

  /**
   * Отправляет сообщение в разговор через API СпросиИИ
   * @param message Данные сообщения для отправки
   * @returns Результат отправки
   */
  async sendMessage(
    message: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    const url = `${this.apiUrl}/api/v1/accounts/${this.accountId}/conversations/${message.conversationId}/messages`;

    this.logger.log(
      `Отправка сообщения в conversation ${message.conversationId} для contact ${message.contactId}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            content: message.content,
            message_type: message.messageType || 'outgoing',
            private: message.private || false,
          },
          {
            headers: {
              'api_access_token': this.apiToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(
        `Сообщение успешно отправлено, ID: ${response.data.id || 'unknown'}`,
      );

      return {
        status: 'success',
        messageId: response.data.id,
        content: response.data.content,
        timestamp: response.data.created_at || new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Ошибка при отправке сообщения: ${error.message}`,
        error.stack,
      );

      if (error.response) {
        this.logger.error(
          `API ответил с статусом ${error.response.status}: ${JSON.stringify(error.response.data)}`,
        );
      }

      throw new Error(
        `Не удалось отправить сообщение: ${error.message}`,
      );
    }
  }

  /**
   * Отправляет сообщение с автоматическим определением conversation и contact
   * @param conversationId ID разговора
   * @param contactId ID контакта
   * @param content Текст сообщения
   * @returns Результат отправки
   */
  async sendSimpleMessage(
    conversationId: number,
    contactId: number,
    content: string,
  ): Promise<SendMessageResponseDto> {
    const message: SendMessageDto = {
      conversationId,
      contactId,
      content,
      messageType: 'outgoing',
    };

    return await this.sendMessage(message);
  }
}
