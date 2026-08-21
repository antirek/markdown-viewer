# Markdown Viewer

PWA для просмотра локальных `.md` файлов (только чтение).

## Ссылки

- Репозиторий: https://github.com/antirek/markdown-viewer
- Приложение (GitHub Pages): https://antirek.github.io/markdown-viewer/

## Локальный запуск

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

## Деплой на GitHub Pages

Уже настроен workflow `.github/workflows/deploy-pages.yml`.

1. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Запушьте `main` (или вручную запустите workflow **Deploy GitHub Pages**).
3. Через 1–2 минуты сайт будет на https://antirek.github.io/markdown-viewer/

## Возможности MVP

- Рендер Markdown (markdown-it) + санитизация (DOMPurify)
- Drag-and-drop и кнопка «Открыть .md»
- PWA: установка как приложение
- `file_handlers` + `launchQueue` — открытие `.md` из ОС (Chromium)
- Инструкция для Ubuntu («Как на Ubuntu»)

## Проверка открытия из ОС

1. Откройте Pages-URL в Chrome и установите приложение.
2. ПКМ по `.md` → «Открыть с помощью» → Markdown Viewer.
