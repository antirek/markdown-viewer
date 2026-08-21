<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { version as appVersion } from '../package.json';
import TopBar from './components/TopBar.vue';
import Welcome from './components/Welcome.vue';
import DropOverlay from './components/DropOverlay.vue';
import Reader from './components/reader/Reader.vue';
import HowtoDialog from './components/howto/HowtoDialog.vue';
import { useMarkdownRenderer } from './composables/useMarkdownRenderer.js';
import { useFileOpen } from './composables/useFileOpen.js';
import { useLaunchQueue } from './composables/useLaunchQueue.js';
import { useMermaid } from './composables/useMermaid.js';
import { usePlatformHowto } from './composables/usePlatformHowto.js';
import { usePwaInstall } from './composables/usePwaInstall.js';
import { useSourcePanel } from './composables/useSourcePanel.js';
import { createMermaidLightbox } from './lib/mermaidLightbox.js';
import { platformLabel } from './lib/platform.js';

const fileName = ref('файл не выбран');
const isReading = ref(false);
const readerRef = ref(null);
let lightbox = null;

const { html, source, render } = useMarkdownRenderer();
const { isOpen: sourceOpen, setOpen: setSourceOpen, toggle: toggleSource } = useSourcePanel();

const {
  platforms,
  detectedPlatform,
  selectedPlatform,
  dialogOpen,
  payload,
  chromium,
  selectPlatform,
  open: openHowto,
} = usePlatformHowto();

const mermaid = useMermaid({
  onExpand(container) {
    lightbox?.open(container);
  },
});

const { isDragging, openFile } = useFileOpen({
  async onOpenText(text, name) {
    render(text);
    fileName.value = name;
    isReading.value = true;
    document.documentElement.classList.add('is-reading');
    document.title = `${name} · Markdown Viewer v${appVersion}`;
  },
});

useLaunchQueue({ openFile });

const { isInstalled, promptInstall } = usePwaInstall({
  onNeedHowto: () => openHowto(),
});

const showInstall = computed(() => !isInstalled.value);
const installHelpText = computed(() =>
  chromium
    ? `Как установить на ${platformLabel(detectedPlatform)}`
    : `Нужен Chrome/Edge · инструкция для ${platformLabel(detectedPlatform)}`,
);

watch(html, async () => {
  if (!isReading.value) return;
  await nextTick();
  const el = readerRef.value?.getMarkdownEl?.();
  if (el) await mermaid.renderIn(el);
});

async function onFileSelected(file) {
  await openFile(file);
}

async function onInstall() {
  await promptInstall();
}

function onHowto() {
  openHowto();
}

function onKeydown(event) {
  if (event.key !== 'Escape') return;
  if (document.documentElement.classList.contains('mermaid-lightbox-open')) return;
  if (sourceOpen.value) setSourceOpen(false);
}

onMounted(() => {
  lightbox = createMermaidLightbox(document.body);
  window.addEventListener('keydown', onKeydown);
  document.title = `Markdown Viewer v${appVersion}`;
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <div id="app-root">
    <TopBar
      :version="appVersion"
      :file-name="fileName"
      :show-source-btn="isReading"
      :source-open="sourceOpen"
      :show-install="showInstall"
      @file-selected="onFileSelected"
      @toggle-source="toggleSource"
      @install="onInstall"
      @howto="onHowto"
    />

    <main class="main">
      <Welcome
        v-show="!isReading"
        :show-install="showInstall"
        :install-help-text="installHelpText"
        @install="onInstall"
        @howto="onHowto"
      />

      <Reader
        v-show="isReading"
        ref="readerRef"
        :source-open="sourceOpen"
        :source="source"
        :html="html"
        @close-source="setSourceOpen(false)"
      />
    </main>

    <DropOverlay :visible="isDragging" />

    <HowtoDialog
      v-model:open="dialogOpen"
      :payload="payload"
      :platforms="platforms"
      :selected-platform="selectedPlatform"
      @select-platform="selectPlatform"
    />
  </div>
</template>
