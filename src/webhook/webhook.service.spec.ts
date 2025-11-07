import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';
import { AskiiApiService } from '../askii-api/askii-api.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let configService: ConfigService;
  let aiService: AiService;
  let askiiApiService: AskiiApiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        WEBHOOK_SECRET: 'test-secret',
        BOT_NAME: 'Test Bot',
      };
      return config[key];
    }),
  };

  const mockAiService = {
    generateResponse: jest.fn().mockResolvedValue({
      response: 'Тестовый ответ от AI',
      model: 'qwen2.5:3b',
      promptTokens: 100,
      completionTokens: 200,
      totalTokens: 300,
      timestamp: new Date().toISOString(),
    }),
  };

  const mockAskiiApiService = {
    sendSimpleMessage: jest.fn().mockResolvedValue({
      status: 'success',
      messageId: 789,
      content: 'Тестовый ответ от AI',
      timestamp: new Date().toISOString(),
    }),
    sendMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: AskiiApiService,
          useValue: mockAskiiApiService,
        },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    configService = module.get<ConfigService>(ConfigService);
    aiService = module.get<AiService>(AiService);
    askiiApiService = module.get<AskiiApiService>(AskiiApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('handleWebhook', () => {
    const validPayload: WebhookPayloadDto = {
      eventId: '550e8400-e29b-41d4-a716-446655440000',
      eventType: 'message',
      timestamp: '2024-01-15T10:30:00.000Z',
      data: {
        message: 'Привет, как опубликовать статью?',
        userId: 'user123',
      },
    };

    it('должен успешно обработать валидный webhook', async () => {
      const result = await service.handleWebhook(validPayload);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.eventId).toBe(validPayload.eventId);
      expect(result.message).toBeDefined();
      expect(result.processedAt).toBeDefined();
    });

    it('должен логировать информацию о webhook', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.handleWebhook(validPayload);

      expect(logSpy).toHaveBeenCalled();
    });

    it('должен возвращать корректную временную метку', async () => {
      const before = new Date();
      const result = await service.handleWebhook(validPayload);
      const after = new Date();

      const processedAt = new Date(result.processedAt);

      expect(processedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(processedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('должен обрабатывать разные типы событий', async () => {
      const events = ['message', 'conversation_start', 'conversation_end'];

      for (const eventType of events) {
        const payload = { ...validPayload, eventType };
        const result = await service.handleWebhook(payload);

        expect(result.status).toBe('success');
        expect(result.eventId).toBe(payload.eventId);
      }
    });

    it('должен выбросить ошибку при пустом eventId', async () => {
      const invalidPayload = {
        ...validPayload,
        eventId: '',
      };

      await expect(service.handleWebhook(invalidPayload)).rejects.toThrow();
    });

    it('должен выбросить ошибку при отсутствии данных', async () => {
      const invalidPayload = {
        ...validPayload,
        data: null,
      } as any;

      await expect(service.handleWebhook(invalidPayload)).rejects.toThrow();
    });

    it('должен отправить ответ через AskiiApiService при событии message', async () => {
      const payloadWithConversation: WebhookPayloadDto = {
        ...validPayload,
        data: {
          ...validPayload.data,
          conversationId: 123,
          contactId: 456,
        },
      };

      await service.handleWebhook(payloadWithConversation);

      expect(mockAskiiApiService.sendSimpleMessage).toHaveBeenCalledWith(
        123,
        456,
        'Тестовый ответ от AI',
      );
    });

    it('должен обработать событие message без conversationId', async () => {
      const payloadWithoutConversation: WebhookPayloadDto = {
        ...validPayload,
        data: {
          message: 'Тестовое сообщение',
          userId: 'user123',
        },
      };

      const result = await service.handleWebhook(payloadWithoutConversation);

      expect(result.status).toBe('success');
      expect(mockAskiiApiService.sendSimpleMessage).not.toHaveBeenCalled();
    });

    it('должен вызвать AI сервис при событии message', async () => {
      await service.handleWebhook(validPayload);

      expect(mockAiService.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Привет, как опубликовать статью?',
          userId: 'user123',
        }),
      );
    });
  });
});
