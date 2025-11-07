# ========================================
# Этап 1: Сборка приложения (Builder)
# ========================================
FROM node:20-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production && \
    npm cache clean --force

# Копирование исходного кода
COPY . .

# Сборка приложения
RUN npm run build

# ========================================
# Этап 2: Production образ
# ========================================
FROM node:20-alpine

# Метаданные образа
LABEL maintainer="Roman"
LABEL description="Journal Assistant Bot - Webhook бот для СпросиИИ"
LABEL version="1.0.0"

# Установка рабочей директории
WORKDIR /app

# Создание непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Копирование зависимостей из builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Копирование собранного приложения
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Создание директории для логов
RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app/logs

# Переключение на непривилегированного пользователя
USER nestjs

# Открытие порта
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "dist/main"]
