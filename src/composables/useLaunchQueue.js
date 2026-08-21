import { onLaunchedFiles, readLaunchedHandle } from '../lib/launchFiles.js';

export function useLaunchQueue({ openFile } = {}) {
  onLaunchedFiles(async (handles) => {
    let opened = 0;
    for (const handle of handles) {
      try {
        const file = await readLaunchedHandle(handle);
        const ok = await openFile?.(file);
        if (ok) opened += 1;
      } catch (error) {
        console.error('Failed to open launched file', error);
        if (error?.message === 'permission-denied') {
          alert('Нет доступа к файлу. Разрешите чтение, когда Chrome спросит.');
        } else {
          alert('Не удалось открыть файл из ОС. Попробуйте ещё раз или откройте через «Открыть .md».');
        }
      }
    }
    if (!opened && handles.length) {
      alert('Файл передан в приложение, но не удалось его прочитать.');
    }
  });
}
