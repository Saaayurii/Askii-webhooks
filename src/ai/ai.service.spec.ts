import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { AiRequestDto, ChatMessageDto } from './dto/ai-request.dto';

describe('AiService', () => {
  let service: AiService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        ASKII_API_URL: 'http://localhost:11434',
        ASKII_API_KEY: 'test-key',
        OPENAI_GPT_MODEL: 'qwen2.5:3b',
        MAX_TOKENS: 1000,
        TEMPERATURE: 0.7,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('generateResponse', () => {
    const validRequest: AiRequestDto = {
      userMessage: 'Как опубликовать статью в научном журнале?',
      userId: 'user123',
    };

    it('должен успешно генерировать ответ для простого запроса', async () => {
      const response = await service.generateResponse(validRequest);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
      expect(typeof response.response).toBe('string');
      expect(response.response.length).toBeGreaterThan(0);
    });

    it('должен возвращать корректные метаданные', async () => {
      const response = await service.generateResponse(validRequest);

      expect(response.model).toBeDefined();
      expect(response.timestamp).toBeDefined();
      expect(response.totalTokens).toBeGreaterThanOrEqual(0);
      expect(response.promptTokens).toBeGreaterThanOrEqual(0);
      expect(response.completionTokens).toBeGreaterThanOrEqual(0);
    });

    it('должен обрабатывать запросы с историей разговора', async () => {
      const conversationHistory: ChatMessageDto[] = [
        {
          role: 'user',
          content: 'Что такое peer review?',
        },
        {
          role: 'assistant',
          content:
            'Peer review - это процесс рецензирования научных работ экспертами...',
        },
      ];

      const requestWithHistory: AiRequestDto = {
        ...validRequest,
        conversationHistory,
      };

      const response = await service.generateResponse(requestWithHistory);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });

    it('должен использовать системный промпт для научного журнала', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.generateResponse(validRequest);

      expect(logSpy).toHaveBeenCalled();
    });

    it('должен выбросить ошибку при пустом сообщении', async () => {
      const invalidRequest: AiRequestDto = {
        userMessage: '',
        userId: 'user123',
      };

      await expect(service.generateResponse(invalidRequest)).rejects.toThrow();
    });

    it('должен логировать информацию о запросе', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.generateResponse(validRequest);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Генерация ответа'),
      );
    });

    it('должен обрабатывать длинные сообщения', async () => {
      const longMessage = 'Как опубликовать статью? '.repeat(50);
      const longRequest: AiRequestDto = {
        userMessage: longMessage,
        userId: 'user123',
      };

      const response = await service.generateResponse(longRequest);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });

    it('должен работать без userId', async () => {
      const requestWithoutUser: AiRequestDto = {
        userMessage: 'Как опубликовать статью?',
      };

      const response = await service.generateResponse(requestWithoutUser);

      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
    });
  });

  describe('buildMessages', () => {
    it('должен создавать корректный массив сообщений', () => {
      const userMessage = 'Тестовый вопрос';
      const messages = service['buildMessages'](userMessage);

      expect(messages).toBeDefined();
      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(messages[0].role).toBe('system');
      expect(messages[messages.length - 1].role).toBe('user');
      expect(messages[messages.length - 1].content).toBe(userMessage);
    });

    it('должен включать историю разговора', () => {
      const userMessage = 'Новый вопрос';
      const history: ChatMessageDto[] = [
        { role: 'user', content: 'Первый вопрос' },
        { role: 'assistant', content: 'Первый ответ' },
      ];

      const messages = service['buildMessages'](userMessage, history);

      expect(messages.length).toBeGreaterThan(3);
      expect(messages).toContainEqual(history[0]);
      expect(messages).toContainEqual(history[1]);
    });
  });
});
