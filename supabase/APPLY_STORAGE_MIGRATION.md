# Применение миграции Storage политик

## Проблема
Bucket `proposal-media` создан, но не имеет RLS политик для загрузки файлов.

## Решение
Нужно применить миграцию `011_storage_policies.sql` которая добавляет необходимые политики.

## Способ 1: Через Supabase Dashboard (Рекомендуется)

1. Откройте Supabase Dashboard: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в SQL Editor
4. Скопируйте содержимое файла `supabase/migrations/011_storage_policies.sql`
5. Вставьте в SQL Editor и выполните

## Способ 2: Через psql (если есть доступ)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.qcxfgmmqnkjmeleupely.supabase.co:5432/postgres" -f supabase/migrations/011_storage_policies.sql
```

## Способ 3: Через Supabase CLI (если установлен)

```bash
supabase db push
```

## Проверка

После применения миграции проверьте в Supabase Dashboard:
1. Storage → Policies
2. Должны появиться 4 политики для bucket `proposal-media`:
   - Authenticated users can upload to proposal-media
   - Authenticated users can update proposal-media
   - Authenticated users can delete from proposal-media
   - Public read access to proposal-media

## Тестирование

После применения миграции:
1. Откройте страницу брендинга: `/workspace/[workspaceId]/settings/brand`
2. Попробуйте загрузить логотип
3. Проверьте консоль браузера на наличие ошибок
4. Логотип должен успешно загрузиться и отобразиться в превью
