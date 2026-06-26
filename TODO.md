# TODO — План реализации MVP (4 недели)

> **Условные обозначения:**
> - [ ] — не начато
> - [~] — в процессе
> - [x] — готово
> - :star: — критично для MVP
> - :bulb: — best-practice решение (детали в ARCHITECTURE.md)

---

## Неделя 1. Фундамент :star:

### 1.1. База данных — расширение схемы

- [x] PostgreSQL + Prisma — базовая схема (продукты, заказы, точки продаж)
- [ ] :star: **Модель `User`** — таблица пользователей с ролями:
  - Роли: `CUSTOMER`, `WHOLESALE`, `PARTNER`, `MANAGER`, `ADMIN`
  - Поля: `email`, `passwordHash`, `name`, `phone`, `role`, `wholesaleApproved`
  - :bulb: Единая таблица пользователей с полем `role` (enum), а не отдельные таблицы — проще миграции и аутентификация
- [ ] :star: **Модель `Category`** — дерево категорий (adjacency list):
  - `parentId` → ссылка на родительскую категорию
  - Категории ТЗ: «Российские ели/сосны», «Пихты», «Лапники», «Подставки»
- [ ] :star: **Добавить поля в `Product`:**
  - `categoryId` → Category
  - `height` — высота ёлки (число, см), поле для фильтра
  - `heightLabel` — человекочитаемая высота («1.5–2 м»)
  - `sort` — сорт/разновидность (Русская ель, Голубая ель, etc.)
  - `careGuide` — Markdown-текст рекомендаций по уходу
  - `reserved` — зарезервированное количество (для корзины)
  - `sku` — артикул для учёта
  - `costPrice` — закупочная цена (для расчёта маржинальности в админке)
- [ ] :star: **Добавить поля в `SalePoint`:**
  - `lat`, `lng` — координаты для Яндекс.Карт
  - `workingHours` — JSON: `{ open: "09:00", close: "22:00", startDate: "2025-12-15", endDate: "2025-12-31" }`
  - `phone`, `description`
  - `isActive`
- [ ] :star: **Расширить `Order`:**
  - `userId` → User (nullable — гость может оформить без регистрации)
  - `customerName`, `customerPhone`, `customerEmail`
  - `status` → расширенный enum: `PENDING`, `PAID`, `PROCESSING`, `ASSEMBLED`, `DELIVERING`, `COMPLETED`, `CANCELLED`
  - `cancelReason` — причина отмены
  - `deliveryType`: `SELF_PICKUP` | `COURIER`
  - `salePointId` → SalePoint (для самовывоза)
  - `deliveryAddress` — адрес доставки
  - `deliveryZoneId` → DeliveryZone
  - `deliveryCost` — стоимость доставки
  - `cartReservedUntil` — до какого времени товар зарезервирован (20 мин)
  - `paymentExpiresAt` — до какого времени ждать оплату (30 мин)
- [ ] :star: **Новая модель `DeliveryZone`:**
  - `name`, `basePrice`, `perKmPrice`, `polygon` (JSON-массив координат)
  - :bulb: Зоны доставки — полигоны. Определяем принадлежность адреса зоне по API геокодера (Яндекс / DaData), затем считаем стоимость.
- [ ] :star: **Новая модель `WholesalePrice`:**
  - `productId`, `minQuantity`, `price`
  - :bulb: Один продукт может иметь несколько оптовых цен для разных объёмов закупки.
- [ ] :star: **Новая модель `PartnerApplication`:**
  - Заменяет текущую модель `Application` (переименовать, т.к. `Application` сейчас — это заявки на услуги)
  - Поля: `userId`, `organizationName`, `contactName`, `phone`, `email`, `landAddress`, `landArea`, `description`, `status`
- [ ] :star: **Новая модель `PartnerDocument`:**
  - `partnerApplicationId`, `key` (MinIO), `type` (CONTRACT, PHOTO, OTHER)
- [ ] :star: **Новая модель `PromoBanner`** — акционные баннеры на главной:
  - `title`, `subtitle`, `imageKey`, `linkUrl`, `isActive`, `sortOrder`, `startDate`, `endDate`
- [ ] :star: **Добавить модель `Review.productId`** — связь отзыва с конкретным товаром (сейчас отзывы глобальные)
- [ ] :star: **Добавить `passwordHash` в модель `User`** — bcrypt с солью (cost factor = 10)

### 1.2. Верстка главной страницы и каталога

- [x] Главная страница с секциями: Hero, FeaturedProducts, StickyShowcase, Benefits, Stats, HowItWorks, Testimonials, FAQ, Newsletter, FinalCta
- [x] Базовый Header и Footer
- [x] Роутинг: 12 страниц (Home, Catalog, Product, Cart, Checkout, Profile, Login, Register, About, Wholesale, SalePoints, Partners)
- [x] Адаптивная вёрстка: Mobile First (375px, 768px, 1024px, 1440px), safe-area, touch targets 44px
- [x] Дизайн-система: luxury-палитра (чёрный + золотой), Cormorant / Playfair Display / Inter, glass-эффекты
- [x] Анимации: parallax, 3D tilt карточек, scroll-reveal, посимвольный reveal, SVG-кольца прогресса, рисующаяся линия таймлайна
- [x] API-слой: apiClient (Axios), endpoints (products, cart, stats, newsletter), TanStack Query хуки
- [x] Контексты: AuthContext (sessionStorage), CartContext (useReducer)
- [ ] Добавить сезонное оформление:
  - Тёмно-зелёная + красная + золотая цветовая схема в `tailwind.config.ts`
  - Падающий снег (CSS-анимация / canvas), :bulb: с кнопкой отключения (`localStorage`)
  - Таймер обратного отсчёта до Нового года (React-компонент с `useEffect` + `setInterval`)
- [~] Каталог товаров:
  - [x] Фильтры по категориям + сортировка (Sticky-панель в CatalogPage)
  - [ ] Древовидное меню категорий (запрос `GET /api/categories`)
  - [ ] Фильтры по высоте (`heightMin` / `heightMax`), цене, наличию
  - [ ] Пагинация (cursor-based или offset)
- [~] Карточка товара (`/products/:id`):
  - [x] Базовый макет (фото, название, цена, характеристики)
  - [ ] Галерея с лайтбоксом (увеличение по клику)
  - [ ] Выбор высоты (селект) с пересчётом цены
  - [ ] Калькулятор доставки (выбор адреса → запрос зоны → расчёт)
  - [ ] Блок «С этим покупают» (cross-sell)
  - [ ] Описание сорта + уход (рендеринг Markdown)

### 1.3. Аутентификация и роли

- [x] Базовая аутентификация админа (JWT, логин/пароль из `.env`)
- [ ] :star: Регистрация покупателя:
  - `POST /api/auth/register` — email + password + name → создание User + JWT
  - :bulb: Подтверждение email через sendgrid/resend (TODO: пост-MVP, на старте без подтверждения)
- [ ] :star: Логин покупателя:
  - `POST /api/auth/login` — email + password → JWT (для всех ролей, объединить с админским)
  - :bulb: Единый эндпоинт логина — JWT содержит `role`, фронтенд сам решает куда редиректить
- [ ] :star: Auth middleware по ролям:
  - `authMiddleware` — любой авторизованный
  - `requireRole('ADMIN', 'MANAGER')` — сотрудники компании
- [ ] :star: Личный кабинет покупателя:
  - [x] Frontend: ProfilePage с защищённым роутом, отображением профиля и заказов
  - [ ] `GET /api/auth/me` — профиль
  - [ ] `PUT /api/auth/me` — редактирование профиля
  - [ ] `GET /api/orders/my` — история заказов текущего пользователя

---

## Неделя 2. Процесс покупки :star:

### 2.1. Корзина и резервирование

- [x] Базовый `POST /api/orders` с проверкой остатков
- [ ] :star: **Резервирование товара на 20 минут:**
  - При создании заказа — атомарный UPDATE: `UPDATE Product SET reserved = reserved + qty WHERE id = ? AND quantity - reserved >= qty`
  - Запись `Order.cartReservedUntil = NOW() + 20 min`
  - `setTimeout` на 20 мин → отмена заказа и возврат `reserved` (с рекавери при рестарте)
  - :bulb: Резервирование в БД, а не Redis — см. ARCHITECTURE.md §9.1
- [ ] **Отображение таймера в корзине** — обратный отсчёт 20 мин, по истечении — модальное окно «Время вышло»
- [ ] **Блокировка повторной оплаты** — если заказ уже `PAID`, повторный платёж отклоняется

### 2.2. Оформление заказа (Checkout)

- [~] Форма оформления заказа:
  - [x] Frontend: CheckoutPage с формой (контакты, способ получения, адрес)
  - [ ] Валидация полей, отправка `POST /api/orders`
  - [ ] Самовывоз: выбор точки на интерактивной карте
  - [ ] Доставка: ввод адреса → определение зоны → расчёт стоимости
- [ ] Интеграция геокодера:
  - :bulb: Яндекс.Геокодер или DaData для преобразования адреса в координаты
  - Проверка вхождения координат в полигон зоны доставки (библиотека `point-in-polygon`)
- [ ] Платёж через Точка Банк:
  - Редирект на `paymentLink` после создания заказа
  - Страницы успеха / ошибки оплаты (`/payment/success`, `/payment/fail`)
  - :bulb: polling статуса заказа каждые 3 секунды на странице успеха (fallback если вебхук не дошёл)
- [ ] **Таймер оплаты 30 минут:**
  - `Order.paymentExpiresAt = NOW() + 30 min`
  - `setTimeout` → отмена заказа, возврат `reserved`
  - Индикатор на фронтенде: «Оплатите заказ до 14:35»

### 2.3. Интеграция Точка Банк

- [x] Создание платёжной ссылки (`tochkaService.createPaymentLink`)
- [x] Вебхук `acquiringInternetPayment`
- [x] Ручная проверка статуса (`GET /api/webhooks/tochka/confirm/:orderId`)
- [ ] :star: **Проверка цифровой подписи вебхука:**
  - HMAC-SHA256 с `TOCHKA_WEBHOOK_SECRET`
  - Сравнение с заголовком `X-Tochka-Signature`
  - Отклонение запроса при несовпадении
  - :bulb: Требование ТЗ §7 — обязательная проверка подписи
- [ ] Обработка ошибок:
  - Retry при недоступности API Точка Банк (3 попытки с экспоненциальной задержкой)
  - Логирование всех ответов для аудита

### 2.4. Админ-панель (управление товарами)

- [x] CRUD товаров (список, создание, редактирование, удаление)
- [x] Загрузка изображений в MinIO
- [ ] :star: **Массовая загрузка товаров из Excel:**
  - `POST /api/products/import` — принимает `.xlsx`, парсит (библиотека `xlsx`), создаёт товары пачкой
  - Шаблон Excel-файла для скачивания в админке
  - :bulb: Использовать потоковый парсинг для больших файлов
- [ ] **Управление категориями:**
  - CRUD категорий в админке
  - Древовидное отображение с drag-and-drop для сортировки
- [ ] **Управление остатками:**
  - Отображение `quantity`, `reserved`, `available = quantity - reserved`
  - Ручная корректировка остатков с записью причины

---

## Неделя 3. Точки продаж и Партнёры :star:

### 3.1. Интерактивная карта ёлочных базаров

- [x] CRUD точек продаж
- [~] :star: **Яндекс.Карты на фронтенде:**
  - [x] Frontend: `/bases` страница со списком точек и картой-заглушкой
  - [ ] Подключение Яндекс.Карты API v3
- [ ] **Выбор точки при оформлении заказа:**
  - Мини-карта в чекауте
  - Сохранение `salePointId` в заказе

### 3.2. B2B-раздел «Сотрудничество» (арендодатели)

- [~] :star: **Лендинг для арендодателей:**
  - [x] Frontend: `/partners` — условия, выгоды, форма с фото-загрузкой
  - [ ] `POST /api/partner-applications` — создание заявки со статусом NEW
  - [ ] Фото-загрузка через multer → MinIO
- [ ] :star: **Личный кабинет арендодателя:**
  - Регистрация / вход как `PARTNER`
  - `GET /api/partner-applications/my` — список заявок партнёра
  - `GET /api/partner-applications/:id` — детали заявки + статус
  - Скачивание договора (`GET /api/partner-applications/:id/documents/:docId/download`)
- [ ] **Модерация партнёров в админке:**
  - Страница заявок со статусами: NEW → IN_PROGRESS → APPROVED / REJECTED
  - Загрузка подписанного договора (PDF в MinIO)
  - Смена статуса с комментарием для партнёра

### 3.3. Telegram-бот для менеджеров

- [x] Отправка уведомлений о новом заказе и оплате
- [ ] :star: **Управление заказами через бота:**
  - Inline-кнопки под сообщением о заказе: «Собран», «Доставляется», «Выполнен», «Отменить»
  - При нажатии «Отменить» — запрос причины отмены
  - Вызов API бэкенда для смены статуса
  - :bulb: Telegram Bot API + webhook на `/api/webhooks/telegram` для приёма callback_query
- [ ] :star: **Команда `/today`** — выручка за текущий день:
  - Запрос к БД: `SUM(totalAmount) WHERE status IN ('PAID', 'PROCESSING', 'ASSEMBLED', 'DELIVERING', 'COMPLETED') AND updatedAt::date = TODAY`
- [ ] **Уведомления о возвратах и ошибках:**
  - `notifyPaymentError` — ошибка оплаты
  - `notifyCancellation` — заказ отменён (с причиной)

### 3.4. Дашборд в админ-панели

- [ ] :star: **Панель показателей (`/admin/dashboard`):**
  - Выручка за день / неделю / месяц
  - Новые заказы (счётчик PENDING / PAID)
  - Топ-5 товаров по продажам
  - Остатки по точкам (таблица)
  - :bulb: Отдельный эндпоинт `GET /api/stats/dashboard` с агрегированными данными (один SQL-запрос с GROUP BY, не дёргать N раз)
- [ ] **Графики (опционально):**
  - Recharts для визуализации выручки по дням

---

## Неделя 4. Опт и стабилизация :star:

### 4.1. Личный кабинет оптового покупателя

- [ ] :star: **Регистрация оптовика:**
  - Форма `/wholesale/register` — компания, ИНН, контакты
  - Роль `WHOLESALE` + флаг `wholesaleApproved: false`
  - Модерация админом → `wholesaleApproved: true`
- [ ] :star: **Скрытые оптовые цены:**
  - При `role === WHOLESALE && wholesaleApproved` — подстановка `WholesalePrice` вместо `Product.price`
  - :bulb: Вычисление на уровне API: `GET /api/products` для оптовика возвращает поле `yourPrice` (минимальная цена для его минимального объёма)
- [~] :star: **Таблица оптовых цен:**
  - [x] Frontend: `/wholesale` — таблица «высота × объём», форма запроса КП
  - [ ] Данные из `WholesalePrice` (пока статические)
- [~] :star: **Запрос коммерческого предложения (КП):**
  - [x] Frontend: форма с полями организации, контактов, комментария
  - [ ] `POST /api/cp-requests` + уведомление в Telegram

### 4.2. Учёт остатков по точкам

- [ ] :star: **Привязка товара к точке продаж:**
  - `Product.salePointId` — уже есть, нужно добавить учёт `quantity` по каждой точке
  - При создании заказа с самовывозом — списание остатков с конкретной точки
  - :bulb: Если товар не привязан к точке — он «на складе», доступен для доставки
- [ ] **Управление остатками по точкам в админке:**
  - Таблица: точка × товар × остаток

### 4.3. Финальное тестирование и стабилизация

- [ ] **Нагрузочное тестирование:**
  - k6 / autocannon: симуляция 100 одновременных покупателей
  - Проверка атомарности резервирования (parallel requests на последний товар)
  - :bulb: Критично: двойная продажа одного товара = репутационные потери
- [ ] **Security-аудит:**
  - Проверка всех эндпоинтов на наличие authMiddleware
  - Валидация всех входных данных через Zod (нет сырых `req.body`)
  - CSP-заголовки для фронтенда
  - Rate limiting на `/api/auth/login` и `/api/orders`
- [ ] **SEO и мета-теги:**
  - Open Graph / Twitter Cards
  - Динамические `<title>` и `<meta description>` для страниц товаров
  - Sitemap.xml (генерируется автоматически)
- [~] **Мобильная адаптация:**
  - [x] :star: Mobile First — все страницы адаптированы (375px+)
  - [x] Touch-friendly элементы (min 44×44px)
  - [x] safe-area-inset учтён
  - [x] `prefers-reduced-motion` + `pointer: coarse` учтены
  - [~] :star: Протестировать все страницы на iPhone SE и Samsung Galaxy (визуально)
  - [ ] Оптимизация изображений (srcset / WebP)
- [ ] **Документация API для фронтенда:**
  - OpenAPI / Swagger (автогенерация из Zod-схем)
  - `DATA_MODEL.md` — актуальная схема БД и список эндпоинтов

---

## Бэклог (пост-MVP)

- [ ] Онлайн-чат с менеджером (WebSocket / виджет)
- [ ] Система лояльности (скидки, промокоды)
- [ ] Интеграция с 2ГИС (второй провайдер карт)
- [ ] PWA: offline-каталог, push-уведомления о статусе заказа
- [ ] Мультиязычность
- [ ] Экспорт заказов в 1С / МойСклад
- [ ] Автоматическая фискализация через Точка Банк (54-ФЗ — чеки формирует банк, интеграция уже есть)
- [ ] Redis для корзины и сессий
- [ ] Elasticsearch / Meilisearch для поиска
