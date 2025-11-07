import { Test, TestingModule } from '@nestjs/testing';
import { AskiiApiController } from './askii-api.controller';
import { AskiiApiService } from './askii-api.service';
import { SendMessageDto } from './dto/send-message.dto';

describe('AskiiApiController', () => {
  let controller: AskiiApiController;
  let askiiApiService: AskiiApiService;

  const mockAskiiApiService = {
    sendMessage: jest.fn().mockResolvedValue({
      status: 'success',
      messageId: 789,
      content: 'Тестовое сообщение отправлено',
      timestamp: new Date().toISOString(),
    }),
    sendSimpleMessage: jest.fn().mockResolvedValue({
      status: 'success',
      messageId: 790,
      content: 'Простое сообщение отправлено',
      timestamp: new Date().toISOString(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AskiiApiController],
      providers: [
        {
          provide: AskiiApiService,
          useValue: mockAskiiApiService,
        },
      ],
    }).compile();

    controller = module.get<AskiiApiController>(AskiiApiController);
    askiiApiService = module.get<AskiiApiService>(AskiiApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен быть определен', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    const validMessage: SendMessageDto = {
      conversationId: 123,
      contactId: 456,
      content: 'Тестовое сообщение',
      messageType: 'outgoing',
    };

    it('должен успешно отправить сообщение', async () => {
      const result = await controller.sendMessage(validMessage);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.messageId).toBe(789);
      expect(mockAskiiApiService.sendMessage).toHaveBeenCalledWith(
        validMessage,
      );
    });

    it('должен возвращать корректные метаданные', async () => {
      const result = await controller.sendMessage(validMessage);

      expect(result.messageId).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('должен вызывать AskiiApiService с правильными параметрами', async () => {
      await controller.sendMessage(validMessage);

      expect(mockAskiiApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockAskiiApiService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 123,
          contactId: 456,
          content: 'Тестовое сообщение',
        }),
      );
    });

    it('должен обрабатывать сообщения без messageType', async () => {
      const messageWithoutType = {
        conversationId: 123,
        contactId: 456,
        content: 'Сообщение без типа',
      };

      const result = await controller.sendMessage(
        messageWithoutType as SendMessageDto,
      );

      expect(result).toBeDefined();
      expect(mockAskiiApiService.sendMessage).toHaveBeenCalledWith(
        messageWithoutType,
      );
    });

    it('должен прокидывать ошибки от сервиса', async () => {
      mockAskiiApiService.sendMessage.mockRejectedValueOnce(
        new Error('API Service error'),
      );

      await expect(controller.sendMessage(validMessage)).rejects.toThrow(
        'API Service error',
      );
    });
  });
});
