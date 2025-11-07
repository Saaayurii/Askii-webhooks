import { Test, TestingModule } from '@nestjs/testing';
import { AskiiApiService } from './askii-api.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { SendMessageDto } from './dto/send-message.dto';

describe('AskiiApiService', () => {
  let service: AskiiApiService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        ASKII_API_URL: 'https://api.askii.test',
        ASKII_API_TOKEN: 'test-token-123',
        ASKII_ACCOUNT_ID: '1',
      };
      return config[key];
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AskiiApiService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AskiiApiService>(AskiiApiService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    const validMessageDto: SendMessageDto = {
      conversationId: 123,
      contactId: 456,
      content: 'Тестовое сообщение',
      messageType: 'outgoing',
    };

    it('должен успешно отправить сообщение', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          id: 789,
          content: 'Тестовое сообщение',
          message_type: 'outgoing',
          created_at: '2024-01-15T10:30:00.000Z',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.sendMessage(validMessageDto);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.messageId).toBe(789);
      expect(result.content).toBe('Тестовое сообщение');
      expect(mockHttpService.post).toHaveBeenCalledTimes(1);
    });

    it('должен использовать правильный URL и headers', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 789 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.sendMessage(validMessageDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/accounts/1/conversations/123/messages'),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'api_access_token': 'test-token-123',
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('должен передавать правильные данные в запросе', async () => {
      const mockResponse: AxiosResponse = {
        data: { id: 789 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.sendMessage(validMessageDto);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          content: 'Тестовое сообщение',
          message_type: 'outgoing',
          private: false,
        }),
        expect.any(Object),
      );
    });

    it('должен обрабатывать ошибки сети', async () => {
      const networkError = new Error('Network error');
      mockHttpService.post.mockReturnValue(throwError(() => networkError));

      await expect(service.sendMessage(validMessageDto)).rejects.toThrow();
    });

    it('должен обрабатывать ошибки API', async () => {
      const apiError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      mockHttpService.post.mockReturnValue(throwError(() => apiError));

      await expect(service.sendMessage(validMessageDto)).rejects.toThrow();
    });

    it('должен логировать отправку сообщения', async () => {
      const logSpy = jest.spyOn(service['logger'], 'log');

      const mockResponse: AxiosResponse = {
        data: { id: 789 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await service.sendMessage(validMessageDto);

      expect(logSpy).toHaveBeenCalled();
    });
  });
});
