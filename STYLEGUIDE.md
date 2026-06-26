# STYLEGUIDE — Дизайн-система проекта «Ели»

## 1. Визуальная концепция

**Направление:** Премиальный люкс, внушающий доверие («Liquid Glass» + Luxury).  
**Целевая аудитория:** Розничные и оптовые покупатели живых ёлок, преимущественно с мобильных устройств (Mobile First).  
**Ключевые ощущения:** Качество, надёжность, праздник, тепло.

---

## 2. Цветовая палитра

### Основная палитра (luxury-база)

| Токен | HEX | Tailwind | Назначение |
|---|---|---|---|
| Основной | `#1C1917` | `primary` | Заголовки, тёмные фоны, футер |
| Основной светлый | `#44403C` | `primary-light` | Вторичные элементы, разделители |
| Основной тёмный | `#0C0A09` | `primary-dark` | Текст на светлом фоне |
| Акцентный | `#CA8A04` | `accent` | CTA-кнопки, акценты, золотой декор |
| Акцентный светлый | `#EAB308` | `accent-light` | Hover-состояния кнопок |
| Акцентный тёмный | `#A16207` | `accent-dark` | Насыщенный золотой |
| Фон | `#FAFAF9` | `surface` | Основной фон страниц |
| Фон тёмный | `#F5F5F4` | `surface-dark` | Альтернативный фон секций |
| Фон muted | `#E7E5E4` | `surface-muted` | Границы карточек, разделители |
| Текст | `#0C0A09` | `text` | Основной текст |
| Текст muted | `#78716C` | `text-muted` | Второстепенный текст |
| Текст инверсный | `#FAFAF9` | `text-inverse` | Текст на тёмном фоне |

### Сезонная палитра (праздничный режим, согласно ТЗ §6)

Сезонный режим включается в период **15–31 декабря** и активирует дополнительные токены поверх основной палитры:

| Токен | HEX | Tailwind (план) | Назначение |
|---|---|---|---|
| Зелёный праздничный | `#1A3C2A` | `festive-green` | Хвойный акцент, бейджи, баннеры |
| Красный праздничный | `#C41E3A` | `festive-red` | Акционные метки, таймеры, кнопки «Акция» |
| Золотой насыщенный | `#D4AF37` | `festive-gold` | Декоративные элементы, гирлянды |
| Снежно-белый | `#FEFEFE` | — | Фон праздничных баннеров |

**Правило:** Сезонные цвета используются точечно — для акционных баннеров и декора. Основная палитра остаётся неизменной.

---

## 3. Типографика

### Система шрифтов

| Роль | Шрифт | Tailwind-класс | Начертания |
|---|---|---|---|
| Display (hero, крупные заголовки) | Cormorant | `font-display` | 400, 500, 600, 700 + italic |
| Serif (заголовки секций, названия товаров) | Playfair Display | `font-serif` | 400, 500, 600, 700 |
| Sans (основной текст, UI-элементы) | Inter | `font-sans` | 300, 400, 500, 600, 700 |

### Типографическая шкала

| Уровень | Класс Tailwind | Размер | Применение |
|---|---|---|---|
| H1 hero | `text-4xl sm:text-6xl md:text-7xl lg:text-8xl` | 36–96px | Главный заголовок hero |
| H2 секция | `text-3xl sm:text-4xl md:text-5xl` | 30–48px | Заголовок секции |
| H3 карточка | `text-xl` | 20px | Название товара |
| Body large | `text-base sm:text-lg` | 16–18px | Подзаголовки, лид-текст |
| Body | `text-base` | 16px | Основной текст |
| Caption | `text-sm` | 14px | Второстепенный текст, даты |
| Label | `text-xs tracking-widest` | 12px | Латинские названия, uppercase-метки |

---

## 4. Компонентная библиотека

### Кнопки

```css
/* Основная CTA */
.btn-primary { bg-accent text-surface min-h-[44px] px-6 sm:px-8 py-3 transition-all duration-300
               hover:bg-accent-light active:scale-[0.98]
               disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/50 }

/* Обводная */
.btn-outline { border-2 border-primary min-h-[44px] px-6 sm:px-8 py-3
               hover:bg-primary hover:text-surface active:scale-[0.98]
               focus-visible:ring-2 focus-visible:ring-primary/50 }
```

**Правила:**
- Минимальная высота: **44px** (WCAG touch target)
- Hover: смена фона/рамки, без scale-трансформаций (избегать layout shift)
- Focus: `ring-2` с отступом `ring-offset-2`
- Активные состояния добавляются по мере необходимости: `btn-danger` (красная), `btn-ghost` (прозрачная)

### Карточки

```css
.card { bg-surface border border-surface-muted transition-all duration-300
        hover:shadow-lg hover:border-accent/20 cursor-pointer }
```

**Правила:**
- Паддинг: `p-5 sm:p-6 lg:p-8` (адаптивный)
- Hover: тень + золотая рамка
- 3D-tilt на десктопе (`use3DTilt`), без эффектов на тач-устройствах
- Изображения: `object-cover`, `loading="lazy"`

### Поля ввода

```css
.input-field { w-full px-4 py-3 border border-surface-muted min-h-[44px]
               focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20
               placeholder:text-text-muted/60 }
```

### Glass-эффекты

```css
.glass       { bg-surface/80 backdrop-blur-[12px] border border-surface-muted/50 }
.glass-dark  { bg-primary/80 backdrop-blur-[12px] border border-primary-light/20 text-text-inverse }
```

---

## 5. Анимации

### Принципы

| Правило | Причина |
|---|---|
| Длительность 150–300ms для микро-взаимодействий | UX-гайдлайн скилла — не раздражает, не тормозит |
| Длительность 400–600ms для секционных reveal | Плавное появление, ощущение премиальности |
| `prefers-reduced-motion` отключает ВСЕ анимации | Доступность |
| Нет бесконечных декоративных анимаций | Отвлекают, нарушают WCAG |
| Hover — только `transition-colors`, не `scale` | Scale сдвигает лейаут |
| На тач-устройствах — `@media (pointer: coarse) { hover: none }` | Hover не работает на мобильных |

### Существующие анимации (Framer Motion)

| Эффект | Где | Техника |
|---|---|---|
| Посимвольный reveal | Hero заголовок | Stagger `rotateX` + `opacity` |
| Parallax фона | Hero | `useScroll` + `useTransform(y)` |
| Scroll fade-out | Hero при скролле | `useTransform(opacity, [1, 0.6, 0])` |
| 3D tilt карточек | Каталог, Featured | `use3DTilt`: `perspective(800px) rotateX/Y` |
| Sticky showcase | Слайдер сортов | `position: sticky` + прогресс-доты |
| SVG кольца прогресса | Статистика | `strokeDashoffset` + `IntersectionObserver` |
| Аккордеон FAQ | Раскрытие | `AnimatePresence` + height-анимация |
| Stagger reveal | Карточки при скролле | `whileInView` с задержкой |
| Мобильное меню | Header | `AnimatePresence` + `height: 0 → auto` |

### Плановые анимации (сезонный режим, согласно ТЗ §6)

- **Падающий снег:** canvas/particles-эффект с возможностью отключения (кнопка в хедере)
- **Таймер обратного отсчёта:** анимированные цифры до Нового года на главной
- **Праздничные гирлянды:** SVG-декор на карточках товаров

---

## 6. Сетка и отступы

### Breakpoints (Tailwind default + custom)

| Префикс | Ширина | Целевое устройство |
|---|---|---|
| (нет) | 0–639px | Смартфон (mobile-first база) |
| `sm:` | 640px | Крупный смартфон |
| `md:` | 768px | Планшет |
| `lg:` | 1024px | Ноутбук |
| `xl:` | 1280px | Десктоп |

### Правила отступов

- **Секции:** `py-16 sm:py-20 lg:py-24`
- **Максимальная ширина контента:** `max-w-7xl` (1280px)
- **Горизонтальные отступы контейнера:** `px-4 sm:px-6 lg:px-8`
- **Grid-отступы:** `gap-6 lg:gap-8` (на грид-контейнере, не margin на дочерних)
- **Safe area:** учтены через `env(safe-area-inset-*)`

---

## 7. Иконки и изображения

### Правила

| Правило | ✅ | ❌ |
|---|---|---|
| Иконки | SVG (Heroicons, Lucide) | Эмодзи |
| Размер иконок | `w-6 h-6` (24×24), единый viewBox | Разнобой размеров |
| Бренд-лого | SVG через Simple Icons | Угаданный/неправильный логотип |
| Изображения товаров | SVG-иллюстрации (вектор), `loading="lazy"` | Растровые без оптимизации |
| Alt-текст | Всегда заполнен, описательный | Пустой или отсутствует |

### Текущий набор SVG-иллюстраций

```
public/images/
├── spruce-green.svg    — Ель обыкновенная/канадская (зелёная)
├── spruce-blue.svg     — Ель голубая (сине-зелёная)
├── spruce-serbian.svg  — Ель сербская (насыщенно-зелёная)
├── spruce-glauca.svg   — Ель колючая Glauca (серебристо-зелёная)
├── hero-forest.svg     — Фоновый лес для hero
└── nursery.svg         — Питомник (3 ели)
```

---

## 8. Доступность (A11Y)

| Требование | Реализация |
|---|---|
| Контрастность текста ≥ 4.5:1 | `text-primary` (#0C0A09) на `surface` (#FAFAF9) = 17.4:1 ✅ |
| Touch target ≥ 44px | `min-h-[44px]` на всех кнопках и инпутах |
| Видимый фокус | `focus-visible:ring-2 ring-offset-2` на всех интерактивных элементах |
| Семантический HTML | `<button>`, `<article>`, `<blockquote>`, `<label>`, `<nav>` |
| Атрибуты ARIA | `aria-label`, `aria-expanded`, `aria-live` |
| `prefers-reduced-motion` | Полное отключение анимаций |
| iOS zoom fix | `font-size: 16px` на инпутах при `max-width: 767px` |
| Screen reader | `sr-only` для скрытых лейблов, `alt` у изображений |

---

## 9. Мобильная адаптация (Mobile First)

### Принципы

- **Базовые стили = мобильные.** Все десктопные стили добавляются через `sm:`, `md:`, `lg:`.
- **Типографика уменьшается.** Заголовки: `text-4xl sm:text-6xl`, описания: `text-base sm:text-lg`.
- **Карточки — в 1 колонку.** Гриды: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- **3D-tilt и hover-эффекты отключены** на тач-устройствах (`pointer: coarse`).
- **Sticky-эффекты проверены** в iOS Safari (известные баги с `position: sticky`).
- **Safe area** учтён для iPhone с чёлкой.

### Чеклист мобильной вёрстки

- [ ] Нет горизонтального скролла
- [ ] Все кнопки ≥ 44×44px
- [ ] Текст читаемый без зума
- [ ] Формы не обрезаются
- [ ] Меню открывается/закрывается плавно
- [ ] Изображения не выходят за границы экрана
- [ ] Нет залипающих элементов, перекрывающих контент

---

## 10. Файлы дизайн-системы

| Файл | Содержание |
|---|---|
| `tailwind.config.mjs` | Цвета, шрифты, анимации, кастомные утилиты |
| `src/index.css` | Базовые стили, компонентные классы, safe-area, reduced-motion |
| `src/constants/images.ts` | Карта путей к SVG-иллюстрациям |
| `src/constants/app.ts` | Константы приложения (APP_NAME, API_BASE_URL) |
| `public/images/*.svg` | Иллюстрации товаров и фонов |
| `src/shared/hooks/use3DTilt.ts` | 3D-tilt эффект для карточек |
| `src/shared/hooks/useParallax.ts` | Parallax и scale-reveal для скролла |

---

## 11. Сезонный режим (TODO)

Согласно ТЗ §6, в период 15–31 декабря активируется праздничное оформление:

- [ ] Добавить токены `festive-green`, `festive-red`, `festive-gold` в tailwind.config
- [ ] Создать `SeasonalProvider` (React Context) с проверкой даты
- [ ] Разработать компонент `Snowfall` (canvas) с кнопкой отключения
- [ ] Разработать компонент `CountdownTimer` (до Нового года)
- [ ] Адаптировать HeroSection под сезонный режим (красные акценты, зелёные бейджи)
- [ ] Добавить анимацию гирлянд на карточках товаров
