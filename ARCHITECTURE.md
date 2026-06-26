# Архитектура проекта «Ели» — Интернет-магазин живых ёлок

## 1. Обзор проекта

Платформа для розничной и оптовой продажи живых ёлок и сопутствующих товаров с B2B-порталом для привлечения арендодателей под ёлочные базары. Монолитное приложение с разделением на три пакета:

| Пакет          | Технологии                                   | Порт      |
|----------------|----------------------------------------------|-----------|
| `frontend/`    | React 18, TypeScript, Vite, TailwindCSS, Framer Motion | 5174 |
| `admin/`       | React 19, TypeScript, Vite                   | 5173      |
| `be/`          | Node.js, Express 5, Prisma, Zod              | 3000      |

**Инфраструктура:** PostgreSQL 16, MinIO (S3-совместимое хранилище), Docker Compose.

---

## 2. Технический стек и обоснование

| Компонент       | Выбор                         | Обоснование (best practice)                                                                     |
|-----------------|-------------------------------|-------------------------------------------------------------------------------------------------|
| Язык            | TypeScript (строгий режим)    | Типобезопасность на всех уровнях: API ↔ БД ↔ Фронтенд                                           |
| Фреймворк API   | Express 5                     | Лёгкий, стабильный, огромная экосистема. Express 5 — нативная поддержка async error handling    |
| ORM             | Prisma                        | Типогенерация из схемы БД, миграции, интуитивный query builder                                  |
| Валидация       | Zod                           | Тонкая схема-валидация на границе API, автоматический вывод TypeScript-типов                    |
| Фронтенд        | React 18 + Vite               | Быстрая сборка, HMR, tree-shaking                                                                                                              |
| Стили           | TailwindCSS 3                 | Utility-first, минимальный бандл через purge, быстрая итерация                                  |
| Анимации        | Framer Motion                 | Декларативные анимации для секций (параллакс, снег, появление)                                  |
| Хранилище файлов| MinIO                         | S3-совместимое, self-hosted, не зависит от облачных провайдеров                                  |
| Платежи         | Точка Банк API                | Интернет-эквайринг, платёжные ссылки, вебхуки                                                    |
| Уведомления     | Telegram Bot API + MAX        | Мгновенные алерты менеджерам в рабочий чат                                                       |
| Контейнеризация | Docker Compose                | Единое окружение для разработки, PostgreSQL + MinIO в изоляции                                   |
| CI/статика      | ESLint + tsc --noEmit         | Контроль качества кода на pre-commit                                                             |

### Выбор между монорепой и микросервисами

**Решение: монорепа с тремя пакетами.** Проект сезонный (пик — декабрь), объём кода небольшой, команда малая. Микросервисы здесь избыточны: добавляют накладные расходы на оркестрацию, деплой и отладку без пропорциональной пользы.

---

## 3. Структура директорий

```
ели/
├── ARCHITECTURE.md           # Единый источник архитектурных правил
├── TODO.md                   # План-график задач
├── DATA_MODEL.md             # Описание моделей и API
├── be/                       # Бэкенд
│   ├── prisma/
│   │   └── schema.prisma     # Схема БД — источник истины
│   ├── src/
│   │   ├── index.ts          # Точка входа
│   │   ├── app.ts            # Express app factory
│   │   ├── config.ts         # Конфигурация из .env
│   │   ├── db/prisma.ts      # PrismaClient singleton
│   │   ├── middleware/        # auth, rate-limit, cors
│   │   ├── routes/            # Роутеры (одна сущность = один файл)
│   │   ├── services/          # Бизнес-логика + внешние API
│   │   └── utils/             # Вспомогательные функции
│   └── package.json
├── frontend/                 # Витрина магазина
│   └── src/
│       ├── api/              # HTTP-клиент, interceptors, эндпоинты
│       │   ├── client.ts     #    Axios-инстанс + токен-менеджмент
│       │   ├── interceptors.ts
│       │   ├── errorHandler.ts
│       │   ├── endpoints/    #    Эндпоинты по сущностям (один файл = одна сущность)
│       │   └── index.ts
│       ├── components/       # Бизнес-компоненты (ProtectedRoute, секции)
│       ├── constants/        # Константы приложения
│       │   ├── app.ts
│       │   └── images.ts
│       ├── pages/            # Страницы (одна директория на страницу)
│       ├── shared/           # Переиспользуемое между модулями
│       │   ├── components/   #    Общие UI-компоненты (Card, ProductCard, SectionHeading)
│       │   ├── contexts/     #    React контексты (AuthContext, CartContext)
│       │   ├── hooks/        #    Общие хуки (useParallax, use3DTilt, useDebounce)
│       │   ├── Header/       #    Шапка
│       │   └── Footer/       #    Подвал
│       └── types/            # TypeScript-типы (фронтенд-модели)
└── admin/                    # Админ-панель
    └── src/
        ├── api.ts            # HTTP-клиент с Bearer-токеном
        ├── components/       # AdminLayout, общие компоненты
        ├── context/          # AuthContext (токен + состояние входа)
        └── pages/            # CRUD-страницы для каждой сущности
```

### Принципы организации кода

- **Один роутер = одна сущность.** Все эндпоинты для `/api/products` лежат в `routes/products.ts`.
- **Сервисный слой.** Внешние интеграции (Точка Банк, Telegram, MinIO) вынесены в `services/`.
- **Фронтенд: одна страница = одна директория.** `pages/HomePage/` содержит `HomePage.tsx`, `hooks/`, `ui/` и `index.ts`.
- **Shared-компоненты лежат в `shared/`.** UI-компоненты — `shared/components/`, хуки — `shared/hooks/`.
- **Бизнес-компоненты — в `components/`.** ProtectedRoute, layout-обёртки.
- **API-эндпоинты — в `api/endpoints/`.** Один файл на сущность: `endpoints/products.ts`, `endpoints/orders.ts` и т.д.
- **Каждая директория с экспортами обязана иметь `index.ts`** с реэкспортом публичного API (barrel export).

### Правила фронтенд-кода

#### API-слой: эндпоинты в `api/endpoints/`

Каждая сущность — отдельный файл с чистыми функциями-запросами (без состояния):

```typescript
// api/endpoints/products.ts
import { apiClient } from '@/api/client';

export const productsApi = {
  getAll: (params?: ProductFilters) =>
    apiClient.get<Product[]>('/products', { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then(r => r.data),

  create: (data: CreateProductDto) =>
    apiClient.post<Product>('/products', data).then(r => r.data),

  remove: (id: string) =>
    apiClient.delete(`/products/${id}`).then(r => r.data),
};
```

#### ВСЕ запросы к серверу — только через хуки с TanStack Query

**Прямые вызовы API из компонентов запрещены.** Каждый API-вызов оборачивается в хук, использующий `@tanstack/react-query`. Хук инкапсулирует `queryKey`, `queryFn`, `staleTime`, обработку ошибок.

```typescript
// ✅ Правильно — запрос через React Query в хуке
// pages/ProductsPage/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/api/endpoints/products';

export const useProducts = (params?: ProductFilters) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};
```

```typescript
// ❌ Неправильно — прямой вызов API в компоненте
import { apiClient } from '@/api';
const data = await apiClient.get('/products');
```

```typescript
// ❌ Неправильно — ручное управление состоянием в хуке
export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.get('/products').then(setData); }, []);
  return { data, loading };
}
```

#### Правила именования и структуры файлов

| Категория | Правило | Пример |
|---|---|---|
| Компоненты | PascalCase | `ProductTable`, `AdminLayout` |
| Хуки | camelCase, префикс `use` | `useProducts`, `useDebounce` |
| Функции API | camelCase | `getProducts`, `createProduct` |
| Типы/интерфейсы | PascalCase | `Product`, `OrderStatus` |
| Файлы компонентов | PascalCase.tsx | `ProductTable.tsx` |
| Файлы хуков/утилит | camelCase.ts | `useProducts.ts`, `formatDate.ts` |
| Константы | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Булевы переменные | префикс `is`, `has`, `should` | `isLoading`, `hasError` |
| Обработчики событий | префикс `handle` | `handleSubmit`, `handleDelete` |

#### Ограничения на файлы

- **Максимум 200 строк** на файл. При превышении — выносить подкомпоненты в `ui/`, логику в `hooks/`, хелперы в `utils/`.
- **Один файл — один компонент / хук / функция.** Никаких «сборников» из нескольких экспортов в одном файле (кроме barrel `index.ts`).
- **Только именованные экспорты.** Никаких `export default`.
- **Все внутренние импорты — через алиас `@/`.** Никаких `../../../`.

#### Страницы: структура директории

```
pages/ProductsPage/
├── ProductsPage.tsx       # корневой компонент (композиция, layout)
├── ProductFormPage.tsx    # форма создания/редактирования (если нужна)
├── hooks/
│   ├── useProducts.ts     # загрузка списка (React Query)
│   └── useProductForm.ts  # логика формы (состояние, валидация, submit)
├── ui/
│   └── ProductTable.tsx   # презентационные компоненты
└── index.ts               # barrel export
```

#### Чеклист при создании новой страницы

- [ ] Директория `pages/NewPage/`
- [ ] `NewPage.tsx` — корневой компонент
- [ ] `hooks/useNewPage.ts` — логика через React Query
- [ ] `ui/` — презентационные компоненты
- [ ] `index.ts` — barrel export
- [ ] Эндпоинты в `api/endpoints/new-entity.ts`
- [ ] Ни один файл не превышает 200 строк
- [ ] Все импорты через `@/`
- [ ] Именованные экспорты
- [ ] API-вызовы только через хуки с React Query

---

## 4. Схема базы данных (Prisma)

Полное описание всех полей и связей — в `DATA_MODEL.md`. Здесь приведены только ключевые сущности:

```
User ────< Order ────< OrderItem >──── Product >──── ProductImage
  │                      │                    │
  │                      ▼                    │
  │               DeliveryZone          ProductCategory
  │                                         │
  │                                    WholesalePrice
  ▼
PartnerApplication ──< PartnerDocument
  │
SalePoint ────< Product
  │
  ├── lat, lng (координаты для карты)
  ├── workingHours (JSON)
  └── isActive
```

### Best-practice решения в модели данных

1. **Резервирование товара.** Вместо отдельной таблицы `CartReservation` используем атомарный decrement с оптимистической блокировкой:
   - При добавлении в корзину: `UPDATE Product SET reserved = reserved + 1 WHERE id = ? AND quantity - reserved >= ?`
   - По истечении 20 минут: фоновая задача возвращает `reserved` обратно.
   - **Решение:** поле `reserved INT DEFAULT 0` в таблице `Product` — проще, чем Redis, и не требует доп. инфраструктуры.

2. **Таймеры (20 мин корзина, 30 мин оплата).** Используем `setTimeout` в Node.js с сохранением `expiresAt` в БД:
   - `Order.cartReservedUntil` — до какого времени товар зарезервирован.
   - `Order.paymentExpiresAt` — до какого времени ждём оплату.
   - При старте сервера подбираем все «зависшие» заказы и планируем их отмену заново.
   - **Решение:** pg-boss или встроенный `node-cron` для периодической очистки; на MVP достаточно `setTimeout` + рекавери при рестарте.

3. **Категории товаров.** Adjacency list (`parentId → Category`) — дерево глубиной 2-3 уровня. Не требует рекурсивных CTE для простых выборок.

4. **Роли пользователей.** Перечисление `UserRole`: `CUSTOMER`, `WHOLESALE`, `PARTNER`, `MANAGER`, `ADMIN`. Один JWT-токен, один middleware, проверка роли через `req.auth.role`.

5. **Оптовые цены.** Таблица `WholesalePrice`: привязка к `Product` + `minQuantity` (порог объёма) + `price`. Оптовик в каталоге видит минимальную цену из подходящего ему тира.

6. **Координаты ёлочных базаров.** Поля `lat`/`lng` (DECIMAL) в `SalePoint` для отображения на Яндекс.Картах / 2ГИС.

7. **Документы арендодателей.** Хранятся в MinIO в бакете `partners`. В БД — только `PartnerDocument.key` и `PartnerDocument.type` (CONTRACT, PHOTO).

---

## 5. Потоки данных

### 5.1. Процесс покупки (розница)

```
Клиент                     Фронтенд                    Бэкенд                      Точка Банк
  │                           │                          │                            │
  ├─ добавляет в корзину ──►  │                          │                            │
  │                           ├─ POST /api/orders ────►  │                            │
  │                           │                          ├─ проверка остатков          │
  │                           │                          ├─ создание заказа (PENDING)  │
  │                           │                          ├─ резервирование товара      │
  │                           │                          ├─ POST /payments ──────────► │
  │                           │                          │          ◄── paymentLink ── │
  │                           │    ◄── paymentLink ───── │                            │
  │    ◄── редирект на Точку──│                          │                            │
  │                           │                          │                            │
  ├─ оплачивает ────────────────────────────────────────────────────────────────────► │
  │                           │                          │                            │
  │                           │                          │  ◄── webhook (approved) ─── │
  │                           │                          ├─ списание остатков          │
  │                           │                          ├─ статус → PAID              │
  │                           │                          ├─ уведомление в Telegram     │
  │                           │                          │                            │
  │    ◄── страница успеха ── │                          │                            │
```

### 5.2. Жизненный цикл заказа (расширенная модель)

Текущие статусы (`PENDING`, `PAID`, `FAILED`, `CANCELLED`) недостаточны для ТЗ. Расширяем:

```
PENDING        — заказ создан, ждёт оплаты (таймер 30 мин)
PAID           — оплата получена
PROCESSING     — менеджер взял в работу
ASSEMBLED      — собран / готов к выдаче
DELIVERING     — передан курьеру
COMPLETED      — выполнен (клиент получил)
CANCELLED      — отменён (по таймауту, менеджером или клиентом)
```

### 5.3. B2B-поток (арендодатели)

```
Арендодатель          Фронтенд                Бэкенд                  Админ
    │                     │                      │                      │
    ├─ заполняет форму ──►│                      │                      │
    │                     ├─ POST /applications ►│                      │
    │                     │                      ├─ статус NEW          │
    │                     │                      ├─ уведомление админу ─►│
    │                     │                      │                      │
    │                     │                      │  ◄── статус → IN_PROGRESS
    │                     │                      │  ◄── загрузка договора
    │  ◄── уведомление ───│◄── статус обновлён ──│                      │
    │  ◄── скачать договор│                      │                      │
```

---

## 6. API-дизайн

### Принципы

- **RESTful.** Ресурсы во множественном числе: `/api/products`, `/api/orders`.
- **Статус-коды.** 201 (создано), 204 (удалено), 400 (валидация), 401 (не авторизован), 404 (не найдено), 502 (ошибка внешнего сервиса).
- **Все ответы — JSON.** Единый формат ошибок: `{ error: string }`.
- **Аутентификация.** Bearer-токен (JWT) в заголовке `Authorization`.
- **Публичные и защищённые эндпоинты.** Чёткое разделение: `authMiddleware` только на админских/менеджерских роутах.

Полный перечень эндпоинтов — в `DATA_MODEL.md`.

---

## 7. Безопасность

| Угроза                    | Мера защиты                                                               |
|---------------------------|---------------------------------------------------------------------------|
| Доступ к чужим заказам    | UUID-идентификаторы (неперебираемые) + авторизация для админских эндпоинтов |
| Платёжные данные          | Не хранятся. Все платежи — через iframe/редирект Точка Банк               |
| Подделка вебхуков         | Проверка `TOCHKA_WEBHOOK_SECRET` + HMAC-подпись (план)                    |
| Брутфорс пароля админа   | Rate-limiting на `/api/auth/login` (TODO)                                  |
| Инъекции                  | Prisma параметризует запросы автоматически                                 |
| XSS                       | React по умолчанию экранирует вывод; CSP-заголовки (TODO)                  |
| Загрузка файлов           | Только image/*, max 10MB, уникальные ключи в MinIO                        |
| Переполнение остатков     | Атомарный UPDATE с проверкой `quantity - reserved >= requested` в транзакции |

---

## 8. Деплой и окружение

### Разработка

```bash
cp .env.example .env          # Настроить переменные
docker compose up -d           # PostgreSQL + MinIO
cd be && npm run dev           # API на :3000
cd admin && npm run dev        # Админка на :5173
cd frontend && npm run dev     # Витрина на :5174
```

### Продакшен (рекомендации)

1. **Сборка:** `npm run build` в каждом пакете.
2. **Запуск:** `node dist/index.js` для бэкенда; статика фронтенда и админки раздаётся через Nginx.
3. **Nginx:** reverse proxy + SSL через Let's Encrypt + раздача статики.
4. **База данных:** Managed PostgreSQL (например, Selectel / Яндекс.Облако) с ежедневными бэкапами.
5. **Файлы:** MinIO заменить на S3-совместимое облачное хранилище.
6. **Мониторинг:** Prometheus + Grafana для метрик; Sentry для ошибок на бэкенде и фронтенде.

---

## 9. Архитектурные решения и компромиссы

### 9.1. Резервирование товара: БД vs Redis

**Выбрано: БД (поле `reserved` в `Product`).**
- Redis добавил бы ещё один stateful-сервис в инфраструктуру.
- Для сезонного магазина с умеренным трафиком атомарного UPDATE в PostgreSQL достаточно.
- При масштабировании всегда можно вынести резервирование в Redis без изменения API.

### 9.2. Категории товаров: Adjacency List vs Nested Sets vs Materialized Path

**Выбрано: Adjacency List (`parentId`).**
- Максимальная глубина — 3 уровня (Категория → Подкатегория → Вид).
- Простота реализации, нативная поддержка Prisma.
- Недостаток (N+1 для всего дерева) решается eager loading с `include`.

### 9.3. Фоновые задачи: setTimeout vs Bull/BullMQ vs pg-boss

**Выбрано: setTimeout + рекавери при рестарте (MVP).**
- На этапе MVP двух таймеров (корзина 20 мин, оплата 30 мин) достаточно.
- При рестарте сервера подбираем заказы с `cartReservedUntil < NOW()` и отменяем их.
- В будущем — миграция на pg-boss (очередь в PostgreSQL, без Redis).

### 9.4. Точка Банк: платёжные ссылки vs hosted payment page

**Выбрано: платёжные ссылки (payment link).**
- Минимальная интеграция: не нужно хранить карточные данные, не нужен PCI DSS.
- Клиент редиректится на страницу Точка Банк, после оплаты возвращается.
- Вебхук `acquiringInternetPayment` подтверждает оплату асинхронно.

---

## 10. Метрики и мониторинг (план)

- `/health` — healthcheck для оркестратора.
- Логирование: структурированные логи (pino) с уровнями `info`/`warn`/`error`.
- Бизнес-метрики: количество заказов, выручка, конверсия — через эндпоинт `/api/stats/dashboard`.
- Алерты: Telegram-уведомления о падении оплат, ошибках вебхуков.

---

## 11. Roadmap (пост-MVP)

1. Redis для корзины и сессий (при росте трафика).
2. Elasticsearch / Meilisearch для полнотекстового поиска по каталогу.
3. Очередь задач (pg-boss / BullMQ) для надёжных фоновых процессов.
4. CDN для изображений (CloudFront / CloudFlare).
5. Мобильное PWA-приложение (offline-каталог).
6. Мультиязычность (en/ru) для экспортных оптовых продаж.
