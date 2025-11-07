import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AskiiApiService } from './askii-api.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SendMessageResponseDto } from './dto/send-message-response.dto';

/**
 * Контроллер для работы с API СпросиИИ
 * Предоставляет endpoints для отправки сообщений
 */
@ApiTags('askii-api')
@Controller('askii-api')
export class AskiiApiController {
  constructor(private readonly askiiApiService: AskiiApiService) {}

  /**
   * Отправляет сообщение в разговор через API СпросиИИ
   * @param message Данные сообщения для отправки
   * @returns Результат отправки
   */
  @Post('send-message')
  @ApiOperation({
    summary: 'Отправка сообщения в СпросиИИ',
    description:
      'Отправляет сообщение в указанный разговор через API СпросиИИ. Используется для тестирования и отладки.',
  })
  @ApiResponse({
    status: 201,
    description: 'Сообщение успешно отправлено',
    type: SendMessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 401,
    description: 'Ошибка авторизации в API СпросиИИ',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка при отправке сообщения',
  })
  async sendMessage(
    @Body() message: SendMessageDto,
  ): Promise<SendMessageResponseDto> {
    return await this.askiiApiService.sendMessage(message);
  }
}
