# Карта подключения к бэкенду

Ниже наблюдаемые пути из текущей сборки и демо-адаптера. Это ориентир для сверки с существующим API, не подтверждённый серверный контракт. Административные операции из bundle намеренно не рассматриваются как задача переноса витрины.

| Функция | Наблюдаемый путь / метод | Что сверить |
|---|---|---|
| Каталог | GET `/products` | categoryId, search, sort, page, limit; массив или пагинация |
| Товар | GET `/products/:id` | Поля, варианты высоты, изображения, наличие |
| Похожие | GET `/products/:id/related` | Массив товаров |
| Категории | GET `/categories`, `/categories/:id` | Иерархия, id/slug |
| Базары | GET `/sale-points`, `/sale-points/:id` | isActive, адрес, часы, координаты при наличии |
| Отзывы | GET `/reviews/published` | Формат опубликованных отзывов |
| Оптовые цены | GET `/wholesale/prices/public` | Настоящие типы ответа |
| Корзина | GET `/cart` | items, totalAmount |
| Добавление | POST `/cart/items` | productId, quantity |
| Количество | PUT `/cart/items/:id` | quantity и серверные ограничения |
| Удаление | DELETE `/cart/items/:id`, `/cart` | Ответ и пересчёт |
| Регистрация / вход | POST `/auth/register`, `/auth/login` | Валидация, cookie/токены, ошибки |
| Профиль | GET/PUT `/auth/me` | Сессия, права, аватар/multipart при необходимости |
| Заказ | POST `/orders` | Полный серверный DTO, цены, доставка, резерв и идемпотентность |
| История | GET `/orders/my`, `/orders/history` | Пагинация, статусы |
| Статус заказа | GET `/orders/:id/status` | Доступ только владельцу |
| Партнёры | POST `/partner-applications` | multipart, документы, согласия |
| Заявки партнёра | GET `/partner-applications/my` | Состояния кабинета |
| Оптовая заявка | POST `/cp-requests` | Серверный DTO |
| Рассылка | POST `/newsletter/subscribe` | email, согласие, ответ |

В демонстрации адаптер удаляет начальный `/api` из URL. Проверить реальный baseURL/proxy исходного приложения. Не направлять всё `/api/*` на SPA fallback. API оплаты, доставки, промокодов и синхронизации остатков с ботом не реализованы этим пакетом; использовать существующую серверную интеграцию после сверки.

## Поля демонстрационных данных

Product: `id, sku, name, description, careGuide, height, heightLabel, sort, price, inStock, isHit, isNew, available, categoryId, category, salePointId, salePoint, images`.

Category: `id, name, slug, imageKey, imageUrl, parentId, parent, children, sortOrder, createdAt`.

SalePoint: `id, shortName, address, phone, imageUrl, isActive, workingHours`.

Демо-корзина: `{items: [{id, productId, quantity, product, price}], totalAmount}`. Это форма ответа адаптера, а не обещание совпадения с реальным API.

Важные границы: реальные цена, остаток и стоимость заказа определяются сервером. Демо-флаги `available`/`inStock` нельзя использовать как источник актуального склада. Существующие id товаров и URL сохранять либо явно мигрировать, чтобы не сломать ссылки.
