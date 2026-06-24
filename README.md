# ELI — интернет-магазин

## Структура

| Папка   | Описание                                      |
|---------|-----------------------------------------------|
| `be/`   | Бэкенд (TypeScript, Express, Prisma, MinIO)   |
| `admin/`| Админ-панель (React + TypeScript + Vite)      |
| `fe/`   | Витрина магазина (пока не используется)       |

Общий файл конфигурации: `.env` в корне проекта (шаблон — `.env.example`).

## Быстрый старт

### 1. Окружение

```bash
cp .env.example .env
```

Заполните в `.env` логин/пароль админки, токены Точка Банк, Telegram и MAX.

### 2. Инфраструктура (PostgreSQL + MinIO)

```bash
docker compose up -d
```

### 3. Бэкенд

```bash
cd be
npm install
npm run db:push
npm run dev
```

API: http://localhost:3000

### 4. Админ-панель

```bash
cd admin
npm install
npm run dev
```

Админка: http://localhost:5173

## API

### Публичные

- `GET /api/products` — список товаров
- `GET /api/products/:id` — товар
- `POST /api/orders` — создать заказ и получить ссылку на оплату
- `GET /api/orders/:id` — заказ
- `POST /api/webhooks/tochka` — вебхук Точка Банк

### Админ (Bearer token)

- `POST /api/auth/login` — вход
- `POST/PUT/DELETE /api/products` — управление товарами
- `POST /api/products/:id/images` — загрузка картинок в MinIO

## Оплата (Точка Банк)

1. Клиент отправляет `POST /api/orders` с корзиной.
2. Бэкенд создаёт платёжную ссылку через API Точка Банк.
3. После успешной оплаты вебхук `acquiringInternetPayment` уменьшает остатки.
4. Если остаток = 0, товар автоматически помечается «Нет в наличии».

## Уведомления

- **Telegram** — новый заказ и оплата (если заданы `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`).
- **MAX** — то же для мессенджера MAX (`MAX_BOT_TOKEN`, `MAX_CHAT_ID`).

## Админ-панель

- Список товаров с фото, ценой, количеством и статусом наличия
- Создание/редактирование: название, описание, цена, количество
- Переключатель «В наличии» / «Нет в наличии»
- Загрузка и удаление изображений (MinIO)
