import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { version as appVersion } from '../package.json';
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
const appVersionEl = document.getElementById('app-version');
const fileInput = document.getElementById('file-input');
const btnInstall = document.getElementById('btn-install');
const btnInstallWelcome = document.getElementById('btn-install-welcome');
const btnInstallHelp = document.getElementById('btn-install-help');
const btnHowto = document.getElementById('btn-howto');
const howtoDialog = document.getElementById('howto-dialog');
const installHint = document.getElementById('install-hint');
const dropOverlay = document.getElementById('drop-overlay');
const main = document.getElementById('main');

appVersionEl.textContent = `v${appVersion}`;
document.title = `Markdown Viewer v${appVersion}`;

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

  howtoDialog.showModal();
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
}

async function renderMarkdown(text, name = 'untitled.md') {
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
  document.documentElement.classList.add('is-reading');
  fileNameEl.textContent = name;
  document.title = `${name} · Markdown Viewer v${appVersion}`;
  main.scrollTop = 0;

  await renderMermaidDiagrams(content);
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
  const file = await handle.getFile();
  await openFile(file);
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  await openFile(file);
  fileInput.value = '';
});

btnHowto.addEventListener('click', () => howtoDialog.showModal());
btnInstallHelp.addEventListener('click', () => howtoDialog.showModal());

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
btnInstallWelcome.addEventListener('click', () => {
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
