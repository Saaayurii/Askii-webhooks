import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';

describe('WebhookController', () => {
  let controller: WebhookController;
  let service: WebhookService;

  const mockWebhookService = {
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: WebhookService,
          useValue: mockWebhookService,
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    service = module.get<WebhookService>(WebhookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
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
      const expectedResponse = {
        status: 'success',
        message: 'Webhook успешно обработан',
        eventId: validPayload.eventId,
        processedAt: expect.any(String),
      };

      mockWebhookService.handleWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.handleWebhook(validPayload);

      expect(result).toEqual(expectedResponse);
      expect(service.handleWebhook).toHaveBeenCalledWith(validPayload);
      expect(service.handleWebhook).toHaveBeenCalledTimes(1);
    });

    it('должен вернуть ошибку при невалидных данных', async () => {
      const invalidPayload = {
        eventId: '',
        eventType: 'message',
        timestamp: '2024-01-15T10:30:00.000Z',
        data: {},
      } as WebhookPayloadDto;

      mockWebhookService.handleWebhook.mockRejectedValue(
        new Error('Невалидные данные webhook'),
      );

      await expect(controller.handleWebhook(invalidPayload)).rejects.toThrow();
      expect(service.handleWebhook).toHaveBeenCalledWith(invalidPayload);
    });

    it('должен обрабатывать разные типы событий', async () => {
      const conversationPayload: WebhookPayloadDto = {
        eventId: '550e8400-e29b-41d4-a716-446655440001',
        eventType: 'conversation_start',
        timestamp: '2024-01-15T10:35:00.000Z',
        data: {
          conversationId: 'conv123',
          userId: 'user456',
        },
      };

      const expectedResponse = {
        status: 'success',
        message: 'Webhook успешно обработан',
        eventId: conversationPayload.eventId,
        processedAt: new Date().toISOString(),
      };

      mockWebhookService.handleWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.handleWebhook(conversationPayload);

      expect(result).toEqual(expectedResponse);
      expect(service.handleWebhook).toHaveBeenCalledWith(conversationPayload);
    });

    it('должен обрабатывать подпись webhook (если предоставлена)', async () => {
      const payloadWithSignature: WebhookPayloadDto = {
        ...validPayload,
        signature: 'sha256=abc123def456',
      };

      const expectedResponse = {
        status: 'success',
        message: 'Webhook успешно обработан',
        eventId: payloadWithSignature.eventId,
        processedAt: new Date().toISOString(),
      };

      mockWebhookService.handleWebhook.mockResolvedValue(expectedResponse);

      const result = await controller.handleWebhook(payloadWithSignature);

      expect(result).toEqual(expectedResponse);
      expect(service.handleWebhook).toHaveBeenCalledWith(payloadWithSignature);
    });
  });
});
