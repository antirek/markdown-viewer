/**
 * Platform detection + install instructions for the PWA.
 */

export const PLATFORMS = ['windows', 'macos', 'linux'];

export function detectPlatform() {
  const uaDataPlatform = navigator.userAgentData?.platform || '';
  const platform = uaDataPlatform || navigator.platform || '';
  const ua = navigator.userAgent || '';

  if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'windows';
  if (/Mac/i.test(platform) || /Mac OS|Macintosh/i.test(ua)) return 'macos';
  if (/Linux/i.test(platform) || /Linux|X11/i.test(ua) || /CrOS/i.test(ua)) return 'linux';
  return 'linux';
}

export function detectBrowser() {
  const ua = navigator.userAgent || '';
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'chrome';
  if (/Chromium/i.test(ua)) return 'chromium';
  if (/Firefox\//i.test(ua)) return 'firefox';
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'safari';
  return 'other';
}

export function isChromiumBrowser(browser = detectBrowser()) {
  return browser === 'chrome' || browser === 'chromium' || browser === 'edge';
}

const LABELS = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
};

const BROWSER_LABELS = {
  chrome: 'Chrome',
  chromium: 'Chromium',
  edge: 'Edge',
  firefox: 'Firefox',
  safari: 'Safari',
  other: 'браузере',
};

export function platformLabel(id) {
  return LABELS[id] || id;
}

export function browserLabel(id = detectBrowser()) {
  return BROWSER_LABELS[id] || BROWSER_LABELS.other;
}

export const INSTRUCTIONS = {
  windows: {
    title: 'Установка на Windows',
    steps: [
      'Откройте сайт в <strong>Google Chrome</strong> или <strong>Microsoft Edge</strong>.',
      'Нажмите «Установить» на странице или меню ⋮ → <strong>Установить приложение…</strong> / <strong>Install Markdown Viewer…</strong>.',
      'Закройте вкладку. Запускайте <strong>Markdown Viewer</strong> из меню «Пуск» или с рабочего стола — окно будет без адресной строки.',
      'ПКМ по файлу <code>.md</code> → <strong>Открыть с помощью</strong> → выберите Markdown Viewer → <strong>Всегда использовать это приложение</strong>.',
      'Либо: Параметры Windows → Приложения → <strong>Приложения по умолчанию</strong> → найти Markdown Viewer / связать с <code>.md</code>.',
    ],
    tip: 'Safari и Firefox для системного открытия <code>.md</code> не подходят — нужен Chrome или Edge.',
  },
  macos: {
    title: 'Установка на macOS',
    steps: [
      'Откройте сайт в <strong>Google Chrome</strong> или <strong>Microsoft Edge</strong> (не в Safari).',
      'Нажмите «Установить» или меню Chrome ⋮ → <strong>Установить Markdown Viewer…</strong>.',
      'Закройте вкладку. Запускайте приложение из <strong>Launchpad</strong> / папки «Программы» / Dock.',
      'В Finder: ПКМ по <code>.md</code> → <strong>Свойства</strong> (Get Info).',
      'В блоке «Открывать в программе» выберите <strong>Markdown Viewer</strong> → нажмите <strong>Изменить все…</strong>.',
    ],
    tip: 'Safari умеет «добавить на Dock», но File Handling API для <code>.md</code> там обычно нет — для двойного клика нужен Chrome/Edge.',
  },
  linux: {
    title: 'Установка на Linux',
    steps: [
      'Откройте сайт в <strong>Google Chrome</strong> или Chromium (не Firefox).',
      'Нажмите «Установить» или меню ⋮ → <strong>Установить приложение…</strong>.',
      'Закройте вкладку. Запускайте <strong>Markdown Viewer</strong> из меню приложений (GNOME Activities → поиск «Markdown») или из <code>chrome://apps</code>.',
      'ПКМ по <code>.md</code> → «Открыть с помощью» → Markdown Viewer → «Всегда».',
    ],
    tip: 'Через терминал (подставьте имя <code>.desktop</code> из <code>~/.local/share/applications/</code>):',
    code: `ls ~/.local/share/applications/ | grep -i chrome
xdg-mime default chrome-XXXX-Default.desktop text/markdown
xdg-mime query default text/markdown`,
  },
};

export function fillHowtoDialog(dialog, preferredPlatform = detectPlatform()) {
  if (!dialog) return;

  const titleEl = dialog.querySelector('[data-howto-title]');
  const stepsEl = dialog.querySelector('[data-howto-steps]');
  const tipEl = dialog.querySelector('[data-howto-tip]');
  const codeEl = dialog.querySelector('[data-howto-code]');
  const detectedEl = dialog.querySelector('[data-howto-detected]');
  const tabs = [...dialog.querySelectorAll('[data-platform-tab]')];

  // Old cached HTML without the new markup — nothing to fill.
  if (!titleEl || !stepsEl) {
    console.warn('Howto dialog markup is outdated; hard-refresh the page.');
    return;
  }

  const data = INSTRUCTIONS[preferredPlatform] || INSTRUCTIONS.linux;
  const detected = detectPlatform();
  const browser = detectBrowser();

  titleEl.textContent = data.title;
  stepsEl.innerHTML = data.steps.map((step) => `<li>${step}</li>`).join('');

  if (tipEl) {
    tipEl.innerHTML = data.tip || '';
    tipEl.hidden = !data.tip;
  }

  if (codeEl) {
    if (data.code) {
      codeEl.textContent = data.code;
      codeEl.hidden = false;
    } else {
      codeEl.textContent = '';
      codeEl.hidden = true;
    }
  }

  if (detectedEl) {
    detectedEl.textContent = `Сейчас: ${platformLabel(detected)} · ${browserLabel(browser)}`;
  }

  tabs.forEach((tab) => {
    const active = tab.dataset.platformTab === preferredPlatform;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}
