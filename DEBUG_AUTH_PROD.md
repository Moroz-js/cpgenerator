# Отладка ошибки "fetch failed" в продакшене

## Ошибка
```
message: "fetch failed"
type: "authentication"
```

## Причины

### 1. Отсутствуют переменные окружения
Проверьте в настройках хостинга (Vercel/Netlify/etc):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Неправильный URL Supabase
URL должен быть в формате: `https://[project-id].supabase.co`

### 3. Проблемы с сетью
- Сервер не может достучаться до Supabase API
- Firewall блокирует запросы
- DNS проблемы

### 4. CORS проблемы
Проверьте в Supabase Dashboard → Authentication → URL Configuration:
- Site URL должен содержать ваш production домен
- Redirect URLs должны включать `https://yourdomain.com/auth/callback`

## Что проверить в логах

С добавленным логированием вы увидите:

### В консоли браузера:
```
=== LoginPage RENDER ===
Environment: {
  supabaseUrl: "https://xxx.supabase.co",
  hasAnonKey: true,
  siteUrl: "https://yourdomain.com"
}
```

### В логах сервера:
```
=== signIn SERVER ACTION START ===
Environment check: {
  NEXT_PUBLIC_SUPABASE_URL: "https://xxx.supabase.co",
  hasAnonKey: true,
  anonKeyLength: 200+
}
=== createClient (server) START ===
Supabase config: {
  url: "https://xxx.supabase.co",
  hasKey: true,
  keyLength: 200+,
  urlValid: true
}
```

## Решение

### Для Vercel:
1. Зайдите в Settings → Environment Variables
2. Добавьте переменные для Production:
   - `NEXT_PUBLIC_SUPABASE_URL` = ваш Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ваш anon key
3. Redeploy проект

### Для других платформ:
Убедитесь, что переменные окружения установлены и доступны в runtime.

### Проверка Supabase Dashboard:
1. Authentication → URL Configuration
2. Добавьте production URL в Site URL
3. Добавьте `https://yourdomain.com/auth/callback` в Redirect URLs

## Тестирование локально

Проверьте `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://qcxfgmmqnkjmeleupely.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Запустите:
```bash
npm run build
npm start
```

Проверьте логи в консоли - должны быть все environment variables.
