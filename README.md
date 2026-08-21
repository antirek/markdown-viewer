# Markdown Viewer

PWA для просмотра локальных `.md` файлов (только чтение).

## Запуск

```bash
npm install
npm run dev
```

Откройте URL из терминала в **Chrome / Chromium**. Для проверки установки PWA нужен HTTPS или `localhost`.

Сборка:

```bash
npm run build
npm run preview
```

## Возможности MVP

- Рендер Markdown (markdown-it) + санитизация (DOMPurify)
- Drag-and-drop и кнопка «Открыть .md»
- PWA: установка как приложение
- `file_handlers` + `launchQueue` — открытие `.md` из ОС (Chromium)
- Инструкция для Ubuntu («Как на Ubuntu»)

## Проверка открытия из ОС

1. `npm run build && npm run preview` (или задеплойте на HTTPS).
2. Установите приложение в Chrome.
3. ПКМ по `.md` → «Открыть с помощью» → Markdown Viewer.
