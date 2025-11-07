import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включение CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Глобальная валидация данных
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, не описанные в DTO
      transform: true, // Автоматически преобразует типы
      forbidNonWhitelisted: true, // Выбрасывает ошибку при неизвестных свойствах
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('Journal Assistant Bot API')
    .setDescription(
      'API документация для интеллектуального бота научного журнала с интеграцией СпросиИИ',
    )
    .setVersion('1.0.0')
    .addTag('webhook', 'Webhook endpoints для приема событий от СпросиИИ')
    .addTag('health', 'Проверка состояния сервиса')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Введите JWT токен для авторизации',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Journal Assistant API - Документация',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Journal Assistant Bot успешно запущен! 🚀   ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`📡 Сервер:          http://localhost:${port}`);
  console.log(`📚 Документация:    http://localhost:${port}/api/docs`);
  console.log(`🔍 Health Check:    http://localhost:${port}/health`);
  console.log(`🌍 Окружение:       ${process.env.NODE_ENV || 'development'}`);
  console.log('\n════════════════════════════════════════════════\n');
}

bootstrap();