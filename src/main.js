import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import './style.css';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
});

const welcome = document.getElementById('welcome');
const content = document.getElementById('content');
const fileNameEl = document.getElementById('file-name');
const fileInput = document.getElementById('file-input');
const btnOpen = document.getElementById('btn-open');
const btnInstall = document.getElementById('btn-install');
const btnInstallBanner = document.getElementById('btn-install-banner');
const btnInstallHelp = document.getElementById('btn-install-help');
const btnDismissBanner = document.getElementById('btn-dismiss-banner');
const btnHowto = document.getElementById('btn-howto');
const howtoDialog = document.getElementById('howto-dialog');
const installBanner = document.getElementById('install-banner');
const dropOverlay = document.getElementById('drop-overlay');
const main = document.getElementById('main');

const BANNER_DISMISS_KEY = 'md-viewer-hide-install-banner';

let deferredInstallPrompt = null;

function isRunningAsInstalledApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches
  );
}

function syncInstallUi() {
  const asApp = isRunningAsInstalledApp();
  document.documentElement.classList.toggle('is-installed-app', asApp);

  const dismissed = sessionStorage.getItem(BANNER_DISMISS_KEY) === '1';
  installBanner.hidden = asApp || dismissed;

  // Always offer install entry in browser tab; prompt() only if event is available.
  btnInstall.hidden = asApp;
}

async function promptInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    syncInstallUi();
    return;
  }

  howtoDialog.showModal();
}

function isMarkdownName(name) {
  return /\.(md|markdown|mdown|mkd)$/i.test(name || '');
}

function renderMarkdown(text, name = 'untitled.md') {
  const dirty = md.render(text);
  const clean = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });

  content.innerHTML = clean;
  content.querySelectorAll('a[href^="http"]').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  welcome.hidden = true;
  content.hidden = false;
  fileNameEl.textContent = name;
  document.title = `${name} · Markdown Viewer`;
  main.scrollTop = 0;
}

async function openFile(file) {
  if (!file) return;
  if (!isMarkdownName(file.name) && file.type && !file.type.includes('markdown') && file.type !== 'text/plain') {
    alert('Откройте файл с расширением .md / .markdown');
    return;
  }
  const text = await file.text();
  renderMarkdown(text, file.name);
}

async function openHandle(handle) {
  const file = await handle.getFile();
  await openFile(file);
}

btnOpen.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  await openFile(file);
  fileInput.value = '';
});

btnHowto.addEventListener('click', () => howtoDialog.showModal());
btnInstallHelp.addEventListener('click', () => howtoDialog.showModal());
btnDismissBanner.addEventListener('click', () => {
  sessionStorage.setItem(BANNER_DISMISS_KEY, '1');
  installBanner.hidden = true;
});

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  syncInstallUi();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  syncInstallUi();
  alert(
    'Приложение установлено.\n\nЗакройте эту вкладку и откройте «Markdown Viewer» из меню приложений Ubuntu — так оно будет отдельным окном без адресной строки.',
  );
});

btnInstall.addEventListener('click', () => {
  void promptInstall();
});
btnInstallBanner.addEventListener('click', () => {
  void promptInstall();
});

window.matchMedia('(display-mode: standalone)').addEventListener('change', syncInstallUi);
syncInstallUi();

// Drag and drop
let dragDepth = 0;

function hasFiles(event) {
  return Array.from(event.dataTransfer?.types || []).includes('Files');
}

window.addEventListener('dragenter', (event) => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  dragDepth += 1;
  dropOverlay.hidden = false;
});

window.addEventListener('dragleave', (event) => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropOverlay.hidden = true;
});

window.addEventListener('dragover', (event) => {
  if (!hasFiles(event)) return;
  event.preventDefault();
});

window.addEventListener('drop', async (event) => {
  if (!hasFiles(event)) return;
  event.preventDefault();
  dragDepth = 0;
  dropOverlay.hidden = true;
  const file = event.dataTransfer.files?.[0];
  await openFile(file);
});

// OS file open via File Handling API (Chromium desktop)
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files?.length) return;
    for (const handle of launchParams.files) {
      try {
        await openHandle(handle);
      } catch (error) {
        console.error('Failed to open launched file', error);
        alert('Не удалось открыть файл. Разрешите доступ, если браузер спросил.');
      }
    }
  });
}
