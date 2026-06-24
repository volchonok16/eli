# DATA MODEL — Модели данных и API

## 1. Схема базы данных (Prisma)

Ниже приведена целевая схема, включающая все изменения из TODO.md / Неделя 1.

### 1.1. Перечисления (Enums)

```prisma
enum UserRole {
  CUSTOMER
  WHOLESALE
  PARTNER
  MANAGER
  ADMIN
}

enum OrderStatus {
  PENDING       // создан, ожидает оплаты (таймер 30 мин)
  PAID          // оплачен, в обработке
  PROCESSING    // менеджер взял в работу
  ASSEMBLED     // собран / готов к выдаче
  DELIVERING    // передан курьеру
  COMPLETED     // выполнен
  CANCELLED     // отменён
  FAILED        // ошибка при создании платежа
}

enum DeliveryType {
  SELF_PICKUP
  COURIER
}

enum PartnerStatus {
  NEW
  IN_PROGRESS
  APPROVED
  REJECTED
}

enum PartnerDocumentType {
  PHOTO
  CONTRACT
  LEGAL_DOCS
}

enum ApplicationStatus {
  NEW
  IN_PROGRESS
  DONE
  CANCELLED
}
```

### 1.2. Пользователи

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String
  name              String
  phone             String?
  role              UserRole  @default(CUSTOMER)
  wholesaleApproved Boolean   @default(false)   // оптовик одобрен менеджером
  companyName       String?                      // для WHOLESALE / PARTNER
  inn               String?                      // ИНН организации
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  orders                Order[]
  partnerApplications   PartnerApplication[]
  cpRequests            CpRequest[]
}
```

### 1.3. Категории товаров

```prisma
model Category {
  id        String     @id @default(uuid())
  name      String
  slug      String     @unique
  imageKey  String?                              // иконка/фото категории в MinIO
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id], onDelete: SetNull)
  children  Category[] @relation("CategoryTree")
  products  Product[]
  sortOrder Int        @default(0)
  createdAt DateTime   @default(now())
}
```

### 1.4. Товары

```prisma
model Product {
  id          String    @id @default(uuid())
  sku         String?   @unique              // артикул
  name        String
  description String?
  careGuide   String?                        // Markdown-текст ухода (рендерится на карточке)
  height      Int?                           // высота в см (для фильтрации)
  heightLabel String?                        // «1.5–2 м»
  sort        String?                        // сорт: «Русская ель», «Голубая ель»
  price       Decimal   @db.Decimal(10, 2)
  costPrice   Decimal?  @db.Decimal(10, 2)   // закупочная цена
  quantity    Int       @default(0)          // физический остаток
  reserved    Int       @default(0)          // зарезервировано в корзинах
  inStock     Boolean   @default(true)
  isHit       Boolean   @default(false)      // хит продаж (на главную)
  isNew       Boolean   @default(false)      // новинка

  categoryId  String?
  category    Category?  @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  salePointId String?
  salePoint   SalePoint? @relation(fields: [salePointId], references: [id], onDelete: SetNull)

  images          ProductImage[]
  orderItems      OrderItem[]
  wholesalePrices WholesalePrice[]
  reviews         Review[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 1.5. Изображения товаров

```prisma
model ProductImage {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  key       String                               // путь в MinIO
  url       String                               // запасной URL (не используется, URL генерится через API)
  sortOrder Int     @default(0)
}
```

### 1.6. Оптовые цены

```prisma
model WholesalePrice {
  id          String  @id @default(uuid())
  productId   String
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  minQuantity Int                                  // минимальный объём закупки для этой цены
  price       Decimal @db.Decimal(10, 2)
}
```

### 1.7. Точки продаж (ёлочные базары)

```prisma
model SalePoint {
  id           String    @id @default(uuid())
  shortName    String
  address      String
  lat          Decimal?  @db.Decimal(10, 7)    // широта
  lng          Decimal?  @db.Decimal(10, 7)    // долгота
  phone        String?
  description  String?
  workingHours Json?                           // { open, close, startDate, endDate }
  imageKey     String?
  isActive     Boolean   @default(true)
  products     Product[]
  orders       Order[]                         // заказы с самовывозом из этой точки
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

### 1.8. Зоны доставки

```prisma
model DeliveryZone {
  id          String  @id @default(uuid())
  name        String
  basePrice   Decimal @db.Decimal(10, 2)      // базовая стоимость
  perKmPrice  Decimal @db.Decimal(10, 2)      // цена за км (при distance-расчёте)
  polygon     Json                             // массив [lat, lng] пар — полигон зоны
  isActive    Boolean @default(true)
  orders      Order[]
  createdAt   DateTime @default(now())
}
```

### 1.9. Заказы

```prisma
model Order {
  id                String      @id @default(uuid())
  status            OrderStatus @default(PENDING)
  totalAmount       Decimal     @db.Decimal(10, 2)

  userId            String?
  user              User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  customerName      String?
  customerPhone     String?
  customerEmail     String?

  deliveryType      DeliveryType?
  salePointId       String?
  salePoint         SalePoint?  @relation(fields: [salePointId], references: [id], onDelete: SetNull)
  deliveryAddress   String?
  deliveryZoneId    String?
  deliveryZone      DeliveryZone? @relation(fields: [deliveryZoneId], references: [id], onDelete: SetNull)
  deliveryCost      Decimal?    @db.Decimal(10, 2)

  paymentLink       String?
  tochkaOperationId String?     @unique
  paymentLinkId     String?     @unique

  cartReservedUntil DateTime?              // до какого времени зарезервирован товар (20 мин)
  paymentExpiresAt  DateTime?              // до какого времени ждать оплату (30 мин)
  cancelReason      String?               // причина отмены
  managerNote       String?               // заметка менеджера

  items             OrderItem[]
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}
```

### 1.10. Элементы заказа

```prisma
model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)     // цена на момент покупки (историческая)
}
```

### 1.11. Заявки арендодателей (партнёров)

```prisma
model PartnerApplication {
  id               String        @id @default(uuid())
  userId           String?
  user             User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  organizationName String?
  contactName      String
  phone            String
  email            String?
  landAddress      String                       // адрес участка
  landArea         Decimal?      @db.Decimal(10, 2)  // площадь в сотках
  description      String?                      // пожелания
  status           PartnerStatus @default(NEW)
  statusNote       String?                      // комментарий менеджера при смене статуса
  documents        PartnerDocument[]
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
}
```

### 1.12. Документы партнёров

```prisma
model PartnerDocument {
  id                   String              @id @default(uuid())
  partnerApplicationId String
  application          PartnerApplication  @relation(fields: [partnerApplicationId], references: [id], onDelete: Cascade)
  key                  String                               // путь в MinIO
  type                 PartnerDocumentType  @default(PHOTO)
  originalName         String?                              // оригинальное имя файла
  createdAt            DateTime            @default(now())
}
```

### 1.13. Запросы коммерческих предложений (опт)

```prisma
model CpRequest {
  id            String   @id @default(uuid())
  userId        String?
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  companyName   String
  inn           String?
  contactName   String
  phone         String
  email         String?
  requirements  String?               // пожелания к КП
  isProcessed   Boolean  @default(false)
  managerNote   String?
  createdAt     DateTime @default(now())
}
```

### 1.14. Отзывы

```prisma
model Review {
  id          String   @id @default(uuid())
  productId   String?
  product     Product? @relation(fields: [productId], references: [id], onDelete: Cascade)
  authorName  String
  text        String
  rating      Int      @default(5)
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 1.15. Заявки на услуги (существующая модель)

```prisma
model Service {
  id           String        @id @default(uuid())
  name         String
  description  String?
  price        Decimal?      @db.Decimal(10, 2)
  isActive     Boolean       @default(true)
  applications Application[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Application {
  id        String            @id @default(uuid())
  name      String
  contact   String
  message   String?
  serviceId String?
  service   Service?          @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  status    ApplicationStatus @default(NEW)
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}

model Feedback {
  id        String   @id @default(uuid())
  name      String
  contact   String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model PromoBanner {
  id        String   @id @default(uuid())
  title     String
  subtitle  String?
  imageKey  String?
  linkUrl   String?
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  startDate DateTime?
  endDate   DateTime?
  createdAt DateTime @default(now())
}
```

---

## 2. API Endpoints

> Все эндпоинты, помеченные :lock:, требуют `Authorization: Bearer <token>`.
> Роль указывается в скобках: :lock:(ADMIN) — только админ, :lock:(ADMIN,MANAGER) — админ или менеджер.

### 2.1. Аутентификация

| Метод | Путь                  | Доступ       | Описание                            |
|-------|-----------------------|--------------|-------------------------------------|
| POST  | `/api/auth/register`  | Публичный    | Регистрация покупателя              |
| POST  | `/api/auth/login`     | Публичный    | Вход (все роли), возвращает JWT     |
| GET   | `/api/auth/me`        | :lock:       | Профиль текущего пользователя       |
| PUT   | `/api/auth/me`        | :lock:       | Редактирование профиля              |

### 2.2. Товары

| Метод  | Путь                             | Доступ            | Описание                            |
|--------|----------------------------------|-------------------|-------------------------------------|
| GET    | `/api/products`                  | Публичный         | Список товаров (фильтры, пагинация, сортировка) |
| GET    | `/api/products/:id`              | Публичный         | Карточка товара                     |
| GET    | `/api/products/:id/related`      | Публичный         | «С этим покупают» (cross-sell)      |
| POST   | `/api/products`                  | :lock:(ADMIN)     | Создать товар                       |
| PUT    | `/api/products/:id`              | :lock:(ADMIN)     | Обновить товар                      |
| DELETE | `/api/products/:id`              | :lock:(ADMIN)     | Удалить товар                       |
| POST   | `/api/products/import`           | :lock:(ADMIN)     | Массовая загрузка из Excel          |
| POST   | `/api/products/:id/images`       | :lock:(ADMIN)     | Загрузить изображения               |
| PUT    | `/api/products/:id/images/order` | :lock:(ADMIN)     | Порядок изображений                 |
| DELETE | `/api/products/:id/images/:imgId`| :lock:(ADMIN)     | Удалить изображение                 |

**Параметры `GET /api/products`:**

| Параметр       | Тип      | Описание                                       |
|----------------|----------|------------------------------------------------|
| `categoryId`   | UUID     | Фильтр по категории                            |
| `heightMin`    | number   | Мин. высота (см)                               |
| `heightMax`    | number   | Макс. высота (см)                              |
| `priceMin`     | number   | Мин. цена                                      |
| `priceMax`     | number   | Макс. цена                                     |
| `inStock`      | boolean  | Только в наличии                               |
| `salePointId`  | UUID     | Товары в конкретной точке                      |
| `sort`         | string   | `popularity`, `price_asc`, `price_desc`, `newest` |
| `page`         | number   | Номер страницы                                 |
| `limit`        | number   | Записей на странице (default: 20, max: 100)    |
| `search`       | string   | Поиск по названию и описанию                   |

### 2.3. Категории

| Метод  | Путь                     | Доступ            | Описание                      |
|--------|--------------------------|-------------------|-------------------------------|
| GET    | `/api/categories`        | Публичный         | Дерево категорий              |
| GET    | `/api/categories/:id`    | Публичный         | Категория с подкатегориями    |
| POST   | `/api/categories`        | :lock:(ADMIN)     | Создать категорию             |
| PUT    | `/api/categories/:id`    | :lock:(ADMIN)     | Обновить категорию            |
| DELETE | `/api/categories/:id`    | :lock:(ADMIN)     | Удалить категорию             |

### 2.4. Корзина и заказы

| Метод  | Путь                                  | Доступ                   | Описание                                    |
|--------|---------------------------------------|--------------------------|---------------------------------------------|
| POST   | `/api/orders`                         | Публичный (гость или :lock:) | Создать заказ + получить платёжную ссылку |
| GET    | `/api/orders/:id`                     | Публичный (владелец)     | Детали заказа                               |
| GET    | `/api/orders/:id/status`              | Публичный (владелец)     | Статус заказа (для polling на странице оплаты) |
| GET    | `/api/orders/my`                      | :lock:(CUSTOMER,WHOLESALE) | История заказов пользователя              |
| GET    | `/api/orders/history`                 | :lock:(ADMIN,MANAGER)    | Все заказы (админка)                        |
| PATCH  | `/api/orders/:id/status`              | :lock:(ADMIN,MANAGER)    | Смена статуса заказа                        |
| POST   | `/api/orders/:id/cancel`              | :lock:(ADMIN,MANAGER)    | Отмена заказа с причиной                    |
| POST   | `/api/orders/:id/return-cart`         | Системный                | Возврат резерва по таймауту корзины         |

**Тело `POST /api/orders`:**
```json
{
  "items": [{ "productId": "uuid", "quantity": 1 }],
  "customerName": "Иван Петров",
  "customerPhone": "+79161234567",
  "customerEmail": "ivan@example.com",
  "deliveryType": "SELF_PICKUP | COURIER",
  "salePointId": "uuid (для SELF_PICKUP)",
  "deliveryAddress": "г. Москва, ул. Тверская, 1",
  "deliveryZoneId": "uuid (опционально, если зона определена)"
}
```

**Ответ `POST /api/orders`:**
```json
{
  "orderId": "uuid",
  "totalAmount": 5990,
  "deliveryCost": 500,
  "paymentLink": "https://enter.tochka.com/pay/abc123",
  "status": "PENDING",
  "cartReservedUntil": "2025-12-20T14:35:00Z",
  "paymentExpiresAt": "2025-12-20T15:05:00Z"
}
```

### 2.5. Точки продаж

| Метод  | Путь                       | Доступ            | Описание                       |
|--------|----------------------------|-------------------|--------------------------------|
| GET    | `/api/sale-points`         | Публичный         | Список точек (фильтр `isActive`) |
| GET    | `/api/sale-points/:id`     | Публичный         | Детали точки                   |
| POST   | `/api/sale-points`         | :lock:(ADMIN)     | Создать точку                  |
| PUT    | `/api/sale-points/:id`     | :lock:(ADMIN)     | Обновить точку                 |
| DELETE | `/api/sale-points/:id`     | :lock:(ADMIN)     | Удалить точку                  |
| POST   | `/api/sale-points/:id/image` | :lock:(ADMIN)   | Загрузить фото точки           |
| DELETE | `/api/sale-points/:id/image` | :lock:(ADMIN)   | Удалить фото точки             |

### 2.6. Зоны доставки

| Метод  | Путу                         | Доступ            | Описание                      |
|--------|------------------------------|-------------------|-------------------------------|
| GET    | `/api/delivery-zones`        | Публичный         | Список активных зон           |
| GET    | `/api/delivery-zones/check`  | Публичный         | Определить зону по координатам |
| POST   | `/api/delivery-zones`        | :lock:(ADMIN)     | Создать зону                  |
| PUT    | `/api/delivery-zones/:id`    | :lock:(ADMIN)     | Обновить зону                 |
| DELETE | `/api/delivery-zones/:id`    | :lock:(ADMIN)     | Удалить зону                  |

**`GET /api/delivery-zones/check?lat=55.7558&lng=37.6173`:**
```json
{
  "zoneId": "uuid",
  "zoneName": "Москва в пределах МКАД",
  "deliveryCost": 500,
  "isDeliverable": true
}
```

### 2.7. Оптовые цены

| Метод  | Путь                                | Доступ              | Описание                           |
|--------|-------------------------------------|---------------------|------------------------------------|
| GET    | `/api/wholesale/prices`             | :lock:(WHOLESALE)   | Оптовые цены для авторизованного   |
| GET    | `/api/wholesale/prices/public`      | Публичный           | Публичная таблица (базовые тиры)   |
| POST   | `/api/wholesale/prices`             | :lock:(ADMIN)       | Добавить оптовую цену              |
| PUT    | `/api/wholesale/prices/:id`         | :lock:(ADMIN)       | Обновить оптовую цену              |
| DELETE | `/api/wholesale/prices/:id`         | :lock:(ADMIN)       | Удалить оптовую цену               |

### 2.8. Запросы КП (опт)

| Метод  | Путь                         | Доступ                   | Описание                          |
|--------|------------------------------|--------------------------|-----------------------------------|
| POST   | `/api/cp-requests`           | Публичный / :lock:       | Отправить запрос КП               |
| GET    | `/api/cp-requests`           | :lock:(ADMIN,MANAGER)    | Список запросов                   |
| PATCH  | `/api/cp-requests/:id`       | :lock:(ADMIN,MANAGER)    | Обработать запрос                 |

### 2.9. Партнёры (арендодатели)

| Метод  | Путь                                              | Доступ                 | Описание                            |
|--------|---------------------------------------------------|------------------------|-------------------------------------|
| POST   | `/api/partner-applications`                       | Публичный / :lock:     | Подать заявку                       |
| GET    | `/api/partner-applications/my`                    | :lock:(PARTNER)        | Заявки текущего партнёра            |
| GET    | `/api/partner-applications/:id`                   | :lock:(владелец или ADMIN,MANAGER) | Детали заявки        |
| GET    | `/api/partner-applications`                       | :lock:(ADMIN,MANAGER)  | Все заявки (админка)                |
| PATCH  | `/api/partner-applications/:id/status`            | :lock:(ADMIN,MANAGER)  | Смена статуса                       |
| POST   | `/api/partner-applications/:id/documents`         | :lock:(ADMIN,MANAGER)  | Загрузить документ (договор)        |
| GET    | `/api/partner-applications/:id/documents/:docId/download` | :lock:(владелец или ADMIN) | Скачать документ          |
| DELETE | `/api/partner-applications/:id/documents/:docId`  | :lock:(ADMIN)          | Удалить документ                    |

### 2.10. Отзывы

| Метод  | Путь                      | Доступ            | Описание                       |
|--------|---------------------------|-------------------|--------------------------------|
| GET    | `/api/reviews/published`  | Публичный         | Опубликованные отзывы          |
| GET    | `/api/reviews`            | :lock:(ADMIN)     | Все отзывы                     |
| POST   | `/api/reviews`            | :lock:            | Оставить отзыв                 |
| PATCH  | `/api/reviews/:id/publish`| :lock:(ADMIN)     | Опубликовать / скрыть          |
| DELETE | `/api/reviews/:id`        | :lock:(ADMIN)     | Удалить отзыв                  |

### 2.11. Статистика (дашборд)

| Метод | Путь                  | Доступ                 | Описание                              |
|-------|-----------------------|------------------------|---------------------------------------|
| GET   | `/api/stats/dashboard`| :lock:(ADMIN,MANAGER)  | Ключевые показатели (выручка, заказы, остатки) |

**Ответ `GET /api/stats/dashboard`:**
```json
{
  "revenue": {
    "today": 125000,
    "week": 890000,
    "month": 3200000
  },
  "orders": {
    "new": 5,
    "processing": 12,
    "assembled": 8,
    "delivering": 3
  },
  "topProducts": [
    { "name": "Ель русская 2м", "sold": 34, "revenue": 204000 }
  ],
  "stockByPoint": [
    { "salePointId": "uuid", "shortName": "ТЦ Европейский", "totalItems": 45, "totalValue": 225000 }
  ]
}
```

### 2.12. Промо-баннеры

| Метод  | Путь                 | Доступ            | Описание                         |
|--------|----------------------|-------------------|----------------------------------|
| GET    | `/api/banners/active`| Публичный         | Активные баннеры (для главной)   |
| GET    | `/api/banners`       | :lock:(ADMIN)     | Все баннеры                      |
| POST   | `/api/banners`       | :lock:(ADMIN)     | Создать баннер                   |
| PUT    | `/api/banners/:id`   | :lock:(ADMIN)     | Обновить баннер                  |
| DELETE | `/api/banners/:id`   | :lock:(ADMIN)     | Удалить баннер                   |

### 2.13. Вебхуки

| Метод | Путь                              | Доступ    | Описание                                     |
|-------|-----------------------------------|-----------|----------------------------------------------|
| POST  | `/api/webhooks/tochka`            | IP-filter | Вебхук Точка Банк (проверка подписи)         |
| POST  | `/api/webhooks/tochka/confirm/:id`| Публичный | Ручная проверка оплаты (polling с фронтенда) |
| POST  | `/api/webhooks/telegram`          | IP-filter | Telegram bot callback query                  |

### 2.14. Услуги, заявки, обратная связь (существующие)

| Метод  | Путь                     | Доступ            | Описание                            |
|--------|--------------------------|-------------------|-------------------------------------|
| GET    | `/api/services`          | Публичный         | Список услуг                        |
| GET    | `/api/services/active`   | Публичный         | Активные услуги                     |
| POST   | `/api/services`          | :lock:(ADMIN)     | Создать услугу                      |
| PUT    | `/api/services/:id`      | :lock:(ADMIN)     | Обновить услугу                     |
| DELETE | `/api/services/:id`      | :lock:(ADMIN)     | Удалить услугу                      |
| POST   | `/api/applications`      | Публичный         | Оставить заявку на услугу           |
| GET    | `/api/applications`      | :lock:(ADMIN)     | Все заявки                          |
| PATCH  | `/api/applications/:id`  | :lock:(ADMIN)     | Сменить статус заявки               |
| POST   | `/api/feedback`          | Публичный         | Обратная связь                      |
| GET    | `/api/feedback`          | :lock:(ADMIN)     | Все обращения                       |
| PATCH  | `/api/feedback/:id`      | :lock:(ADMIN)     | Пометить прочитанным                |

### 2.15. Файлы

| Метод | Путь            | Доступ    | Описание                                     |
|-------|-----------------|-----------|----------------------------------------------|
| GET   | `/api/files/*`  | Публичный | Прокси к MinIO (кэширование 24ч)             |

---

## 3. Внешние интеграции

### 3.1. Точка Банк (интернет-эквайринг)

- **Создание платежа:** `POST {TOCHKA_BASE_URL}/uapi/acquiring/v1.0/payments`
- **Проверка статуса:** `GET {TOCHKA_BASE_URL}/uapi/acquiring/v1.0/payments/{operationId}`
- **Вебхук:** `POST /api/webhooks/tochka` — принимает `acquiringInternetPayment`
- **Аутентификация:** `Authorization: Bearer {TOCHKA_ACCESS_TOKEN}`
- **Проверка подписи:** HMAC-SHA256 с `TOCHKA_WEBHOOK_SECRET`, заголовок `X-Tochka-Signature`

### 3.2. Telegram Bot API

- **Отправка сообщений:** `POST https://api.telegram.org/bot{token}/sendMessage`
- **Callback query:** через webhook `POST /api/webhooks/telegram`
- **Inline keyboard:** для кнопок управления заказом

### 3.3. Яндекс.Карты (фронтенд)

- **API:** JS API v3 (`https://api-maps.yandex.ru/v3/`)
- **Геокодер:** `https://geocode-maps.yandex.ru/1.x/` (преобразование адреса в координаты)
- **Квота:** 1000 запросов/день на бесплатном тарифе

### 3.4. MinIO (S3-совместимое хранилище)

- **Бакеты:** `products` (товары), `sale-points` (фото точек), `partners` (документы), `banners` (баннеры)
- **Доступ:** через API-прокси `/api/files/*`, прямого публичного доступа нет
- **Кэширование:** заголовок `Cache-Control: public, max-age=86400`

---

## 4. Формат ошибок

Все ошибки возвращаются в едином формате:

```json
{
  "error": "Человекочитаемое описание ошибки"
}
```

При ошибках валидации Zod (400 Bad Request):

```json
{
  "error": {
    "fieldErrors": {
      "name": ["Название обязательно"],
      "price": ["Цена должна быть больше 0"]
    }
  }
}
```

---

## 5. Миграция с текущей схемы

### Что меняется

| Текущая модель   | Действие                                                       |
|------------------|----------------------------------------------------------------|
| `OrderStatus`    | Расширить: добавить `PROCESSING`, `ASSEMBLED`, `DELIVERING`, `COMPLETED` |
| `ApplicationStatus` | Переименовать в `PartnerStatus` (или оставить для услуг, создать отдельный) |
| `Application`    | Оставить для услуг; создать `PartnerApplication` для арендодателей |
| `Product`        | Добавить поля: `categoryId`, `height`, `heightLabel`, `sort`, `careGuide`, `reserved`, `sku`, `costPrice`, `isNew` |
| `SalePoint`      | Добавить поля: `lat`, `lng`, `workingHours`, `phone`, `description`, `isActive` |
| `Order`          | Добавить поля: `userId`, customer*, delivery*, status'ы, таймеры |
| `Review`         | Добавить поле `productId` |

### Шаги миграции

1. Создать новые модели, не удаляя старые поля.
2. Добавить nullable поля в существующие модели.
3. Выполнить `prisma migrate dev` для генерации SQL.
4. Заполнить данные по умолчанию (seed-скрипт).
5. Удалить устаревшие поля после проверки (опционально, можно оставить).
