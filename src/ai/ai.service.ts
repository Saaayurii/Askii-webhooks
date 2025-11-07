import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiRequestDto, ChatMessageDto } from './dto/ai-request.dto';
import { AiResponseDto } from './dto/ai-response.dto';
import { getSystemPrompt } from './prompts/journal-assistant.prompt';

/**
 * Сервис для работы с AI моделью (LLM)
 * Обеспечивает интеграцию с OpenAI-совместимым API (Ollama)
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private readonly configService: ConfigService) {
    // Инициализация OpenAI клиента для работы с Ollama
    const apiUrl = this.configService.get<string>(
      'OLLAMA_API_URL',
      'http://172.16.0.14:11434',
    );
    const apiKey = this.configService.get<string>('OLLAMA_API_KEY', 'ollama');

    this.openai = new OpenAI({
      baseURL: `${apiUrl}/v1`,
      apiKey: apiKey,
    });

    // Конфигурация модели
    this.model = this.configService.get<string>(
      'OPENAI_GPT_MODEL',
      'qwen2.5:3b',
    );
    this.maxTokens = this.configService.get<number>('MAX_TOKENS', 1000);
    this.temperature = this.configService.get<number>('TEMPERATURE', 0.7);

    this.logger.log(
      `AI Service инициализирован: модель=${this.model}, URL=${apiUrl}`,
    );
  }

  /**
   * Генерирует ответ от AI модели на основе запроса пользователя
   * @param request Запрос с сообщением пользователя
   * @returns Ответ от AI модели
   */
  async generateResponse(request: AiRequestDto): Promise<AiResponseDto> {
    // Валидация запроса
    if (!request.userMessage || request.userMessage.trim() === '') {
      throw new BadRequestException('Сообщение пользователя не может быть пустым');
    }

    this.logger.log(
      `Генерация ответа для пользователя: ${request.userId || 'anonymous'}`,
    );

    try {
      // Построение массива сообщений для API
      const messages = this.buildMessages(
        request.userMessage,
        request.conversationHistory,
      );

      // Вызов API для генерации ответа
      const startTime = Date.now();
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const responseTime = Date.now() - startTime;

      this.logger.log(
        `Ответ сгенерирован за ${responseTime}ms, токены: ${completion.usage?.total_tokens || 0}`,
      );

      // Формирование ответа
      const aiResponse: AiResponseDto = {
        response: completion.choices[0]?.message?.content || '',
        model: this.model,
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        timestamp: new Date().toISOString(),
      };

      return aiResponse;
    } catch (error) {
      this.logger.error(
        `Ошибка при генерации ответа: ${error.message}`,
        error.stack,
      );
      throw new Error(`Не удалось сгенерировать ответ: ${error.message}`);
    }
  }

  /**
   * Строит массив сообщений для отправки в API
   * @param userMessage Текущее сообщение пользователя
   * @param conversationHistory История предыдущих сообщений (опционально)
   * @returns Массив сообщений для API
   */
  private buildMessages(
    userMessage: string,
    conversationHistory?: ChatMessageDto[],
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [];

    // Добавляем системный промпт
    messages.push({
      role: 'system',
      content: getSystemPrompt(),
    });

    // Добавляем историю разговора (если есть)
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Добавляем текущее сообщение пользователя
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Получает информацию о доступных моделях
   * @returns Список доступных моделей
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.openai.models.list();
      return models.data.map((model) => model.id);
    } catch (error) {
      this.logger.warn(`Не удалось получить список моделей: ${error.message}`);
      return [this.model];
    }
  }
}
