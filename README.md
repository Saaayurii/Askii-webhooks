# 📚 Journal Assistant Bot

> Интеллектуальный webhook-бот для интеграции с СпросиИИ, специализирующийся на поддержке научного журнала.

## 🎯 Описание проекта

Journal Assistant Bot — это микросервис на базе NestJS, который обрабатывает webhook'и от СпросиИИ, использует AI-возможности СпросиИИ для генерации умных ответов в контексте научного журнала и автоматически отправляет их обратно в чат.

## ✨ Основные возможности

- 🔗 Полная интеграция с СпросиИИ через webhook'и
- 🤖 AI-powered ответы через СпросиИИ API
- 📖 Специализированные знания для научных журналов
- 🐳 Docker поддержка для быстрого развертывания
- 📝 Swagger документация API
- ✅ TDD подход с полным покрытием тестами
- 🌿 Git Flow workflow
- 🔒 Валидация данных и обработка ошибок

## 🛠 Технологический стек

- **Framework:** NestJS 11+
- **Language:** TypeScript 5+
- **Testing:** Jest + Supertest (TDD)
- **API Documentation:** Swagger/OpenAPI
- **Containerization:** Docker & Docker Compose
- **Validation:** class-validator, class-transformer
- **HTTP Client:** Axios
- **Workflow:** Git Flow

## 📋 Требования

Перед началом работы убедитесь, что у вас установлено:

- Node.js 20+ и npm
- Docker и Docker Compose
- Git

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
# Переход в директорию проекта
cd journal-assistant

# Установка зависимостей
npm install

# Копирование файла окружения
cp .env.example .env
```

### 2. Настройка окружения

Отредактируйте файл `.env` и укажите ваши данные:

```env
# Приложение
NODE_ENV=development
PORT=3000

# СпросиИИ API
ASKII_API_URL=https://api.sprosi.ai
ASKII_API_KEY=your_api_key

# Настройки бота
BOT_NAME=Научный Журнал Ассистент
BOT_LANGUAGE=ru
```

### 3. Запуск приложения

#### Локальная разработка

```bash
# Режим разработки с hot-reload
npm run start:dev

# Обычный запуск
npm run start

# Production режим
npm run start:prod
```

#### Docker разработка

```bash
# Запуск dev-контейнера
docker-compose up journal-assistant-dev

# Запуск production-контейнера
docker-compose up journal-assistant

# Запуск в фоновом режиме
docker-compose up -d
```

## 📚 API Документация (Swagger)

После запуска приложения Swagger документация доступна по адресу:

```
http://localhost:3000/api/docs
```

Swagger предоставляет:
- 📖 Полную документацию всех endpoint'ов
- 🧪 Интерактивное тестирование API
- 📝 Схемы данных (DTO)
- 🔐 Настройки авторизации

### Основные endpoint'ы

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/webhook/askii` | Прием webhook'ов от СпросиИИ |
| GET | `/health` | Health check приложения |
| GET | `/api/docs` | Swagger документация |

## 🧪 Тестирование (TDD подход)

Проект следует TDD методологии. Сначала пишутся тесты, затем реализация.

```bash
# Запуск всех unit-тестов
npm run test

# Запуск e2e-тестов
npm run test:e2e

# Запуск тестов в watch режиме (для TDD)
npm run test:watch

# Генерация отчета о покрытии
npm run test:cov

# Запуск тестов в debug режиме
npm run test:debug
```

### Требования к покрытию

- Минимальное покрытие: **80%**
- Все новые фичи должны иметь тесты
- E2E тесты для критичных сценариев

## 📁 Структура проекта

```
journal-assistant/
├── src/
│   ├── webhook/              # Модуль Webhook
│   │   ├── controllers/      # HTTP контроллеры
│   │   ├── services/         # Бизнес-логика
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── interfaces/      # TypeScript интерфейсы
│   │   └── webhook.module.ts
│   ├── ai/                  # Модуль AI (СпросиИИ)
│   │   ├── services/
│   │   └── ai.module.ts
│   ├── common/              # Общие компоненты
│   │   ├── filters/        # Exception фильтры
│   │   ├── interceptors/   # Interceptors
│   │   ├── guards/         # Guards
│   │   └── decorators/     # Кастомные декораторы
│   ├── config/             # Конфигурация
│   ├── app.module.ts       # Корневой модуль
│   └── main.ts             # Точка входа
├── test/                   # E2E тесты
├── docker-compose.yml      # Docker Compose конфигурация
├── Dockerfile             # Production Dockerfile
├── Dockerfile.dev         # Development Dockerfile
└── README.md
```

## 🌿 Git Flow Workflow

Проект использует Git Flow для управления ветками:

```bash
# Основные ветки
main        # Продакшн-готовый код
develop     # Разработка

# Вспомогательные ветки
feature/*   # Новые фичи
bugfix/*    # Исправление багов
release/*   # Подготовка релиза
hotfix/*    # Срочные исправления
```

### Процесс разработки

```bash
# 1. Начало работы над новой фичей
git checkout develop
git pull origin develop
git checkout -b feature/webhook-integration

# 2. Разработка (TDD: тест -> код -> рефакторинг)
git add .
git commit -m "test: add webhook controller tests"
git commit -m "feat: implement webhook controller"

# 3. Завершение фичи
git checkout develop
git merge feature/webhook-integration
git push origin develop

# 4. Подготовка релиза
git checkout -b release/v1.0.0
# ... финальные правки, обновление версии
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

## 🐳 Docker

### Development

```bash
# Сборка dev-образа
docker-compose build journal-assistant-dev

# Запуск с логами
docker-compose up journal-assistant-dev

# Остановка
docker-compose down
```

### Production

```bash
# Сборка production-образа
docker build -t journal-assistant:latest .

# Запуск контейнера
docker run -d \
  --name journal-assistant \
  -p 3000:3000 \
  --env-file .env \
  journal-assistant:latest

# Просмотр логов
docker logs -f journal-assistant
```

## 🔧 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run start` | Запуск приложения |
| `npm run start:dev` | Запуск в режиме разработки |
| `npm run start:prod` | Запуск production сборки |
| `npm run build` | Сборка проекта |
| `npm run test` | Запуск unit-тестов |
| `npm run test:e2e` | Запуск e2e-тестов |
| `npm run test:cov` | Покрытие тестами |
| `npm run test:watch` | Тесты в watch режиме |
| `npm run lint` | Проверка кода линтером |
| `npm run format` | Форматирование кода |

## 🔐 Безопасность

- ✅ Валидация всех входящих данных
- ✅ Защита от SQL-инъекций
- ✅ Защита от XSS
- ✅ Rate limiting (TODO)
- ✅ Helmet для безопасных HTTP заголовков (TODO)
- ✅ CORS настройки
- ✅ Секретные данные в .env (не в репозитории)

## ✅ Реализовано

### v0.2.0 - AI Integration (Current)
- ✅ **AI Module** с интеграцией LLM (Ollama/OpenAI-compatible API)
- ✅ **Системный промпт** для ассистента научного журнала
- ✅ **AI Service** с обработкой запросов и генерацией ответов
- ✅ **DTOs** для AI запросов и ответов с валидацией
- ✅ **Интеграция** Webhook → AI → Response
- ✅ **Конфигурация** для LLM (модель, temperature, max tokens)
- ✅ **Unit тесты** (23 passed, 80% coverage для webhook)

### v0.1.0 - Base Modules
- ✅ Health Check module с Swagger
- ✅ Webhook module для приема событий
- ✅ ConfigModule для переменных окружения
- ✅ Docker setup (Dockerfile, docker-compose.yml)
- ✅ Git Flow workflow
- ✅ TDD approach with Jest

## 📈 План развития

- [ ] Отправка ответов обратно через API СпросиИИ
- [ ] Контекстная память разговора (Redis/PostgreSQL)
- [ ] Rate limiting и кеширование
- [ ] Логирование (Winston)
- [ ] Мониторинг (Prometheus + Grafana)
- [ ] E2E тесты с реальным LLM
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment

## 🤝 Контрибуция

1. Создайте feature-ветку из `develop`
2. Следуйте TDD подходу
3. Убедитесь, что все тесты проходят
4. Проверьте покрытие кода (минимум 80%)
5. Следуйте coding standards (ESLint + Prettier)
6. Создайте Pull Request в `develop`

## 📝 Код-стайл

Проект использует:
- **ESLint** для проверки кода
- **Prettier** для форматирования
- **TypeScript strict mode**

```bash
# Проверка линтером
npm run lint

# Автоматическое форматирование
npm run format
```

## 📄 Лицензия

UNLICENSED - Private project

## 👥 Автор

**Roman**

## 🔗 Полезные ссылки

- [NestJS Documentation](https://docs.nestjs.com/)
- [СпросиИИ](https://sprosi.ai/)
- [Docker Documentation](https://docs.docker.com/)
- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте документацию
2. Посмотрите существующие issues
3. Создайте новый issue с подробным описанием проблемы

---

**Сделано с ❤️ для научного сообщества**
