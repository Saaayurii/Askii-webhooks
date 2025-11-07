# Git Flow - Руководство по работе

## 📋 Структура веток

```
main        → Продакшн-готовый код (стабильные релизы)
develop     → Активная разработка (текущая рабочая ветка)
feature/*   → Новые функции
bugfix/*    → Исправления багов
release/*   → Подготовка к релизу
hotfix/*    → Срочные исправления в production
```

## 🔄 Настроенные репозитории

Код автоматически пушится в два репозитория:

- **GitHub**: https://github.com/Saaayurii/Askii-webhooks
- **Gitea**: http://gitea.guiaidn.ru/Relmontov/Askii-webhooks

## 🚀 Рабочий процесс

### 1. Начало работы над новой функцией

```bash
# Убедитесь, что вы на develop
git checkout develop

# Обновите develop
git pull origin develop

# Создайте feature ветку
git checkout -b feature/webhook-integration

# Или для исправления бага
git checkout -b bugfix/fix-validation-error
```

### 2. Разработка (TDD подход)

```bash
# 1. Сначала пишем тесты
npm run test:watch

# 2. Коммитим тесты
git add .
git commit -m "test: add webhook validation tests"

# 3. Пишем код для прохождения тестов
# ...код...

# 4. Коммитим реализацию
git commit -m "feat: implement webhook validation"

# 5. Рефакторинг (если нужно)
git commit -m "refactor: optimize webhook validation"
```

### 3. Завершение feature/bugfix

```bash
# Переключаемся на develop
git checkout develop

# Обновляем develop
git pull origin develop

# Вливаем вашу ветку
git merge feature/webhook-integration

# Пушим в оба репозитория
git push origin develop

# Удаляем локальную feature ветку (опционально)
git branch -d feature/webhook-integration
```

### 4. Создание релиза

```bash
# Создаем release ветку из develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Финальные правки для релиза
# - Обновление версии в package.json
# - Обновление CHANGELOG.md
# - Финальное тестирование

npm version 1.0.0
git add .
git commit -m "chore: bump version to 1.0.0"

# Вливаем в main
git checkout main
git pull origin main
git merge release/v1.0.0

# Создаем тег
git tag -a v1.0.0 -m "Release version 1.0.0"

# Пушим main с тегами
git push origin main --tags

# Вливаем обратно в develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Удаляем release ветку
git branch -d release/v1.0.0
```

### 5. Hotfix (срочное исправление в production)

```bash
# Создаем hotfix из main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Исправляем проблему
# ...код...

git add .
git commit -m "fix: critical security vulnerability (CVE-2024-XXXX)"

# Вливаем в main
git checkout main
git merge hotfix/critical-security-fix

# Обновляем версию (patch)
npm version patch
git push origin main --tags

# Вливаем в develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# Удаляем hotfix ветку
git branch -d hotfix/critical-security-fix
```

## 📝 Правила коммитов (Conventional Commits)

Используем следующий формат:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы коммитов:

- **feat**: Новая функция
- **fix**: Исправление бага
- **docs**: Изменения в документации
- **style**: Форматирование кода (не влияет на логику)
- **refactor**: Рефакторинг кода
- **test**: Добавление или изменение тестов
- **chore**: Обновление зависимостей, конфигурации и т.д.
- **perf**: Улучшение производительности
- **ci**: Изменения в CI/CD

### Примеры:

```bash
# Новая функция
git commit -m "feat(webhook): add СпросиИИ webhook endpoint"

# Исправление бага
git commit -m "fix(validation): correct email validation regex"

# Документация
git commit -m "docs(readme): update API documentation"

# Тесты
git commit -m "test(webhook): add integration tests for webhook handler"

# Рефакторинг
git commit -m "refactor(ai): extract AI service logic to separate module"
```

## 🔧 Полезные команды

```bash
# Проверить текущую ветку и статус
git status

# Посмотреть все ветки
git branch -a

# Посмотреть историю коммитов
git log --oneline --graph --all

# Посмотреть изменения перед коммитом
git diff

# Отменить изменения в файле
git checkout -- <file>

# Отменить последний коммит (НЕ пушайте после этого!)
git reset --soft HEAD~1

# Посмотреть настройки remote
git remote -v

# Синхронизировать с удаленным репозиторием
git fetch origin

# Обновить текущую ветку
git pull origin <branch-name>
```

## ⚠️ Важные правила

1. **НИКОГДА** не коммитьте напрямую в `main`
2. **ВСЕГДА** работайте через `develop`
3. **НЕ ПУШЬТЕ** код без прохождения тестов
4. **ПРОВЕРЯЙТЕ** покрытие кода (минимум 80%)
5. **ИСПОЛЬЗУЙТЕ** осмысленные имена веток и коммитов
6. **НЕ ХРАНИТЕ** секреты и `.env` файлы в Git
7. **РЕВЬЮЙТЕ** код перед мержем (если работаете в команде)

## 🎯 Текущая ветка по умолчанию

Для разработки используйте `develop`:

```bash
# Всегда начинайте с develop
git checkout develop
git pull origin develop
```

## 🔄 Синхронизация с обоими репозиториями

При пуше код автоматически отправляется в оба репозитория:

```bash
# Обычный push
git push origin develop

# Push с тегами
git push origin main --tags

# Принудительный push (ОПАСНО! Используйте осторожно)
git push origin develop --force
```

## 📚 Дополнительные ресурсы

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

---

**Следуйте этим правилам для поддержания чистоты и порядка в репозитории!**
