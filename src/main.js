import { onLaunchedFiles, readLaunchedHandle } from './launch-files.js';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { version as appVersion } from '../package.json';
import { createMermaidLightbox, enhanceMermaidDiagrams } from './mermaid-lightbox.js';
import {
  detectPlatform,
  fillHowtoDialog,
  isChromiumBrowser,
  platformLabel,
} from './platform.js';
import './style.css';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
});

const welcome = document.getElementById('welcome');
const content = document.getElementById('content');
const reader = document.getElementById('reader');
const sourcePanel = document.getElementById('source-panel');
const sourceView = document.getElementById('source-view');
const fileNameEl = document.getElementById('file-name');
const appVersionEl = document.getElementById('app-version');
const fileInput = document.getElementById('file-input');
const btnSource = document.getElementById('btn-source');
const btnSourceClose = document.getElementById('btn-source-close');
const btnInstall = document.getElementById('btn-install');
const btnInstallWelcome = document.getElementById('btn-install-welcome');
const btnInstallHelp = document.getElementById('btn-install-help');
const btnHowto = document.getElementById('btn-howto');
const howtoDialog = document.getElementById('howto-dialog');
const installHint = document.getElementById('install-hint');
const dropOverlay = document.getElementById('drop-overlay');
const main = document.getElementById('main');
const mermaidLightbox = createMermaidLightbox(document.getElementById('app'));
const detectedPlatform = detectPlatform();
let selectedHowtoPlatform = detectedPlatform;
let currentSourceText = '';
let sourceOpen = false;

appVersionEl.textContent = `v${appVersion}`;
document.title = `Markdown Viewer v${appVersion}`;

function openHowto(platform = selectedHowtoPlatform) {
  selectedHowtoPlatform = platform || detectPlatform();
  fillHowtoDialog(howtoDialog, selectedHowtoPlatform);
  if (typeof howtoDialog.showModal === 'function') {
    howtoDialog.showModal();
  } else {
    howtoDialog.setAttribute('open', '');
  }
}

btnHowto.textContent = 'Как установить';
btnInstallHelp.textContent = `Как установить на ${platformLabel(detectedPlatform)}`;

btnHowto.addEventListener('click', () => openHowto(detectedPlatform));
btnInstallHelp.addEventListener('click', () => openHowto(detectedPlatform));

howtoDialog.querySelectorAll('[data-platform-tab]').forEach((tab) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    selectedHowtoPlatform = tab.dataset.platformTab;
    fillHowtoDialog(howtoDialog, selectedHowtoPlatform);
  });
});

fillHowtoDialog(howtoDialog, selectedHowtoPlatform);

howtoDialog.addEventListener('click', (event) => {
  if (event.target === howtoDialog) {
    howtoDialog.close();
  }
});

howtoDialog.querySelectorAll('[data-dialog-close]').forEach((btn) => {
  btn.addEventListener('click', () => howtoDialog.close());
});

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

  const showInstall = !asApp;
  btnInstall.hidden = !showInstall;
  btnInstallWelcome.hidden = !showInstall;
  installHint.hidden = !showInstall;
}

async function promptInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    syncInstallUi();
    return;
  }

  openHowto(detectedPlatform);
}

function isMarkdownName(name) {
  return /\.(md|markdown|mdown|mkd)$/i.test(name || '');
}

let mermaidReady = null;

async function ensureMermaid() {
  if (!mermaidReady) {
    mermaidReady = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'strict',
        fontFamily: 'Source Sans 3, sans-serif',
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

async function renderMermaidDiagrams(root) {
  const codeBlocks = [...root.querySelectorAll('pre > code.language-mermaid')];
  if (!codeBlocks.length) return;

  const mermaid = await ensureMermaid();
  const nodes = [];

  for (const code of codeBlocks) {
    const pre = code.parentElement;
    if (!pre) continue;

    const container = document.createElement('div');
    container.className = 'mermaid-diagram';
    const diagram = document.createElement('div');
    diagram.className = 'mermaid';
    diagram.textContent = code.textContent ?? '';
    container.appendChild(diagram);
    pre.replaceWith(container);
    nodes.push(diagram);
  }

  try {
    await mermaid.run({ nodes });
  } catch (error) {
    console.error('Mermaid render failed', error);
  }

  enhanceMermaidDiagrams(root, mermaidLightbox);
}

async function renderMarkdown(text, name = 'untitled.md') {
  currentSourceText = text;
  sourceView.textContent = text;

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
  reader.hidden = false;
  btnSource.hidden = false;
  document.documentElement.classList.add('is-reading');
  fileNameEl.textContent = name;
  document.title = `${name} · Markdown Viewer v${appVersion}`;
  main.scrollTop = 0;

  await renderMermaidDiagrams(content);
}

function setSourceOpen(open) {
  sourceOpen = open;
  sourcePanel.hidden = !open;
  document.documentElement.classList.toggle('source-open', open);
  btnSource.setAttribute('aria-pressed', open ? 'true' : 'false');
  btnSource.classList.toggle('is-active', open);
}

function toggleSource() {
  setSourceOpen(!sourceOpen);
}

async function openFile(file) {
  if (!file) return;
  if (!isMarkdownName(file.name) && file.type && !file.type.includes('markdown') && file.type !== 'text/plain') {
    alert('Откройте файл с расширением .md / .markdown');
    return;
  }
  const text = await file.text();
  await renderMarkdown(text, file.name);
}

async function openHandle(handle) {
  const file = await readLaunchedHandle(handle);
  await openFile(file);
}

onLaunchedFiles(async (handles) => {
  let opened = 0;
  for (const handle of handles) {
    try {
      await openHandle(handle);
      opened += 1;
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

btnSource.addEventListener('click', () => toggleSource());
btnSourceClose.addEventListener('click', () => setSourceOpen(false));

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sourceOpen && !document.documentElement.classList.contains('mermaid-lightbox-open')) {
    setSourceOpen(false);
  }
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  await openFile(file);
  fileInput.value = '';
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
    `Приложение установлено.\n\nЗакройте эту вкладку и откройте «Markdown Viewer» как отдельное приложение на ${platformLabel(detectedPlatform)} — так оно будет без адресной строки.`,
  );
});

btnInstall.addEventListener('click', () => {
  void promptInstall();
});
btnInstallWelcome.addEventListener('click', () => {
  void promptInstall();
});

if (!isChromiumBrowser()) {
  btnInstallHelp.textContent = `Нужен Chrome/Edge · инструкция для ${platformLabel(detectedPlatform)}`;
}
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
