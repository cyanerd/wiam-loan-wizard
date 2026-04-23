# Wiam Loan Wizard

SPA на React + TypeScript: три последовательные формы для подачи заявки на займ, с валидацией, кэшем категорий из публичного API и финальной модалкой подтверждения.

Тестовое задание для **Wiam Group** (Frontend middle+/senior).

**Затраченное время:** ~4 часа.

---

## Стек и обоснование выбора

| Библиотека                                 | Зачем                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **React 19** + **TypeScript** (strict)     | Требование ТЗ                                                                                                                                                      |
| **Vite 6**                                 | Быстрый dev, нативный TS/ESM, простая настройка `@/*` alias                                                                                                        |
| **react-hook-form**                        | Лучшая производительность среди form-библиотек (unmounted re-renders); `FormProvider` позволяет держать состояние wizard в одном источнике вместо отдельного стора |
| **zod** + **@hookform/resolvers**          | Единая схема даёт и валидацию, и TypeScript-тип через `z.infer` — одна точка правды                                                                                |
| **@tanstack/react-query**                  | Решает требование ТЗ «переиспользовать результат API для категорий» через `staleTime: Infinity`; из коробки обрабатывает pending/error/retry                       |
| **axios**                                  | Удобный API для POST/GET + typed responses                                                                                                                         |
| **react-router-dom 7**                     | Требование ТЗ (переключение между формами)                                                                                                                         |
| **TailwindCSS** + **@tailwindcss/forms**   | Утилити-классы без шума CSS-файлов; плагин forms нормализует стили инпутов и селектов во всех браузерах                                                            |
| **@headlessui/react**                      | Готовый `<Dialog>` с фокус-trap, Escape, ARIA — не нужно писать a11y-модалку с нуля                                                                                |
| **react-imask**                            | Маска телефона `0XXX XXX XXX`; активно поддерживается в отличие от заброшенного `react-input-mask`                                                                 |
| **clsx**                                   | Условные классы без конкатенации строк                                                                                                                             |
| **Vitest** + **Testing Library** + **MSW** | Быстрые тесты на том же Vite-конфиге; MSW мокает HTTP на уровне сети, не axios                                                                                     |
| **ESLint 9** (flat config)                 | Современный формат конфигов (eslintrc depricated); `typescript-eslint` v8 — единый пакет вместо двух                                                               |
| **pnpm**                                   | Быстрее npm, строгая hoisting-модель, `packageManager` пинится через corepack                                                                                      |
| **Docker** + nginx                         | Multi-stage сборка (21 MB итоговый образ), SPA history fallback через `try_files`                                                                                  |

---

## Быстрый старт

### Локально

Требуется **Node.js ≥ 20** (рекомендуется 24, см. `.nvmrc`) и **pnpm**. Если pnpm не установлен:

```bash
corepack enable          # активирует pnpm из коробки Node
```

Потом:

```bash
pnpm install
pnpm dev                 # http://localhost:5173
```

### Через Docker

```bash
docker compose up
```

Открыть <http://localhost:8080>.

---

## Скрипты

| Команда          | Что делает                           |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Dev-сервер Vite (HMR)                |
| `pnpm build`     | Production-сборка в `dist/`          |
| `pnpm preview`   | Локальный просмотр production-сборки |
| `pnpm test`      | Vitest в watch-режиме                |
| `pnpm test:ci`   | Один прогон тестов                   |
| `pnpm lint`      | ESLint                               |
| `pnpm typecheck` | `tsc --noEmit`                       |

---

## Переменные окружения

Файл `.env` уже есть в репозитории (только для dev - не содержит секретов):

```
VITE_API_BASE_URL=https://dummyjson.com
```

Если нужно указать другой базовый URL API - отредактируй `.env` или создай `.env.local`.

---

## Архитектура

- **Один `FormProvider`** на обёртке wizard (`WizardLayout`) - стейт формы сохраняется между роутами без дополнительного стейт-менеджера.
- **React Query с `staleTime: Infinity`** для категорий - один запрос на сессию, полностью решает требование ТЗ «переиспользовать результат».
- **sessionStorage** хранит черновик с debounce 500 мс, при случайном F5 данные восстанавливаются. После успешной подачи очищается.
- **Step guard** через `zod.safeParse` - прямой переход на `/step-2` без заполненного шага 1 даёт редирект.
- **SPA history fallback** в nginx - F5 на `/step-2` не даст 404.

---

## Структура проекта

```
src/
├── api/                   # axios-клиент и endpoints с zod-валидацией ответа
│   ├── client.ts
│   ├── categories.ts
│   └── loan.ts
├── ui/                    # переиспользуемые примитивы (generic по FieldValues)
│   ├── Button.tsx         # variant: primary | secondary | text
│   ├── FormField.tsx      # text input + label + error
│   ├── SelectField.tsx    # нативный select + label + error
│   ├── RangeField.tsx     # range slider с live-значением
│   ├── PhoneField.tsx     # маска 0XXX XXX XXX с авто-подстановкой 0
│   ├── FieldError.tsx     # inline-сообщение под полем
│   ├── ErrorBanner.tsx    # alert с опциональным retry
│   └── index.ts           # barrel + StringFieldPath/NumberFieldPath
├── features/loan-wizard/  # вся wizard-специфика
│   ├── schema.ts          # zod-схемы (шаги + draft)
│   ├── constants.ts       # defaultLoanValues, лимиты, GENDER_OPTIONS
│   ├── types.ts           # LoanFormValues (z.infer)
│   ├── WizardLayout.tsx   # entry: FormProvider + persistence + outlet
│   ├── steps/             # Step1Personal / Step2Address / Step3Loan
│   ├── components/        # WizardNav, StepIndicator, SuccessModal
│   ├── hooks/             # useStepGuard, useDraftPersistence, useScrollToTop
│   └── utils/             # pluralizeDay
├── styles/                # Tailwind + range.css
└── test/                  # Vitest + MSW handlers
```

---

## Тесты

Шесть файлов, 34 теста:

| Файл                           | Что проверяет                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `schema.test.ts`               | zod-валидация всех трёх шагов                                                                             |
| `pluralize.test.ts`            | склонение «день/дня/дней»                                                                                 |
| `PhoneField.test.tsx`          | маска телефона и авто-подстановка `0`                                                                     |
| `useDraftPersistence.test.tsx` | debounce записи, отключение персистенса при ошибке, clearDraft                                            |
| `wizard.test.tsx`              | навигация, сохранение данных при Back, step guard, F5, устойчивость `readDraft`, categories error + retry |
| `submit.test.tsx`              | happy-path до модалки + ошибка submit + retry                                                             |

Запуск: `pnpm test:ci`.
