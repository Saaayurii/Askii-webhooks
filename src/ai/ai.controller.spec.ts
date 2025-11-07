import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRequestDto } from './dto/ai-request.dto';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

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
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('generateResponse', () => {
    const validRequest: AiRequestDto = {
      userMessage: 'Как опубликовать статью?',
      userId: 'user123',
      conversationHistory: [],
    };

    it('должен успешно генерировать ответ', async () => {
      const result = await controller.generateResponse(validRequest);

      expect(result).toBeDefined();
      expect(result.response).toBe('Тестовый ответ от AI');
      expect(result.model).toBe('qwen2.5:3b');
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(
        validRequest,
      );
    });

    it('должен возвращать корректные метаданные', async () => {
      const result = await controller.generateResponse(validRequest);

      expect(result.promptTokens).toBeDefined();
      expect(result.completionTokens).toBeDefined();
      expect(result.totalTokens).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('должен вызывать AiService с правильными параметрами', async () => {
      await controller.generateResponse(validRequest);

      expect(mockAiService.generateResponse).toHaveBeenCalledTimes(1);
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Как опубликовать статью?',
          userId: 'user123',
        }),
      );
    });

    it('должен обрабатывать запросы с историей разговора', async () => {
      const requestWithHistory: AiRequestDto = {
        ...validRequest,
        conversationHistory: [
          { role: 'user', content: 'Привет' },
          { role: 'assistant', content: 'Здравствуйте!' },
        ],
      };

      const result = await controller.generateResponse(requestWithHistory);

      expect(result).toBeDefined();
      expect(mockAiService.generateResponse).toHaveBeenCalledWith(
        requestWithHistory,
      );
    });

    it('должен прокидывать ошибки от сервиса', async () => {
      mockAiService.generateResponse.mockRejectedValueOnce(
        new Error('AI Service error'),
      );

      await expect(controller.generateResponse(validRequest)).rejects.toThrow(
        'AI Service error',
      );
    });
  });
});
