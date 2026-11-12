type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

interface EndpointOptions {
  summary: string;
  secured?: boolean;
  hvoyaKey?: boolean;
  body?: Record<string, unknown>;
}

const hvoyaKeyParameter = {
  name: "X-Hvoya-Key",
  in: "header",
  required: true,
  description: "Значение HVOYA_INTEGRATION_KEY с сервера",
  schema: { type: "string", example: "вставьте ключ из HVOYA_INTEGRATION_KEY" },
};

const hvoyaTokenParameter = {
  name: "Authorization",
  in: "header",
  required: true,
  description: "Суточный токен из ответа POST /api/hvoya/auth/confirm. Слово Bearer и значение token через пробел",
  schema: { type: "string", example: "Bearer вставьте token из ответа confirm" },
};

function endpoint(
  tag: string,
  { summary, secured = false, hvoyaKey = false, body }: EndpointOptions
) {
  const parameters = [
    ...(hvoyaKey ? [hvoyaKeyParameter] : []),
    ...(hvoyaKey && secured ? [hvoyaTokenParameter] : []),
  ];

  return {
    summary,
    tags: [tag],
    ...(secured && !hvoyaKey ? { security: [{ bearerAuth: [] }] } : {}),
    ...(parameters.length > 0 ? { parameters } : {}),
    ...(body
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: body },
            },
          },
        }
      : {}),
    responses: {
      "200": { description: "Успешный ответ" },
      "201": { description: "Создано" },
      "400": { description: "Ошибка валидации" },
      "401": { description: "Требуется авторизация" },
      "404": { description: "Не найдено" },
    },
  };
}

function routes(
  tag: string,
  items: Array<[string, Partial<Record<HttpMethod, EndpointOptions>>]>
) {
  const paths: Record<string, Record<string, unknown>> = {};

  for (const [path, methods] of items) {
    paths[path] = {};
    for (const [method, options] of Object.entries(methods)) {
      if (options) {
        paths[path][method] = endpoint(tag, options);
      }
    }
  }

  return paths;
}

export function createOpenApiDocument(apiUrl: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Премиумель API",
      version: "1.0.0",
      description:
        "REST API интернет-магазина ёлок. Эндпоинты с замком требуют заголовок `Authorization: Bearer <token>`.",
    },
    servers: [{ url: apiUrl }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        HvoyaStockItem: {
          type: "object",
          required: ["sku", "quantity"],
          properties: {
            sku: { type: "string", example: "nordman:4" },
            quantity: { type: "integer", minimum: 0, example: 12 },
            name: { type: "string", example: "Пихта Нордмана" },
            kind: { type: "string", enum: ["tree", "bough", "stand"], example: "tree" },
            variant: { type: "string", example: "200–225 см" },
            grade: { type: "string", example: "Стандарт" },
            unit: { type: "string", example: "шт." },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Проверка работоспособности",
          tags: ["Система"],
          responses: {
            "200": {
              description: "Сервис доступен",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { status: { type: "string", example: "ok" } },
                  },
                },
              },
            },
          },
        },
      },
      ...routes("Аутентификация", [
        ["/api/auth/register", { post: { summary: "Регистрация покупателя" } }],
        ["/api/auth/login", { post: { summary: "Вход (покупатель или админ)" } }],
        ["/api/auth/me", { get: { summary: "Профиль", secured: true }, put: { summary: "Обновить профиль", secured: true } }],
      ]),
      ...routes("Товары", [
        ["/api/products", { get: { summary: "Список товаров" }, post: { summary: "Создать товар", secured: true } }],
        ["/api/products/{id}", { get: { summary: "Карточка товара" }, put: { summary: "Обновить товар", secured: true }, delete: { summary: "Удалить товар", secured: true } }],
        ["/api/products/{id}/related", { get: { summary: "Похожие товары" } }],
        ["/api/products/{id}/images", { post: { summary: "Загрузить изображения", secured: true } }],
        ["/api/products/{id}/images/{imgId}", { delete: { summary: "Удалить изображение", secured: true } }],
      ]),
      ...routes("Категории", [
        ["/api/categories", { get: { summary: "Дерево категорий" }, post: { summary: "Создать категорию", secured: true } }],
        ["/api/categories/{id}", { get: { summary: "Категория" }, put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Корзина", [
        ["/api/cart", { get: { summary: "Текущая корзина" }, delete: { summary: "Очистить корзину" } }],
        ["/api/cart/items", { post: { summary: "Добавить товар" } }],
        ["/api/cart/items/{productId}", { put: { summary: "Изменить количество" }, delete: { summary: "Удалить позицию" } }],
      ]),
      ...routes("Заказы", [
        ["/api/orders", { post: { summary: "Создать заказ и получить ссылку на оплату" } }],
        ["/api/orders/my", { get: { summary: "Мои заказы", secured: true } }],
        ["/api/orders/history", { get: { summary: "Все заказы (админка)", secured: true } }],
        ["/api/orders/{id}", { get: { summary: "Детали заказа" } }],
        ["/api/orders/{id}/status", { get: { summary: "Статус заказа" }, patch: { summary: "Сменить статус", secured: true } }],
        ["/api/orders/{id}/cancel", { post: { summary: "Отменить заказ", secured: true } }],
      ]),
      ...routes("Хвоя", [
        ["/api/hvoya/auth/request-code", { post: { summary: "Отправить суточный код на почту", hvoyaKey: true } }],
        ["/api/hvoya/auth/confirm", {
          post: {
            summary: "Подтвердить код и получить токен на 24 часа",
            hvoyaKey: true,
            body: {
              type: "object",
              required: ["code"],
              properties: {
                code: {
                  type: "string",
                  description: "Шестизначный код из письма",
                  example: "123456",
                  minLength: 6,
                  maxLength: 6,
                },
              },
            },
          },
        }],
        ["/api/hvoya/auth/status", { get: { summary: "Статус суточного доступа", hvoyaKey: true } }],
        ["/api/hvoya/stock", {
          put: {
            summary: "Общий остаток по SKU",
            hvoyaKey: true,
            secured: true,
            body: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HvoyaStockItem" },
                },
              },
            },
          },
        }],
        ["/api/hvoya/locations/stock", {
          get: { summary: "Остатки по точкам", hvoyaKey: true, secured: true },
          put: {
            summary: "Заменить остатки по точкам",
            hvoyaKey: true,
            secured: true,
            body: {
              type: "object",
              required: ["locations"],
              properties: {
                locations: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["code", "items"],
                    properties: {
                      code: {
                        type: "string",
                        enum: ["lapino", "vnukovo", "riga", "rogozino"],
                      },
                      items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/HvoyaStockItem" },
                      },
                    },
                  },
                },
              },
            },
          },
        }],
        ["/api/hvoya/operations", {
          post: {
            summary: "Поставка, продажа, отмена, перемещение или корректировка",
            hvoyaKey: true,
            secured: true,
            body: {
              type: "object",
              required: ["id", "type", "items"],
              properties: {
                id: { type: "string", example: "sale-1001" },
                type: {
                  type: "string",
                  enum: [
                    "supply",
                    "sale",
                    "sale_cancel",
                    "sale_correction",
                    "transfer",
                    "transfer_cancel",
                    "adjustment",
                  ],
                },
                channel: { type: "string", enum: ["offline", "online"] },
                payment: { type: "string", enum: ["cash", "cashless"] },
                locationCode: { type: "string", enum: ["lapino", "vnukovo", "riga", "rogozino"] },
                sourceLocationCode: { type: "string", enum: ["lapino", "vnukovo", "riga", "rogozino"] },
                targetLocationCode: { type: "string", enum: ["lapino", "vnukovo", "riga", "rogozino"] },
                previousLocationCode: { type: "string", enum: ["lapino", "vnukovo", "riga", "rogozino"] },
                items: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HvoyaStockItem" },
                },
                previousItems: {
                  type: "array",
                  items: { $ref: "#/components/schemas/HvoyaStockItem" },
                },
              },
            },
          },
        }],
      ]),
      ...routes("Точки продаж", [
        ["/api/sale-points", { get: { summary: "Список точек" }, post: { summary: "Создать точку", secured: true } }],
        ["/api/sale-points/{id}", { get: { summary: "Детали точки" }, put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
        ["/api/sale-points/{id}/image", { post: { summary: "Загрузить фото", secured: true }, delete: { summary: "Удалить фото", secured: true } }],
      ]),
      ...routes("Зоны доставки", [
        ["/api/delivery-zones", { get: { summary: "Список зон" }, post: { summary: "Создать зону", secured: true } }],
        ["/api/delivery-zones/check", { get: { summary: "Определить зону по координатам" } }],
        ["/api/delivery-zones/{id}", { get: { summary: "Зона" }, put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Опт", [
        ["/api/wholesale/prices/public", { get: { summary: "Публичная таблица оптовых цен" } }],
        ["/api/wholesale/prices", { get: { summary: "Оптовые цены", secured: true }, post: { summary: "Добавить цену", secured: true } }],
        ["/api/wholesale/prices/{id}", { put: { summary: "Обновить цену", secured: true }, delete: { summary: "Удалить цену", secured: true } }],
      ]),
      ...routes("Запросы КП", [
        ["/api/cp-requests", { get: { summary: "Список запросов", secured: true }, post: { summary: "Отправить запрос КП" } }],
        ["/api/cp-requests/{id}", { patch: { summary: "Обработать запрос", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Партнёры", [
        ["/api/partner-applications", { get: { summary: "Все заявки", secured: true }, post: { summary: "Подать заявку" } }],
        ["/api/partner-applications/my", { get: { summary: "Мои заявки", secured: true } }],
        ["/api/partner-applications/{id}", { get: { summary: "Детали заявки", secured: true }, delete: { summary: "Удалить", secured: true } }],
        ["/api/partner-applications/{id}/status", { patch: { summary: "Сменить статус", secured: true } }],
        ["/api/partner-applications/{id}/documents", { post: { summary: "Загрузить документ", secured: true } }],
        ["/api/partner-applications/{id}/documents/{docId}/download", { get: { summary: "Скачать документ", secured: true } }],
        ["/api/partner-applications/{id}/documents/{docId}", { delete: { summary: "Удалить документ", secured: true } }],
      ]),
      ...routes("Отзывы", [
        ["/api/reviews/published", { get: { summary: "Опубликованные отзывы" } }],
        ["/api/reviews", { get: { summary: "Все отзывы", secured: true }, post: { summary: "Оставить отзыв", secured: true } }],
        ["/api/reviews/{id}", { get: { summary: "Отзыв", secured: true }, put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
        ["/api/reviews/{id}/publish", { patch: { summary: "Опубликовать / скрыть", secured: true } }],
      ]),
      ...routes("Статистика", [
        ["/api/stats/dashboard", { get: { summary: "Показатели дашборда", secured: true } }],
      ]),
      ...routes("Баннеры", [
        ["/api/banners/active", { get: { summary: "Активные баннеры" } }],
        ["/api/banners", { get: { summary: "Все баннеры", secured: true }, post: { summary: "Создать баннер", secured: true } }],
        ["/api/banners/{id}", { put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
        ["/api/banners/{id}/image", { post: { summary: "Загрузить изображение", secured: true }, delete: { summary: "Удалить изображение", secured: true } }],
      ]),
      ...routes("Вебхуки", [
        ["/api/webhooks/tochka", { post: { summary: "Вебхук Точка Банк" } }],
        ["/api/webhooks/tochka/confirm/{orderId}", { post: { summary: "Проверка оплаты" } }],
      ]),
      ...routes("Услуги", [
        ["/api/services", { get: { summary: "Список услуг" }, post: { summary: "Создать услугу", secured: true } }],
        ["/api/services/active", { get: { summary: "Активные услуги" } }],
        ["/api/services/{id}", { get: { summary: "Услуга" }, put: { summary: "Обновить", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Заявки", [
        ["/api/applications", { get: { summary: "Все заявки", secured: true }, post: { summary: "Оставить заявку" } }],
        ["/api/applications/{id}", { patch: { summary: "Сменить статус", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Обратная связь", [
        ["/api/feedback", { get: { summary: "Все обращения", secured: true }, post: { summary: "Отправить сообщение" } }],
        ["/api/feedback/{id}", { patch: { summary: "Пометить прочитанным", secured: true }, delete: { summary: "Удалить", secured: true } }],
      ]),
      ...routes("Файлы", [
        ["/api/files/{path}", { get: { summary: "Прокси к файлам MinIO" } }],
      ]),
    },
  };
}
