# STYLEGUIDE — Архитектурные правила проекта «Ели»

## 1. Структура директорий (FSD + Modular)

Каждый пакет (`frontend/`, `admin/`) следует единой структуре:

```
src/
├── api/                    # API-слой: HTTP-клиент, типы ответов, эндпоинты
│   ├── client.ts           #    fetch/axios инстанс + токен-менеджмент
│   ├── types.ts            #    интерфейсы ответов API
│   ├── endpoints/          #    эндпоинты по сущностям (один файл = одна сущность)
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   └── ...
│   └── index.ts            #    barrel export: реэкспорт всего публичного
├── types/                  # Общие типы (DTO, доменные модели — если не из API)
│   └── index.ts
├── constants/              # Константы приложения
│   └── app.ts
├── shared/                 # Переиспользуемое между модулями
│   ├── hooks/              #    общие хуки
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   ├── components/         #    общие UI-компоненты (кнопки, модалки, card, table)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   └── utils/              #    вспомогательные функции (форматирование дат, чисел)
│       ├── formatDate.ts
│       └── index.ts
├── components/             # Бизнес-компоненты (роутинг, layout, авторизация)
│   ├── ProtectedRoute/
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   └── AdminLayout/
│       ├── AdminLayout.tsx
│       ├── Sidebar.tsx
│       └── index.ts
├── pages/                  # Страницы — каждая в своей директории
│   ├── ProductsPage/
│   │   ├── ProductsPage.tsx      # страница-список
│   │   ├── ProductFormPage.tsx   # страница-форма
│   │   ├── hooks/                # логика и работа с API
│   │   │   ├── useProducts.ts
│   │   │   └── useProductForm.ts
│   │   ├── ui/                   # UI-компоненты этой страницы
│   │   │   ├── ProductTable.tsx
│   │   │   └── ProductImageManager.tsx
│   │   └── index.ts              # barrel export
│   └── ...
├── context/                # React Context'ы (Auth и т.д.)
├── App.tsx
├── main.tsx
└── index.css
```

## 2. Правила

### 2.1. Один файл — один компонент / хук / функция

- Каждый компонент, хук или утилита живёт в **отдельном файле**.
- Файл называется по имени экспортируемой сущности: `ProductTable.tsx` → `export function ProductTable`.
- **Файл не должен превышать 200 строк**. Если компонент начинает распухать — выноси подкомпоненты в `ui/`, логику в `hooks/`, хелперы в `utils/`.

### 2.2. Страницы — директории с модулями

Каждая страница — директория внутри `pages/`:

```
pages/ProductsPage/
├── ProductsPage.tsx       # корневой компонент страницы (роутинг, композиция)
├── ProductFormPage.tsx    # форма создания/редактирования
├── hooks/
│   ├── useProducts.ts     # загрузка списка, удаление, CRUD-операции
│   └── useProductForm.ts  # логика формы (состояние, валидация, submit)
├── ui/
│   ├── ProductTable.tsx   # таблица товаров
│   └── ProductImageManager.tsx  # загрузка/сортировка картинок
└── index.ts               # barrel export
```

### 2.3. Хуки — вся логика и работа с сервером

- **Хук = единица переиспользуемой логики.** Один хук делает одно дело.
- Внутри хука: `useState` для данных/loading/error, `useEffect`/`useCallback` для сайд-эффектов, вызовы API.
- Хук возвращает `{ data, loading, error, actions }` — компонент только рендерит.
- Хуки, специфичные для страницы, лежат в `pages/PageName/hooks/`.
- Общие хуки — в `shared/hooks/`.

```typescript
// pages/ProductsPage/hooks/useProducts.ts
export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await api.getProducts()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteProduct(id);
    setData(prev => prev.filter(p => p.id !== id));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, remove };
}
```

### 2.4. API-слой — разделение на client, types, endpoints

- **`api/client.ts`** — HTTP-клиент (fetch wrapper или axios instance), управление токеном, перехват ошибок.
- **`api/types.ts`** — все интерфейсы ответов API (DTO).
- **`api/endpoints/*.ts`** — один файл на сущность, содержит функции-запросы.
- **`api/index.ts`** — barrel export.

```typescript
// api/client.ts
export async function apiRequest<T>(path: string, opts?: RequestInit): Promise<T> { ... }

// api/endpoints/products.ts
export function getProducts(params?: ProductFilters) {
  return apiRequest<Product[]>("/products?" + qs(params));
}
export function createProduct(data: CreateProductDto) {
  return apiRequest<Product>("/products", { method: "POST", body: JSON.stringify(data) });
}
```

### 2.5. Barrel exports (`index.ts`)

Каждая директория с несколькими файлами ОБЯЗАНА иметь `index.ts` с реэкспортом публичного API:

```typescript
// pages/ProductsPage/index.ts
export { ProductsPage } from "./ProductsPage";
export { ProductFormPage } from "./ProductFormPage";
```

Импорты в других файлах всегда идут через `index.ts`:

```typescript
// ✅ правильно
import { ProductsPage, ProductFormPage } from "@/pages/ProductsPage";

// ❌ неправильно
import { ProductsPage } from "@/pages/ProductsPage/ProductsPage";
```

### 2.6. Именование

- **Компоненты:** PascalCase — `ProductTable`, `AdminLayout`
- **Хуки:** camelCase с префиксом `use` — `useProducts`, `useDebounce`
- **Функции API:** camelCase — `getProducts`, `createProduct`
- **Типы/интерфейсы:** PascalCase — `Product`, `OrderStatus`
- **Файлы компонентов:** PascalCase.tsx — `ProductTable.tsx`
- **Файлы хуков/утилит:** camelCase.ts — `useProducts.ts`, `formatDate.ts`

### 2.7. Пути импортов — алиасы `@/`

- Настроить `@` → `src/` в tsconfig + vite.config.
- Все внутренние импорты — только через `@/`.
- Никаких `../../../` в импортах.

```typescript
// ✅ правильно
import { api } from "@/api";
import { useProducts } from "@/pages/ProductsPage/hooks/useProducts";

// ❌ неправильно
import { api } from "../../api";
```

### 2.8. Стили

- **Frontend:** TailwindCSS (как уже используется).
- **Admin:** Plain CSS с утилитарными классами в `index.css` (`.card`, `.btn`, `.table`, `.form-group`, `.badge`, `.stats-grid`, и т.д.).
- Никаких CSS-модулей, styled-components — сохраняем консистентность внутри пакета.

### 2.9. Без дефолтных экспортов

- Всегда именованные экспорты (`export function` / `export const`).
- Никаких `export default`.

## 3. Чеклист при создании новой страницы

- [ ] Создана директория `pages/NewPage/`
- [ ] `NewPage.tsx` — корневой компонент (композиция, layout)
- [ ] `hooks/useNewPage.ts` — вся логика и работа с API
- [ ] `ui/NewPageTable.tsx` (и другие UI-компоненты) — чистая презентация
- [ ] `index.ts` — barrel export
- [ ] Эндпоинты вынесены в `api/endpoints/new-entity.ts`
- [ ] Типы в `api/types.ts`
- [ ] Ни один файл не превышает 200 строк
- [ ] Все импорты через `@/`
- [ ] Именованные экспорты
