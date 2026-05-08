# HiENG

Приложение для изучения английских слов с тестами и отслеживанием прогресса.

## 🚀 Деплой на GitHub Pages

### 1. Создайте репозиторий на GitHub

Зайдите на [github.com](https://github.com) и создайте новый публичный репозиторий с именем **HiENG**.

### 2. Привяжите локальный репозиторий

Выполните в терминале (замените `YOUR_GITHUB_USERNAME` на ваш ник):

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/HiENG.git
git branch -M main
git push -u origin main
```

### 3. Включите GitHub Pages

1. Откройте репозиторий на GitHub → **Settings** → **Pages**
2. В разделе **Build and deployment** → **Source** выберите **GitHub Actions**

### 4. Добавьте переменные в GitHub Actions

В репозитории: **Settings** → **Secrets and variables** → **Actions** → вкладка **Variables** → **New repository variable**



### 5. Настройте GitHub OAuth App

1. Перейдите в [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните поля:
   - **Application name**: `HiENG`
   - **Homepage URL**: `https://YOUR_GITHUB_USERNAME.github.io/HiENG`
   - **Authorization callback URL**: `https://vfheiilnactmuzipybfs.supabase.co/auth/v1/callback`
4. Нажмите **Register application**
5. Скопируйте **Client ID** и сгенерируйте **Client Secret**

### 6. Настройте GitHub Provider в Supabase

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект → **Authentication** → **Providers** → **GitHub**
2. Включите провайдер (переключатель **Enable Sign in with GitHub**)
3. Вставьте **Client ID** и **Client Secret** из шага 5
4. В **Redirect URL** добавьте: `https://YOUR_GITHUB_USERNAME.github.io/HiENG/auth/callback`
5. Нажмите **Save**

### 7. Готово! 🎉

После push в main ветку GitHub Actions автоматически соберёт и опубликует сайт.

URL вашего сайта: `https://YOUR_GITHUB_USERNAME.github.io/HiENG`

## 🛠 Локальная разработка

```bash
pnpm install
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## 📁 Структура проекта

- `app/` — страницы Next.js App Router
- `components/` — React компоненты
- `lib/` — утилиты, Supabase клиент, контекст авторизации
- `.github/workflows/deploy.yml` — CI/CD для GitHub Pages
