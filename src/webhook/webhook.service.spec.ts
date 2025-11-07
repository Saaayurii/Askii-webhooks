import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let configService: ConfigService;
  let aiService: AiService;

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
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    configService = module.get<ConfigService>(ConfigService);
    aiService = module.get<AiService>(AiService);
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
  });
});
