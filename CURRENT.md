# Proposal Generator - Текущее состояние проекта

## Обзор
Приложение для создания и управления коммерческими предложениями с поддержкой воркспейсов, кейсов и FAQ.

## Реализованные функции

### 1. Аутентификация и пользователи
- ✅ Регистрация и вход через Supabase Auth
- ✅ Автоматическое создание профиля при регистрации (триггер)
- ✅ Middleware для защиты маршрутов
- ✅ Валидация UUID в middleware (исключение `/workspace/new`)

### 2. Воркспейсы (Workspaces)
- ✅ Создание воркспейсов
- ✅ Автоматическое добавление создателя как owner (триггер)
- ✅ Управление членами воркспейса
- ✅ Приглашения по email
- ✅ Роли: owner, member
- ✅ Dashboard воркспейса с статистикой
- ✅ Настройки воркспейса

**Исправленные проблемы:**
- Бесконечная рекурсия в RLS политиках (использование `SECURITY DEFINER` функций)
- Проблемы с видимостью членов воркспейса
- Триггеры с правильными правами доступа

### 3. Кейсы (Case Studies)
- ✅ CRUD операции для кейсов
- ✅ Поля: title, description, technologies, results, links
- ✅ Загрузка изображений в Supabase Storage
- ✅ Storage bucket `case-images` с RLS политиками
- ✅ Поддержка нескольких изображений на кейс
- ✅ Различные типы ссылок (website, github, app stores, demo)
- ✅ Карточки кейсов с превью
- ✅ Редактор кейсов с валидацией
- ✅ Страница списка кейсов

**Конфигурация:**
- Next.js настроен для загрузки изображений с `*.supabase.co`

### 4. FAQ Library
- ✅ CRUD операции для FAQ items
- ✅ Поля: question, answer, category, order_index
- ✅ Фильтрация по категориям
- ✅ Карточки FAQ с возможностью редактирования
- ✅ Модальное окно для создания/редактирования
- ✅ Страница библиотеки FAQ
- ✅ Интеграция в навигацию

### 5. UI Компоненты
Созданные компоненты из shadcn/ui:
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Label
- ✅ Dialog
- ✅ Textarea
- ✅ Select
- ✅ Popover
- ✅ Badge

### 6. Навигация
- ✅ Header с навигацией по воркспейсу
- ✅ Активные ссылки (Dashboard, Proposals, Cases, FAQ)
- ✅ Breadcrumbs
- ✅ Иконки для каждого раздела

### 7. База данных

**Таблицы:**
- `profiles` - профили пользователей
- `workspaces` - воркспейсы
- `workspace_members` - члены воркспейсов
- `invitations` - приглашения
- `cases` - кейсы
- `faq_items` - FAQ элементы
- `proposals` - предложения (структура готова)
- `proposal_sections` - секции предложений
- `templates` - шаблоны
- `comments` - комментарии
- `presence` - присутствие пользователей

**Storage:**
- `case-images` - публичный bucket для изображений кейсов

**Функции и триггеры:**
- `update_updated_at_column()` - автообновление timestamp
- `create_workspace_owner_membership()` - автодобавление owner в members
- `create_user_profile()` - автосоздание профиля при регистрации
- `is_workspace_member()` - проверка членства (для RLS)
- `get_user_workspace_ids()` - получение воркспейсов пользователя (для RLS)

**RLS Политики:**
- Все таблицы защищены Row Level Security
- Политики используют `SECURITY DEFINER` функции для избежания рекурсии
- Workspace-based доступ для всех ресурсов

### 8. Миграции
Выполненные миграции:
1. `001_initial_schema.sql` - базовая схема
2. `002_indexes.sql` - индексы
3. `003_rls_policies.sql` - RLS политики
4. `005_functions_and_triggers.sql` - функции и триггеры
5. `007_storage_setup.sql` - Storage bucket для изображений
6. `008_faq_items.sql` - таблица FAQ

Исправления:
- `fix_rls_recursion_final.sql` - исправление рекурсии в RLS
- `fix_members_visibility_v2.sql` - видимость членов воркспейса
- `fix_workspace_recursion.sql` - рекурсия между workspaces и workspace_members

## Архитектура

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Validation:** Zod

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js Server Actions

### Структура проекта
```
src/
├── app/
│   ├── actions/          # Server actions
│   │   ├── auth.ts
│   │   ├── cases.ts
│   │   ├── faq.ts
│   │   └── workspace.ts
│   ├── auth/             # Страницы аутентификации
│   └── workspace/        # Страницы воркспейсов
│       └── [workspaceId]/
│           ├── cases/
│           ├── faq/
│           ├── proposals/
│           └── settings/
├── components/
│   ├── cases/            # Компоненты кейсов
│   ├── faq/              # Компоненты FAQ
│   ├── layout/           # Layout компоненты
│   └── ui/               # UI компоненты
├── lib/
│   ├── supabase/         # Supabase клиенты
│   ├── validations/      # Zod схемы
│   └── utils.ts
└── types/
    ├── database.ts       # TypeScript типы
    └── errors.ts         # Типы ошибок

supabase/
└── migrations/           # SQL миграции
```

## Что НЕ реализовано

### 1. Proposals (Предложения)
- Создание и редактирование предложений
- Rich text редактор для секций
- Выбор кейсов для предложения
- Выбор FAQ для предложения
- Timeline и milestones
- Team estimates
- Payment schedule
- Loom video integration
- Публичные ссылки для просмотра

### 2. Templates (Шаблоны)
- Создание шаблонов из предложений
- Применение шаблонов к новым предложениям

### 3. Collaboration
- Real-time редактирование
- Комментарии к секциям
- Presence (кто сейчас смотрит)
- Уведомления

### 4. Export/Share
- PDF экспорт
- Публичные ссылки с брендингом
- Email отправка предложений

## Известные проблемы

### Решённые
- ✅ Бесконечная рекурсия в RLS политиках
- ✅ Проблемы с созданием воркспейса
- ✅ Видимость членов воркспейса
- ✅ Загрузка изображений в кейсы
- ✅ Next.js Image hostname configuration

### Текущие
- Нет автосохранения для форм
- Нет drag-and-drop для изображений
- Нет сортировки FAQ items (order_index не используется в UI)

## Следующие шаги

### Приоритет 1: Proposals
1. Создать страницу списка предложений
2. Реализовать создание предложения
3. Добавить rich text редактор (Tiptap)
4. Реализовать выбор кейсов и FAQ
5. Добавить timeline и team estimates

### Приоритет 2: Улучшения UX
1. Автосохранение форм
2. Drag-and-drop для изображений
3. Сортировка FAQ items
4. Поиск по кейсам и FAQ
5. Bulk операции

### Приоритет 3: Collaboration
1. Real-time updates
2. Комментарии
3. Presence indicators
4. Уведомления

## Технические детали

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Запуск проекта
```bash
npm install
npm run dev
```

### Применение миграций
Миграции применяются через Supabase Dashboard → SQL Editor

### Тестирование
- Unit тесты: не настроены
- E2E тесты: не настроены

## Контакты и документация
- Supabase Dashboard: [ваш проект]
- Schema документация: `supabase/SCHEMA.md`
- Спецификация: `.kiro/specs/proposal-generator/`
