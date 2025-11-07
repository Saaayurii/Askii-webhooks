import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Глобальный фильтр для обработки всех HTTP исключений
 * Обеспечивает единообразный формат ответов при ошибках
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /**
   * Обрабатывает HTTP исключение и формирует ответ
   * @param exception Исключение
   * @param host Контекст запроса
   */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Извлекаем сообщение из разных форматов ответа
    let message: string | string[] = exception.message;
    let error: string = HttpStatus[status];

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;
      error = responseObj.error || error;
    }

    // Формируем детальный ответ об ошибке
    const errorResponse = {
      statusCode: status,
      message: message,
      error: error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Логируем ошибку для мониторинга
    this.logger.error(
      `HTTP ${status} Error: ${JSON.stringify(errorResponse)}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}
